import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Copy, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
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
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [paywall, setPaywall] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentConvIdRef = useRef<string | null>(null);

  // Load conversation when conversationId changes
  useEffect(() => {
    currentConvIdRef.current = conversationId;
    setPaywall(null);
    setInput("");

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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

  const send = async () => {
    const text = input.trim();
    if (!text || busy || !session) return;

    setInput("");
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
        setInput(text);
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
          setMessages(messages);
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
        setInput(text);
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
      let done = false;
      let eventName = "";
      let streamError: string | null = null;
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
        if (data === "[DONE]") {
          done = true;
          eventName = "";
          return;
        }
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
            streamError = j.error?.message ?? j.response?.error?.message ?? "The AI stream ended unexpectedly.";
            done = true;
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

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) {
          if (buf.trim()) processSseLine(buf);
          break;
        }
        buf += decoder.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n")) !== -1) {
          const line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          processSseLine(line);
          if (done) break;
        }
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

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-4 md:px-6 py-3">
        <h2 className="font-display font-semibold text-primary">{title}</h2>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        {loadingHistory && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loadingHistory && messages.length === 0 && !paywall && (
          <div className="max-w-2xl mx-auto text-center py-8 md:py-16">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">{intro}</p>
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`group max-w-[92%] md:max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {m.role === "assistant" ? (
                  <>
                    <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground prose-code:text-accent prose-code:bg-accent-soft prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                      {m.content ? (
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      ) : (
                        <span className="inline-flex gap-1 items-center text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "150ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "300ms" }} />
                        </span>
                      )}
                    </div>
                    {m.content && (
                      <button
                        onClick={() => copy(m.content, i)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-base opacity-0 group-hover:opacity-100"
                      >
                        {copiedIdx === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {copiedIdx === i ? "Copied" : "Copy"}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))}

          {paywall && (
            <div className="rounded-xl border border-accent/30 bg-accent-soft p-5 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-primary">{paywall}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Upgrade to Professional for unlimited queries, faster responses, and priority access.
                  </p>
                  <Button asChild size="sm" className="mt-3">
                    <a href="/#pricing">View pricing</a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
          <div className="relative flex items-end gap-2 rounded-xl border border-border bg-background p-2 focus-within:border-accent transition-base">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder={placeholder}
              disabled={busy || !!paywall}
              className="min-h-[48px] max-h-40 border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-2"
              rows={1}
            />
            <Button onClick={send} disabled={busy || !input.trim() || !!paywall} size="icon" className="shrink-0 h-9 w-9">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground text-center">
            Always verify AI output before client use. Press Enter to send, Shift+Enter for newline.
          </p>
        </div>
      </div>
    </div>
  );
};
