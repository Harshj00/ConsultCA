import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is TaxPilot's tax knowledge actually accurate?",
    a: "Every answer cites the exact section, rule and circular it's based on. We use leading reasoning models tuned with Indian tax acts, ICAI standards and recent CBDT/CBIC circulars. You can verify each citation in seconds.",
  },
  {
    q: "Can I use this for client work?",
    a: "Yes — TaxPilot is built specifically for client-facing professional output: notice replies, client emails, and citation-backed advisory. Always review before sending, the same as you would any draft.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. It runs in your browser on desktop and mobile. Most CA students use it on their phone during articleship.",
  },
  {
    q: "What payment methods do you accept?",
    a: "UPI, debit/credit cards and net banking via Stripe. All prices are in INR with GST invoice provided.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. One click. No questions asked. Your subscription stays active until the end of your billing cycle.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your queries and uploaded notices are never used to train models, never shared, and encrypted at rest.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">FAQ</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
            Questions, answered.
          </h2>
        </div>

        <div className="mx-auto max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left text-base font-semibold text-primary hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
