import { describe, expect, it } from "vitest";
import { parseSystemOneDecision } from "../../supabase/functions/_shared/system-one-routing";

const result = (route: string, risk: number, score = 0) => ({
  answers: {
    intent_route: {
      choice: route,
      probabilities: {
        jailbreak_or_harm: risk,
        basic_tax_lookup: route === "basic_tax_lookup" ? 0.9 : 0.05,
        complex_legal_research: route === "complex_legal_research" ? 0.9 : 0.05,
      },
      confidence: 0.9,
    },
    complexity_score: { score },
  },
  usage: { input_tokens: 120 },
});

describe("System One decisions", () => {
  it("blocks harmful intent only above 0.85 probability", () => {
    expect(parseSystemOneDecision(result("jailbreak_or_harm", 0.85)).blocked).toBe(false);
    expect(parseSystemOneDecision(result("jailbreak_or_harm", 0.85001)).blocked).toBe(true);
  });

  it("does not block a focused tax question when risk is low", () => {
    const decision = parseSystemOneDecision(result("basic_tax_lookup", 0.04, 1));
    expect(decision.blocked).toBe(false);
    expect(decision.complexity).toBe(2);
    expect(decision.inputTokens).toBe(120);
  });

  it("rejects missing or invalid risk probabilities instead of inventing a decision", () => {
    const malformed = result("jailbreak_or_harm", 0.9);
    malformed.answers.intent_route.probabilities.jailbreak_or_harm = Number.NaN;
    expect(() => parseSystemOneDecision(malformed)).toThrow("invalid decision values");
  });
});