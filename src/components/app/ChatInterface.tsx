import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { toast } from "sonner";
import { Copy, Check, Loader2, AlertCircle, FileText, ShieldAlert } from "lucide-react";
import type { RouterTelemetry } from "@/components/app/SystemOneTelemetry";

type Tool = "qa" | "notice" | "email" | "caselaw";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  tool: Tool;
  title: string;
  placeholder: string;
  intro: string;
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
  onConversationUpdated?: () => void;
  onUsage?: () => void;
  onTelemetry?: (telemetry: RouterTelemetry) => void;
}

export const ChatInterface = ({
  tool,
  title,
  placeholder,
  intro,
  conversationId,
  onConversationCreated,
  onConversationUpdated,
  onUsage,
  onTelemetry,
}: Props) => {
  const { session, user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [paywall, setPaywall] = useState<string | null>(null);
  const [safetyBlockMessage, setSafetyBlockMessage] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentConvIdRef = useRef<string | null>(null);

  // Load conversation when conversationId changes
  useEffect(() => {
    currentConvIdRef.current = conversationId;
    setPaywall(null);
    setSafetyBlockMessage(null);

    if (!conversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoadingHistory(true);
    supabase
      .from("conversations")
      .select("messages")
      .eq("id", conversationId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const msgs = (data?.messages as unknown as Msg[]) || [];
        setMessages(msgs);
        setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const persist = async (msgs: Msg[]) => {
    if (!user) return;
    const convId = currentConvIdRef.current;
    if (convId) {
      await supabase.from("conversations").update({ messages: msgs as any }).eq("id", convId);
      onConversationUpdated?.();
    } else {
      const firstUser = msgs.find((m) => m.role === "user");
      const title = firstUser ? firstUser.content.slice(0, 80) : "New chat";
      const { data } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, tool, title, messages: msgs as any })
        .select("id")
        .single();
      if (data?.id) {
        currentConvIdRef.current = data.id;
        onConversationCreated(data.id);
      }
    }
  };

  const send = async (value: string) => {
    const text = value.trim();
    if (!text || busy || !session) return;

    setSafetyBlockMessage(null);
    const userMsg: Msg = { role: "user", content: text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setBusy(true);
    onTelemetry?.({ stage: "routing" });

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tax-ai`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ tool, messages: newMsgs }),
      });

      if (resp.status === 402) {
        const j = await resp.json().catch(() => ({}));
        setPaywall(j.message || "Trial limit reached. Upgrade to continue.");
        setMessages(newMsgs.slice(0, -1));
        setBusy(false);
        return;
      }
      if (!resp.ok) {
        const responseBody = await resp.json().catch(() => ({}));
        const responseMessage = typeof responseBody.message === "string"
          ? responseBody.message
          : typeof responseBody.error === "string"
            ? responseBody.error
            : "The request could not be completed. Please try again.";
        if (resp.status === 403 && responseBody.telemetry) {
          onTelemetry?.({ ...responseBody.telemetry, stage: "blocked" });
          setMessages(newMsgs);
          setSafetyBlockMessage(responseMessage);
          toast.error("System One stopped this request for safety.");
          setBusy(false);
          return;
        }
        if (resp.status === 429) {
          toast.error(responseMessage || "Too many requests. Please wait a moment.");
        } else {
          toast.error(responseMessage);
        }
        setMessages(newMsgs.slice(0, -1));
        setBusy(false);
        return;
      }
      if (!resp.body) {
        toast.error("Failed to get a response. Please try again.");
        setMessages(newMsgs.slice(0, -1));
        setBusy(false);
        return;
      }

      const telemetryHeader = resp.headers.get("X-System-One-Telemetry");
      let generationStartedAt = performance.now();
      if (telemetryHeader) {
        try {
          const routingTelemetry = JSON.parse(decodeURIComponent(telemetryHeader)) as Omit<RouterTelemetry, "stage">;
          generationStartedAt = performance.now();
          onTelemetry?.({ ...routingTelemetry, stage: "escalating" });
        } catch {
          onTelemetry?.({ stage: "escalating" });
        }
      } else {
        onTelemetry?.({ stage: "escalating" });
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let acc = "";
      let streamClosed = false;
      let eventName = "";
      let streamError: string | null = null;
      let streamDenied: string | null = null;
      let streamRefusal: string | null = null;
      let requestBlocked = false;
      let latestTelemetry: Omit<RouterTelemetry, "stage"> = {};

      const processSseLine = (line: string) => {
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
          return;
        }
        if (!line.startsWith("data:")) return;
        const data = line.slice(5).trim();
        if (data === "[DONE]") { eventName = ""; return; }
        if (!data) return;
        try {
          const j = JSON.parse(data);
          if (eventName === "telemetry" || j.type === "telemetry") {
            latestTelemetry = { ...latestTelemetry, ...j };
            if (j.stage === "blocked") {
              requestBlocked = true;
              onTelemetry?.({ ...j, stage: "blocked" });
              return;
            }
            if (j.stage === "complete") {
              onTelemetry?.({ ...j, stage: "complete" });
              return;
            }
          }

          if (j.type === "response.failed" || j.type === "error" || j.error) {
            streamError = j.error?.message ?? j.message ?? j.response?.error?.message ?? "The AI stream ended unexpectedly.";
            return;
          }
          if (eventName === "denied" || j.type === "denied") {
            streamDenied = j.message ?? "AI provider access is denied.";
            return;
          }
          if (eventName === "refusal" || j.type === "refusal") {
            streamRefusal = j.message ?? "The provider refused this request.";
            return;
          }
          const delta = j.type === "response.output_text.delta"
            ? j.delta
            : j.choices?.[0]?.delta?.content;
          if (typeof delta === "string") {
            acc += delta;
            setMessages((current) => {
              const updated = [...current];
              updated[updated.length - 1] = { role: "assistant", content: acc };
              return updated;
            });
          }
          if (j.type === "response.completed" && !acc) {
            const completedText = j.response?.output?.flatMap((item: { content?: { type?: string; text?: string }[] }) => item.content ?? [])
              .filter((item: { type?: string; text?: string }) => item.type === "output_text" && typeof item.text === "string")
              .map((item: { text: string }) => item.text)
              .join("");
            if (completedText) {
              acc = completedText;
              setMessages((current) => {
                const updated = [...current];
                updated[updated.length - 1] = { role: "assistant", content: acc };
                return updated;
              });
            }
          }
        } catch {
          // Incomplete or non-JSON event data is ignored until the next SSE data line.
        } finally {
          eventName = "";
        }
      };

      // Add empty assistant placeholder
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (!streamClosed) {
        const { done: d, value } = await reader.read();
        if (d) {
          if (buf.trim()) processSseLine(buf);
          streamClosed = true;
          break;
        }
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          processSseLine(line);
        }
      }

      if (streamDenied || streamRefusal) {
        const message = streamDenied ?? streamRefusal ?? "The provider could not complete this request.";
        toast.error(message);
        setMessages(newMsgs);
        onTelemetry?.({ stage: "error" });
        return;
      }

      if (streamError) {
        toast.error(streamError);
        setMessages(newMsgs);
        onTelemetry?.({ stage: "error" });
        return;
      }

      if (requestBlocked) {
        setMessages(messages);
        toast.error("System One stopped this request for safety.");
        return;
      }

      if (!acc.trim()) {
        toast.error("The AI service ended without an answer. Please try again.");
        setMessages(newMsgs);
        onTelemetry?.({ stage: "error" });
        return;
      }

      onTelemetry?.({
        ...latestTelemetry,
        stage: "complete",
        generationLatencyMs: typeof latestTelemetry.generationLatencyMs === "number"
          ? latestTelemetry.generationLatencyMs
          : Math.round(performance.now() - generationStartedAt),
      });

      // Persist completed exchange
      const finalMsgs: Msg[] = [...newMsgs, { role: "assistant", content: acc }];
      persist(finalMsgs).catch((e) => console.error("Persist failed", e));

      onUsage?.();
    } catch (e) {
      console.error(e);
      toast.error("Network error. Please retry.");
      setMessages(newMsgs);
      onTelemetry?.({ stage: "error" });
    } finally {
      setBusy(false);
    }
  };

  const copy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 md:px-6 py-3">
        <h2 className="font-display font-semibold text-primary">{title}</h2>
      </div>

      {/* Messages */}
      <Conversation className="min-h-0 flex-1">
        <ConversationContent className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
          {loadingHistory && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
          {!loadingHistory && messages.length === 0 && !paywall && (
            <ConversationEmptyState
              className="min-h-64"
              icon={<FileText className="mx-auto h-6 w-6" />}
              title={title}
              description={intro}
            />
          )}
          {messages.map((m, i) => (
            <Message key={`${i}-${m.role}`} from={m.role}>
              <MessageContent>
                {m.role === "assistant"
                  ? m.content
                    ? <MessageResponse>{m.content}</MessageResponse>
                    : <span aria-label="Generating response" className="inline-flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Preparing your answer</span>
                  : <p className="whitespace-pre-wrap">{m.content}</p>}
              </MessageContent>
              {m.role === "assistant" && m.content && (
                <MessageActions>
                  <MessageAction
                    aria-label={copiedIdx === i ? "Copied" : "Copy response"}
                    onClick={() => copy(m.content, i)}
                    tooltip={copiedIdx === i ? "Copied" : "Copy response"}
                  >
                    {copiedIdx === i ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </MessageAction>
                </MessageActions>
              )}
            </Message>
          ))}
          {safetyBlockMessage && (
            <div role="alert" className="flex items-start gap-3 border-y border-destructive/30 py-4 text-sm">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <p className="text-foreground">{safetyBlockMessage}</p>
            </div>
          )}
          {paywall && (
            <div className="flex items-start gap-3 border-y border-accent/30 py-5">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-primary">{paywall}</p>
                <p className="mt-1 text-sm text-muted-foreground">Upgrade to Professional for unlimited queries, faster responses, and priority access.</p>
                <Button asChild size="sm" className="mt-3"><a href="/#pricing">View pricing</a></Button>
              </div>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Composer */}
      <div className="border-t border-border bg-card px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-3xl mx-auto">
          {onTelemetry && (
            <div aria-live="polite" className="mb-2">
              {busy && (
                <p className="text-xs text-muted-foreground">System One is checking your request before it reaches the AI assistant.</p>
              )}
              {!busy && messages.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  System One {messages[messages.length - 1]?.role === "assistant" ? "routed this request to the answer service." : "is ready to review your next request."}
                </p>
              )}
            </div>
          )}
          <PromptInput
            className="rounded-md border border-border bg-background transition-base focus-within:border-accent"
            onSubmit={({ text }) => send(text)}
          >
            <PromptInputTextarea
              aria-label={`Message ${title}`}
              disabled={busy || !!paywall}
              placeholder={placeholder}
              className="min-h-14 max-h-40 px-3 py-3 text-sm"
            />
            <PromptInputFooter className="justify-end border-t-0 px-2 pb-2">
              <PromptInputSubmit
                aria-label="Send message"
                disabled={busy || !!paywall}
                status={busy ? "streaming" : "ready"}
              />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            Always verify AI output before client use. Press Enter to send, Shift+Enter for newline.
          </p>
        </div>
      </div>
    </div>
  );
};
