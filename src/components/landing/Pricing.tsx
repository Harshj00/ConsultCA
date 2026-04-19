import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Student",
    price: "₹299",
    period: "/month",
    desc: "For CA Foundation, Inter & Final students.",
    cta: "Start free trial",
    highlight: false,
    features: [
      "200 queries / month",
      "Tax Q&A with citations",
      "Notice reply drafter",
      "Client email generator",
      "Mobile-first interface",
    ],
  },
  {
    name: "Professional",
    price: "₹1,999",
    period: "/month",
    desc: "For practicing CAs in solo practice.",
    cta: "Start free trial",
    highlight: true,
    features: [
      "Unlimited queries",
      "Everything in Student",
      "Case law summarizer",
      "GPT-5 / Gemini Pro reasoning",
      "Priority response speed",
      "Export to PDF & DOCX",
    ],
  },
  {
    name: "Firm",
    price: "₹4,999",
    period: "/month",
    desc: "For CA firms with 3-10 partners.",
    cta: "Contact sales",
    highlight: false,
    features: [
      "Everything in Professional",
      "Up to 5 team seats",
      "Shared client library",
      "Team usage analytics",
      "Dedicated onboarding",
    ],
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            Built for India. Priced for India.
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            7-day free trial on every plan. No credit card. Cancel any time.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-2xl border p-6 md:p-8 transition-smooth ${
                t.highlight
                  ? "border-accent/40 bg-card shadow-premium lg:scale-[1.02]"
                  : "border-border bg-card hover:border-accent/30 hover:shadow-soft"
              }`}
            >
              {t.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-soft">
                  Most popular
                </div>
              )}

              <h3 className="font-display text-xl font-semibold text-primary">{t.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.desc}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="font-display text-4xl md:text-5xl font-bold text-primary">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.period}</span>
              </div>

              <Button
                className={`mt-6 w-full ${
                  t.highlight ? "bg-primary hover:bg-primary/90" : ""
                }`}
                variant={t.highlight ? "default" : "outline"}
              >
                {t.cta}
              </Button>

              <ul className="mt-6 space-y-3 border-t border-border pt-6">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
