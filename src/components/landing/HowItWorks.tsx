const steps = [
  {
    n: "01",
    title: "Sign up in 30 seconds",
    desc: "Email + role (CA Student / Practicing CA / Firm). 7-day free trial starts instantly. No credit card.",
  },
  {
    n: "02",
    title: "Pick your tool",
    desc: "Tax Q&A, Notice Reply, Client Email or Case Law. One clean dashboard. Mobile-first — works on your phone.",
  },
  {
    n: "03",
    title: "Get answers with citations",
    desc: "Every output comes with section numbers and circulars. Copy, export, or send directly to your client.",
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-surface">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">How it works</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
            From signup to first answer in under a minute.
          </h2>
        </div>

        <ol className="grid gap-6 md:gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="relative rounded-xl bg-card border border-border p-6 md:p-8 shadow-soft">
              <span className="font-display text-5xl md:text-6xl font-bold text-accent/15">{s.n}</span>
              <h3 className="mt-2 font-display text-lg md:text-xl font-semibold text-primary">{s.title}</h3>
              <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">{s.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
