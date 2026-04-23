import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Check } from "lucide-react";

export const Pricing = () => {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-surface">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-medium text-accent mb-4">
            <Sparkles className="h-3 w-3" />
            Early access · 100% free
          </div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight">
            Free for everyone, for now
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            We're in early access. Use every feature with no payment, no credit card and no limits — while we build the product with feedback from real CAs.
          </p>
        </div>

        <div className="mx-auto max-w-2xl mt-12">
          <div className="rounded-2xl border-2 border-accent/40 bg-card p-8 md:p-10 shadow-premium relative overflow-hidden">
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl md:text-6xl font-bold text-primary">₹0</span>
                <span className="text-muted-foreground">/ forever during early access</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Full access to every tool. No credit card required. We'll give existing users a generous heads-up and a loyalty discount before any paid plan launches.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-foreground">
                {[
                  "Unlimited Tax Q&A with cited sections",
                  "Notice reply drafter (IT + GST)",
                  "Client email generator",
                  "Case law summarizer",
                  "Saved chat history",
                  "Priority email support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button asChild size="lg" className="w-full mt-8 bg-primary hover:bg-primary/90">
                <Link to="/auth">Get started free</Link>
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Sign up in 30 seconds · No card · No commitment
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
