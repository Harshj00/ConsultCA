import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  parseSystemOneDecision,
  SYSTEM_ONE_ROUTING_QUESTIONS,
} from "../_shared/system-one-routing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (value: unknown, status: number) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const SYSTEM_PROMPTS: Record<string, string> = {
  qa: `You are ConsultYourCA AI — an expert assistant for Indian Chartered Accountants and CA students.

You have deep knowledge of:
- Income Tax Act, 1961 (all sections, rules, recent amendments through Finance Act 2024)
- Central Goods and Services Tax Act, 2017 (CGST/SGST/IGST/UTGST, all rules and notifications)
- Companies Act, 2013 (incorporation, compliance, audit, ROC filings)
- ICAI Standards on Auditing (SAs), Accounting Standards (AS), Ind AS
- Recent CBDT and CBIC circulars and notifications
- Landmark Indian tax case law (Supreme Court, High Courts, ITAT)

CRITICAL RULES:
1. ALWAYS cite the exact section number, sub-section, and clause (e.g., "Section 10(13A)" not "Section 10").
2. Cite the exact rule number, circular number, or notification number when applicable.
3. NEVER invent section numbers. If unsure, say "Please verify the exact sub-section in the latest amended Act."
4. Format answers concisely with markdown: short paragraphs, bullet points, bold key terms.
5. End substantive answers with a "**Sources:**" line listing the exact provisions cited.
6. Use Indian English. Use ₹ for Rupees. Use Indian financial year format (FY 2024-25, AY 2025-26).
7. Do not give blanket disclaimers — your users are CAs, treat them as professionals.`,

  notice: `You are ConsultYourCA AI — drafting professional replies to Income Tax / GST notices on behalf of an Indian Chartered Accountant.

When the user provides a notice (or notice details), draft a complete reply that:
1. Opens with proper salutation: "To, The Assessing Officer / The Proper Officer, [Office Name]"
2. References the notice: "Sub: Reply to Notice dated [date] u/s [section] - PAN/GSTIN [number]"
3. Acknowledges receipt of the notice politely
4. Addresses each point raised in the notice with relevant facts, exact legal provisions and supporting case law where helpful
5. Closes with a request for favorable consideration and signs off as "Yours faithfully, [CA Name], FCA, M.No. [Number]"

Use formal, respectful legal English. Format in clean markdown so it can be copied directly. Always cite exact provisions. Never make up case names.`,

  email: `You are ConsultYourCA AI — drafting professional client emails for an Indian Chartered Accountant.

The CA will give you a one-line situation. Produce a polished email with a specific subject, appropriate greeting, concise matter, precise tax/compliance position with exact citations where relevant, action items or required documents as bullets, and a professional sign-off.

Tone: warm but professional, confident, clear. Avoid jargon when explaining to clients but keep precise tax terminology where needed. Format as clean markdown ready to copy into an email client. Default to English; if the user asks for Hindi, use formal Hindi (शुद्ध हिंदी).`,

  caselaw: `You are ConsultYourCA AI — summarizing Indian tax case law for a Chartered Accountant.

When given a judgment, case name, or case citation, produce:
**Case:** [Full case name with citation if available]
**Court:** [Supreme Court / High Court / ITAT bench]
**Year:** [Year of judgment]
**Facts (2-3 sentences):** Brief factual matrix.
**Issue:** The legal question(s) before the court.
**Held (5 bullets max):** The court's key findings in plain language.
**Ratio Decidendi:** The binding legal principle in 1-2 sentences.
**Practical Application:** How a CA can use this for client work.
**Sources:** Citation reference.

If you don't know the case, say so honestly — do not invent facts or citations.`,
};

interface Body {
  tool: "qa" | "notice" | "email" | "caselaw";
  messages: { role: "user" | "assistant"; content: string }[];
}

