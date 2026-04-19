import { MessageSquare, FileWarning, Mail, Scale } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Tax Q&A with cited sections",
    desc: "Ask anything about Income Tax, GST or Companies Act. Every answer cites the exact section, sub-section and circular — no hallucinated numbers.",
    accent: "Section 10(13A) · Rule 2A",
  },
  {
    icon: FileWarning,
    title: "Notice Reply Drafter",
    desc: "Paste any IT or GST notice. Get a professionally drafted reply with correct legal language, citations and a clean format ready to send.",
    accent: "ITR Notice u/s 143(1)",
  },
  {
    icon: Mail,
    title: "Client Email Generator",
    desc: "Describe the situation in one line. Get a polished, CA-appropriate client email ready to copy. Bilingual support (English / Hindi).",
    accent: "Tone: Professional",
  },
  {
    icon: Scale,
    title: "Case Law Summarizer",
    desc: "Paste a judgment or case name. Get a 5-bullet summary, ratio decidendi and how it applies to your client's situation.",
    accent: "Ratio + Application",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Four tools, one workspace</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            Everything a CA does manually — automated.
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            Stop switching between Google, ChatGPT, and the bare Income Tax Act PDF. TaxPilot brings them together, tuned for Indian law.
          </p>
        </div>

        <div className="grid gap-5 md:gap-6 md:grid-cols-2">
          {features.map((f, i) => (
            <article
              key={f.title}
              className="group relative rounded-xl border border-border bg-card p-6 md:p-8 transition-smooth hover:shadow-premium hover:border-accent/30 hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent transition-base group-hover:bg-accent group-hover:text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg md:text-xl font-semibold text-primary">{f.title}</h3>
                  <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">{f.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-mono text-muted-foreground">
                    {f.accent}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
