import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
4. Addresses each point raised in the notice with:
   - Relevant facts
   - Applicable legal provisions (with exact section/rule citations)
   - Supporting case law where helpful
5. Closes with a request for favorable consideration and signs off as "Yours faithfully, [CA Name], FCA, M.No. [Number]"

Use formal, respectful legal English. Format in clean markdown so it can be copied directly. Always cite exact provisions. Never make up case names.`,

  email: `You are ConsultYourCA AI — drafting professional client emails for an Indian Chartered Accountant.

The CA will give you a one-line situation. You produce a polished email that:
1. Has a clear, specific subject line
2. Opens with appropriate greeting (Dear Mr./Ms. [Name] or Dear Client)
3. States the matter concisely
4. Explains the tax/compliance position with exact section citations where relevant
5. Lists action items or required documents as bullets
6. Has a professional sign-off

Tone: warm but professional, confident, clear. Avoid jargon when explaining to clients but keep precise tax terminology where needed. Format as clean markdown ready to copy into an email client. Default to English; if the user asks for Hindi, use formal Hindi (शुद्ध हिंदी).`,

  caselaw: `You are ConsultYourCA AI — summarizing Indian tax case law for a Chartered Accountant.

When given a judgment, case name, or case citation, produce:

**Case:** [Full case name with citation if available]
**Court:** [Supreme Court / High Court / ITAT bench]
**Year:** [Year of judgment]

**Facts (2-3 sentences):**
Brief factual matrix.

**Issue:**
The legal question(s) before the court.

**Held (5 bullets max):**
- The court's key findings, in plain language

**Ratio Decidendi:**
The binding legal principle in 1-2 sentences.

**Practical Application:**
How a CA can use this for client work.

**Sources:** Citation reference.

If you don't know the case, say so honestly — do not invent facts or citations.`,
};

interface Body {
  tool: "qa" | "notice" | "email" | "caselaw";
  messages: { role: "user" | "assistant"; content: string }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    // Service client for usage check (bypasses RLS for counting & insert)
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check subscription / usage limits
    const { data: sub } = await admin
      .from("subscriptions")
      .select("tier, status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    const now = new Date();
    const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end) : null;
    const isTrial = sub?.tier === "trial";
    const isPaidActive =
      sub && sub.status === "active" && (!periodEnd || periodEnd > now);

    if (!isPaidActive) {
      // Trial expired?
      if (isTrial && periodEnd && periodEnd < now) {
        return new Response(
          JSON.stringify({ error: "trial_expired", message: "Your free trial has ended. Upgrade to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Trial query limit (25)
      if (isTrial) {
        const { count } = await admin
          .from("usage_log")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if ((count ?? 0) >= 25) {
          return new Response(
            JSON.stringify({ error: "trial_limit", message: "Free trial limit (25 queries) reached. Upgrade to continue." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      }
    }

    const body = (await req.json()) as Body;
    const sys = SYSTEM_PROMPTS[body.tool];
    if (!sys) {
      return new Response(JSON.stringify({ error: "Invalid tool" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const model =
      body.tool === "qa" || body.tool === "caselaw"
        ? "google/gemini-2.5-pro"
        : "google/gemini-2.5-flash";

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: "system", content: sys }, ...body.messages],
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limit", message: "Too many requests, try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "ai_credits", message: "AI credits exhausted. Contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "ai_error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log usage (fire and forget)
    admin
      .from("usage_log")
      .insert({ user_id: user.id, tool: body.tool })
      .then(() => {});

    return new Response(aiResp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("tax-ai error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
