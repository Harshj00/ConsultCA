import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LegalLayoutProps {
  title: string;
  updated: string;
  children: React.ReactNode;
}

export const LegalLayout = ({ title, updated, children }: LegalLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-lg text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            ConsultYourCA<span className="text-accent"> AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-base"
            >
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-10 md:py-14 max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
        <div className="mt-8 prose-legal space-y-6 text-sm md:text-base leading-relaxed text-foreground/90">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};
