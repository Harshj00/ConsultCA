import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, FileText, Sparkles } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* subtle grid */}
      <div className="absolute inset-0 -z-10 opacity-[0.03] [background-image:linear-gradient(hsl(var(--primary))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary))_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="container py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-xs font-medium text-accent mb-6">
            <Sparkles className="h-3 w-3" />
            Built for Indian CAs · GST + Income Tax + Companies Act
          </div>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-[1.05] tracking-tight">
            The AI Co-Pilot built for{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Indian CAs</span>
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-accent/30 -z-0" />
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Draft notice replies, answer tax queries with cited sections, summarize case law and write client emails — in seconds, not hours.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-soft group">
              Start 7-day free trial
              <ArrowRight className="h-4 w-4 transition-base group-hover:translate-x-0.5" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              See live demo
            </Button>
          </div>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" />No credit card required</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" />Cancel anytime</li>
            <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-accent" />Cited sources, no hallucinations</li>
          </ul>
        </div>

        {/* Mock product preview */}
        <div className="mt-12 md:mt-20 mx-auto max-w-4xl animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="relative rounded-xl border border-border bg-card shadow-premium overflow-hidden">
            <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/60" />
              <span className="ml-3 text-xs text-muted-foreground font-medium">taxpilot.ai · Tax Q&A</span>
            </div>
            <div className="p-4 sm:p-6 md:p-8 space-y-4">
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  Can a salaried employee claim HRA exemption while also paying rent to parents?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm text-foreground space-y-2">
                  <p>Yes, HRA exemption u/s <span className="font-semibold text-accent">10(13A)</span> is allowed when paying rent to parents, subject to:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
                    <li>Genuine rental arrangement (rent receipts, bank transfers)</li>
                    <li>Parents must declare rent as income in their ITR</li>
                    <li>Property must be owned by the parent receiving rent</li>
                  </ul>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    Section 10(13A) · Rule 2A · CBDT Circular No. 8/2013
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
