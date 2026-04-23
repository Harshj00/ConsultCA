import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote: "Saved me 3 hours on a single GST notice reply. The citations are spot on — exactly what my principal expects.",
    name: "Rohan K.",
    role: "CA Articleship · Mumbai",
  },
  {
    quote: "I stopped using ChatGPT for tax queries. It hallucinated section numbers. ConsultYourCA doesn't.",
    name: "CA Priya S.",
    role: "Solo practitioner · Bengaluru",
  },
  {
    quote: "The case law summarizer alone is worth the subscription. Ratio decidendi in 30 seconds.",
    name: "CA Aman M.",
    role: "Tax consultant · Delhi NCR",
  },
];

export const SocialProof = () => {
  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Loved by CA students & practitioners</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
            Trusted by the next generation of Indian CAs.
          </h2>
        </div>

        <div className="grid gap-5 md:gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-xl border border-border bg-card p-6 shadow-soft transition-smooth hover:shadow-premium"
            >
              <Quote className="h-5 w-5 text-accent mb-3" />
              <blockquote className="text-sm md:text-base text-foreground leading-relaxed">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-semibold">
                  {t.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-primary truncate">{t.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{t.role}</div>
                </div>
                <div className="ml-auto flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
