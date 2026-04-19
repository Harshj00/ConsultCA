import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-primary p-8 md:p-14 lg:p-20 text-center">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
              Stop drafting from scratch.
              <br />
              Start with TaxPilot.
            </h2>
            <p className="mt-4 text-base md:text-lg text-primary-foreground/70">
              Join the CAs and CA students saving 10+ hours every week.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground group">
                <Link to="/auth">
                  Start 7-day free trial
                  <ArrowRight className="h-4 w-4 transition-base group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a href="#founder">Talk to founder</a>
              </Button>
            </div>
            <p className="mt-4 text-xs text-primary-foreground/50">
              No credit card · Cancel anytime · GST invoice included
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
