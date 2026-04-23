import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const links = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#demo", label: "Demo" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <nav className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          ConsultYourCA<span className="text-accent"> AI</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm font-medium text-muted-foreground transition-base hover:text-foreground"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link to="/app">Open dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth?mode=signin">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                <Link to="/auth">Get started free</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 -mr-2 text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="container py-4 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-muted-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-border">
              {user ? (
                <Button asChild size="sm">
                  <Link to="/app">Open dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/auth?mode=signin">Sign in</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/auth">Get started free</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
