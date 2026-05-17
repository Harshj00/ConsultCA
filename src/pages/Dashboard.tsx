import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChatInterface } from "@/components/app/ChatInterface";
import { toast } from "sonner";
import { MessageSquare, FileWarning, Mail, Scale, Sparkles, LogOut, Menu, X, Crown, Plus, Trash2 } from "lucide-react";

type Tool = "qa" | "notice" | "email" | "caselaw";

interface Conversation {
  id: string;
  tool: Tool;
  title: string;
  updated_at: string;
}

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
  const { user, profile, subscription, signOut } = useAuth();
  const [activeTool, setActiveTool] = useState<Tool>("qa");
  const [usageCount, setUsageCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  const fetchUsage = async () => {
    if (!user) return;
    const { count } = await supabase
      .from("usage_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setUsageCount(count ?? 0);
  };

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("id, tool, title, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    setConversations((data || []) as Conversation[]);
  }, [user]);

  useEffect(() => {
    fetchUsage();
    fetchConversations();
  }, [user, fetchConversations]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const handleNewChat = () => {
    setActiveConvId(null);
    setSidebarOpen(false);
  };

  const handleSelectConv = (conv: Conversation) => {
    setActiveTool(conv.tool);
    setActiveConvId(conv.id);
    setSidebarOpen(false);
  };

  const handleToolSwitch = (id: Tool) => {
    setActiveTool(id);
    setActiveConvId(null);
    setSidebarOpen(false);
  };

  const handleDeleteConv = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete chat");
      return;
    }
    if (activeConvId === id) setActiveConvId(null);
    setConversations((prev) => prev.filter((c) => c.id !== id));
  };

  const handleConversationCreated = (id: string) => {
    setActiveConvId(id);
    fetchConversations();
  };

  // Early access: free for everyone, no trial limits
  void subscription;
  void profile;

  const tool = TOOLS.find((t) => t.id === activeTool)!;
  const recentConvs = conversations.filter((c) => c.tool === activeTool).slice(0, 20);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Seo
        title="Dashboard — ConsultYourCA AI"
        description="Your ConsultYourCA workspace: Tax Q&A, notice replies, client emails and case-law summaries."
        path="/app"
      />
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
            ConsultYourCA<span className="text-accent"> AI</span>
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
              onClick={() => handleToolSwitch(t.id)}
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

          <div className="flex items-center justify-between px-3 pt-5 pb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent</p>
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-base"
              title="Start a new chat"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </div>

          {recentConvs.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground italic">No saved chats yet.</p>
          ) : (
            recentConvs.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectConv(c)}
                className={`group w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-base ${
                  activeConvId === c.id
                    ? "bg-accent-soft text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="flex-1 truncate">{c.title}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => handleDeleteConv(e, c.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleDeleteConv(e as unknown as React.MouseEvent, c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 -mr-1 rounded hover:bg-destructive/10 hover:text-destructive transition-base cursor-pointer"
                  title="Delete chat"
                >
                  <Trash2 className="h-3 w-3" />
                </span>
              </button>
            ))
          )}
        </nav>

        {/* Usage / trial card */}
        <div className="p-3 border-t border-border space-y-3">
          <div className="rounded-lg bg-card border border-accent/20 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent">
              <Crown className="h-3.5 w-3.5" />
              Early Access · Free
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Unlimited queries during our early access period. No card needed.
            </p>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {usageCount} {usageCount === 1 ? "query" : "queries"} used so far
            </p>
          </div>

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
          <button
            onClick={handleNewChat}
            className="p-1.5 text-foreground"
            title="New chat"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <ChatInterface
          key={`${tool.id}-${activeConvId ?? "new"}`}
          tool={tool.id}
          title={tool.title}
          placeholder={tool.placeholder}
          intro={tool.intro}
          conversationId={activeConvId}
          onConversationCreated={handleConversationCreated}
          onConversationUpdated={fetchConversations}
          onUsage={fetchUsage}
        />
      </div>
    </div>
  );
};

export default Dashboard;
