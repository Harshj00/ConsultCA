import { Linkedin, Globe, Mail } from "lucide-react";

export const Founder = () => {
  return (
    <section id="founder" className="py-20 md:py-28 bg-surface">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">Talk to the founder</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
              Built by a developer who ships every day.
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              ConsultYourCA AI is built and run by one person. If you're a CA, CA student, or just curious — reach out directly.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-premium p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="flex h-20 w-20 md:h-24 md:w-24 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground font-display text-3xl font-bold shadow-soft">
                HJ
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="font-display text-xl md:text-2xl font-bold text-primary">Harsh Kumar Jha</h3>
                <p className="text-sm text-accent font-medium mt-0.5">Founder · ConsultYourCA AI</p>
                <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                  I personally read every message, reply within 24 hours, and ship product feedback weekly. Have a feature request, a bug, or just want to chat about the product? Pick a channel below.
                </p>

                <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center md:justify-start">
                  <button
                    type="button"
                    onClick={() => window.open("https://harshjha08.vercel.app/", "_blank", "noopener,noreferrer")}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium transition-base hover:bg-primary/90 shadow-soft cursor-pointer"
                  >
                    <Globe className="h-4 w-4" />
                    Visit portfolio
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-display text-2xl font-bold text-primary">&lt; 24h</div>
                <p className="text-xs text-muted-foreground mt-0.5">Reply time</p>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-primary">Weekly</div>
                <p className="text-xs text-muted-foreground mt-0.5">Product updates</p>
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-primary">Solo</div>
                <p className="text-xs text-muted-foreground mt-0.5">Founder-led support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
