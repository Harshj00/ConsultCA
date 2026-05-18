import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <a href="#" className="flex items-center gap-2 font-display font-bold text-lg text-primary">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </span>
              ConsultYourCA<span className="text-accent"> AI</span>
            </a>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">
              The AI co-pilot built for Indian Chartered Accountants and CA students. Made with ❤️ in India.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-primary mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground transition-base">Features</a></li>
              <li><a href="#pricing" className="hover:text-foreground transition-base">Pricing</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-base">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-primary mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-base">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-base">Terms of Service</Link></li>
              <li><a href="mailto:SendThose10bucks@gmail.com" className="hover:text-foreground transition-base">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ConsultYourCA AI. All rights reserved.</p>
          <p>Not affiliated with ICAI. Always verify AI output before client use.</p>
        </div>
      </div>
    </footer>
  );
};
