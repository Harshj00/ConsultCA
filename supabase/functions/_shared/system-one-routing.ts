export const SYSTEM_ONE_ROUTING_QUESTIONS = {
  intent_route: {
    type: "choice",
    instructions:
      "Classify the latest user request. Select jailbreak_or_harm only when it clearly requests harmful wrongdoing or bypassing safety controls; choose basic_tax_lookup for a focused, routine tax/compliance question; otherwise choose complex_legal_research. Do not treat ordinary professional drafting or discussion of legal facts as harmful.",
    criteria: {
      jailbreak_or_harm:
        "A clear request to facilitate harmful wrongdoing or bypass safety controls.",
      basic_tax_lookup:
        "A focused, routine Indian tax or compliance question with a straightforward answer.",
      complex_legal_research:
        "A multi-factor legal, tax, case-law, notice-drafting, or other request needing a full answer.",
    },
  },
  complexity_score: {
    type: "score",
    instructions:
      "How complex is the latest user request to answer accurately? Use the supplied ordered levels.",
    criteria: [
      "1 — A simple, direct factual tax/compliance lookup.",
      "2 — A focused question with one relevant provision or short calculation.",
      "3 — Several facts or provisions need to be considered together.",
      "4 — Detailed legal interpretation, notice response, or case-law analysis.",
      "5 — Extensive, ambiguous, multi-issue research or drafting.",
    ],
  },
} as const;

export type SystemOneRoute =
  | "jailbreak_or_harm"
  | "basic_tax_lookup"
  | "complex_legal_research";

export interface SystemOneDecision {
  route: SystemOneRoute;
  blocked: boolean;
  riskProbability: number;
  confidence: number;
  complexity: number;
  inputTokens: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const probability = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;

export function parseSystemOneDecision(value: unknown): SystemOneDecision {
  if (!isRecord(value) || !isRecord(value.answers)) {
    throw new Error("The routing service returned an incomplete decision.");
  }

  const intent = value.answers.intent_route;
  const complexityAnswer = value.answers.complexity_score;
  const usage = value.usage;
  if (!isRecord(intent) || !isRecord(complexityAnswer) || !isRecord(usage)) {
    throw new Error("The routing service returned an incomplete decision.");
  }

  const route = intent.choice;
  const probabilities = intent.probabilities;
  const score = complexityAnswer.score;
  const confidence = intent.confidence;
  const inputTokens = usage.input_tokens;
  if (
    (route !== "jailbreak_or_harm" && route !== "basic_tax_lookup" && route !== "complex_legal_research") ||
    !isRecord(probabilities) ||
    !probability(probabilities.jailbreak_or_harm) ||
    !probability(confidence) ||
    typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 4 ||
    typeof inputTokens !== "number" || !Number.isInteger(inputTokens) || inputTokens < 0
  ) {
    throw new Error("The routing service returned invalid decision values.");
  }

  const riskProbability = probabilities.jailbreak_or_harm;
  return {
    route,
    blocked: route === "jailbreak_or_harm" && riskProbability > 0.85,
    riskProbability,
    confidence,
    complexity: score + 1,
    inputTokens,
  };
}