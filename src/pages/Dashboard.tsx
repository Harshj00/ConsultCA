import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/app/ChatInterface";
import { MessageSquare, FileWarning, Mail, Scale, Sparkles, LogOut, Menu, X, Crown } from "lucide-react";

type Tool = "qa" | "notice" | "email" | "caselaw";

const TOOLS: { id: Tool; icon: typeof MessageSquare; label: string; title: string; placeholder: string; intro: string }[] = [
  {
    id: "qa",
    icon: MessageSquare,
    label: "Tax Q&A",
    title: "Tax Q&A — with cited sections",
    placeholder: "e.g. Can a salaried employee claim HRA while paying rent to parents?",
    intro: "Ask anything about Income Tax Act, GST Act, or Companies Act. Every answer cites the exact section, sub-section and applicable circulars.",
  },
  {
    id: "notice",
    icon: FileWarning,
    label: "Notice Reply",
    title: "Notice Reply Drafter",
    placeholder: "Paste the notice content (or describe it: e.g. Notice u/s 143(1) for AY 2024-25, mismatch in TDS claimed vs Form 26AS)",
    intro: "Paste any IT or GST notice. Get a complete, formal reply with correct legal language and citations — ready to send.",
  },
  {
    id: "email",
    icon: Mail,
    label: "Client Email",
    title: "Client Email Generator",
    placeholder: "Describe the situation: e.g. Inform client that ITR filing deadline is extended to 31st Oct, ask for missing TDS certificates",
    intro: "Describe a client situation in one line. Get a polished, professional email ready to copy.",
  },
  {
    id: "caselaw",
    icon: Scale,
    label: "Case Law",
    title: "Case Law Summarizer",
    placeholder: "Paste a judgment text or case citation: e.g. CIT vs Vatika Township Pvt Ltd (2014) 367 ITR 466 (SC)",
    intro: "Paste a judgment or enter a case citation. Get facts, ratio decidendi and practical application — in 30 seconds.",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, subscription, signOut, refreshProfile } = useAuth();
  const [activeTool, setActiveTool] = useState<Tool>("qa");
  const [usageCount, setUsageCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUsage = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("usage_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setUsageCount(count ?? 0);
  };

  useEffect(() => {
    fetchUsage();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const isTrial = subscription?.tier === "trial";
  const trialEnd = profile?.trial_ends_at ? new Date(profile.trial_ends_at) : null;
  const daysLeft = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86400000)) : 0;
  const queriesLeft = Math.max(0, 25 - usageCount);

  const tool = TOOLS.find((t) => t.id === activeTool)!;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:relative z-40 flex flex-col w-72 h-full border-r border-border bg-surface transition-transform duration-200`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-primary">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            TaxPilot<span className="text-accent">AI</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1.5 text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tools</p>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-base ${
                activeTool === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <t.icon className="h-4 w-4 shrink-0" />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Usage / trial card */}
        <div className="p-3 border-t border-border space-y-3">
          {isTrial && (
            <div className="rounded-lg bg-card border border-accent/20 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                <Crown className="h-3.5 w-3.5" />
                Free Trial
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {queriesLeft} of 25 queries left · {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-accent transition-base"
                  style={{ width: `${Math.min(100, (usageCount / 25) * 100)}%` }}
                />
              </div>
              <Button asChild size="sm" className="w-full mt-3 h-8 text-xs">
                <a href="/#pricing">Upgrade now</a>
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold">
              {(profile?.display_name || user?.email || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{profile?.display_name || user?.email}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {profile?.role === "ca_student" ? "CA Student" : profile?.role === "practicing_ca" ? "Practicing CA" : "CA Firm"}
              </p>
            </div>
            <button onClick={handleSignOut} className="p-1.5 text-muted-foreground hover:text-foreground transition-base" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-foreground/40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-primary">{tool.label}</span>
          <span className="w-7" />
        </div>

        <ChatInterface
          tool={tool.id}
          title={tool.title}
          placeholder={tool.placeholder}
          intro={tool.intro}
          onUsage={fetchUsage}
        />
      </div>
    </div>
  );
};

export default Dashboard;