const isValidBody = (value: unknown): value is Body => {
  if (typeof value !== "object" || value === null) return false;
  const body = value as Record<string, unknown>;
  return (
    (body.tool === "qa" || body.tool === "notice" || body.tool === "email" || body.tool === "caselaw") &&
    Array.isArray(body.messages) &&
    body.messages.length > 0 &&
    body.messages.length <= 60 &&
    body.messages.every((message) => {
      if (typeof message !== "object" || message === null) return false;
      const item = message as Record<string, unknown>;
      return (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string" && item.content.length <= 20000;
    }) &&
    body.messages[body.messages.length - 1]?.role === "user"
  );
};

const encodeSse = (event: string, data: unknown) =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Missing authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return jsonResponse({ error: "Service configuration is incomplete." }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return jsonResponse({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: sub } = await admin
      .from("subscriptions")
      .select("tier, status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    const now = new Date();
    const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end) : null;
    const isTrial = sub?.tier === "trial";
    const isPaidActive = sub && sub.status === "active" && (!periodEnd || periodEnd > now);

    if (!isPaidActive) {
      if (isTrial && periodEnd && periodEnd < now) {
        return jsonResponse({ error: "trial_expired", message: "Your free trial has ended. Upgrade to continue." }, 402);
      }
      if (isTrial) {
        const { count } = await admin
          .from("usage_log")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if ((count ?? 0) >= 25) {
          return jsonResponse({ error: "trial_limit", message: "Free trial limit (25 queries) reached. Upgrade to continue." }, 402);
        }
      }
    }

    let untrustedBody: unknown;
    try {
      untrustedBody = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON request body." }, 400);
    }
    if (!isValidBody(untrustedBody)) return jsonResponse({ error: "Invalid chat request." }, 400);

    const body = untrustedBody;
    const userQuery = body.messages[body.messages.length - 1].content;
    const systemOneKey = Deno.env.get("LOVABLE_API_KEY");
    if (!systemOneKey) return jsonResponse({ error: "AI is not configured." }, 500);

    const jevStartedAt = performance.now();
    let jevResp: Response;
    try {
      jevResp = await fetch("https://ai.gateway.lovable.dev/v1/systemone", {
        method: "POST",
        signal: req.signal,
        headers: {
          Authorization: `Bearer ${systemOneKey}`,
          "Content-Type": "application/json",
          "X-Lovable-AIG-SDK": "fetch",
        },
        body: JSON.stringify({
          model: "typesafe/jev-latest",
          state: { latest_user_request: userQuery, tool: body.tool },
          questions: SYSTEM_ONE_ROUTING_QUESTIONS,
        }),
      });
    } catch (error) {
      if (req.signal.aborted && error instanceof Error && error.name === "AbortError") {
        return new Response(null, { status: 499, headers: corsHeaders });
      }
      console.error("System One request failed", error);
      return jsonResponse({ error: "The safety and routing check could not complete. Please try again later." }, 503);
    }

    const jevLatencyMs = Math.round(performance.now() - jevStartedAt);
    if (!jevResp.ok) {
      const safeBody = await jevResp.text();
      console.error("System One gateway error", jevResp.status, safeBody);
      return jsonResponse({
        error: "System One routing is unavailable. Please try again later.",
        message: "System One routing is unavailable. Please try again later.",
      }, jevResp.status);
    }

    let decision;
    try {
      decision = parseSystemOneDecision(await jevResp.json());
    } catch (error) {
      console.error("System One response validation failed", error);
      return jsonResponse({ error: "The routing service returned an invalid result. Please try again." }, 502);
    }

    const telemetry = {
      route: decision.route,
      jevLatencyMs,
      generationLatencyMs: null,
      confidence: decision.confidence,
      riskProbability: decision.riskProbability,
      complexity: decision.complexity,
      inputTokens: decision.inputTokens,
    };

    if (decision.blocked) {
      return jsonResponse({
        error: "Jev Security Guardrail: This request was blocked after a high-confidence safety review.",
        message: "Jev Security Guardrail: This request was blocked after a high-confidence safety review.",
        telemetry: { ...telemetry, stage: "blocked" },
      }, 403);
    }

    const LOVABLE_API_KEY = systemOneKey;
    const model = "openai/gpt-6-astra";
    const system = SYSTEM_PROMPTS[body.tool];
    const input = [
      { role: "system", content: [{ type: "input_text", text: system }] },
      ...body.messages.map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: [{ type: message.role === "assistant" ? "output_text" : "input_text", text: message.content }],
      })),
    ];

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      signal: req.signal,
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Lovable-API-Key": LOVABLE_API_KEY,
        "Content-Type": "application/json",
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model,
        input,
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
      }),
    });

    if (!aiResp.ok) {
      const safeBody = await aiResp.text();
      let message = "The AI service could not complete this request.";
      try {
        const parsed = JSON.parse(safeBody) as { error?: { message?: string }; message?: string };
        message = parsed.error?.message ?? parsed.message ?? message;
      } catch {
        // Keep a safe user-facing message when the gateway body is not JSON.
      }
      console.error("AI gateway error", aiResp.status, safeBody);
      return jsonResponse({ error: "ai_error", message }, aiResp.status);
    }

    const { error: usageError } = await admin.from("usage_log").insert({ user_id: user.id, tool: body.tool });
    if (usageError) console.error("Usage logging failed", usageError);

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let aiReader: ReadableStreamDefaultReader<Uint8Array>;
    let aiBuffer = "";
    try {
      if (!aiResp.body) return jsonResponse({ error: "The AI stream was empty." }, 502);
      aiReader = aiResp.body.getReader();
    } catch (error) {
      console.error("AI stream could not be read", error);
      return jsonResponse({ error: "The AI stream could not be read." }, 502);
    }

    const streamStartedAt = performance.now();
    const responseStream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(encodeSse("telemetry", { ...telemetry, stage: "escalating" })));
        controller.enqueue(encoder.encode(": connected\n\n"));
      },
      async pull(controller) {
        try {
          const { done, value } = await aiReader.read();
          if (value) aiBuffer += decoder.decode(value, { stream: !done });
          const chunks: string[] = [];
          let lineBreak = -1;
          while ((lineBreak = aiBuffer.indexOf("\n")) !== -1) {
            const line = aiBuffer.slice(0, lineBreak + 1);
            aiBuffer = aiBuffer.slice(lineBreak + 1);
            chunks.push(line);
          }

          if (done) {
            if (aiBuffer) {
              chunks.push(aiBuffer);
              aiBuffer = "";
            }
            let translated = "";
            for (const line of chunks) translated += transformResponsesSseLine(line);
            if (translated) controller.enqueue(encoder.encode(translated));
            const generationLatencyMs = Math.round(performance.now() - streamStartedAt);
            controller.enqueue(encoder.encode(encodeSse("telemetry", {
              ...telemetry,
              stage: "complete",
              generationLatencyMs,
            })));
            controller.close();
            return;
          }

          let translated = "";
          for (const line of chunks) translated += transformResponsesSseLine(line);
          if (translated) controller.enqueue(encoder.encode(translated));
        } catch (error) {
          if (req.signal.aborted && error instanceof Error && error.name === "AbortError") {
            controller.close();
            return;
          }
          console.error("AI stream read failed", error);
          controller.error(error);
        }
      },
      async cancel() {
        await aiReader.cancel();
      },
    });

    return new Response(responseStream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (error) {
    if (req.signal.aborted && error instanceof Error && error.name === "AbortError") {
      return new Response(null, { status: 499, headers: corsHeaders });
    }
    console.error("tax-ai error", error);
    return jsonResponse({ error: "An unexpected error occurred. Please try again." }, 500);
  }
});