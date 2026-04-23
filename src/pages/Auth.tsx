import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Common disposable / temporary email providers — blocked at signup so trial can't be abused.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  "mailinator.com", "tempmail.com", "temp-mail.org", "temp-mail.io", "10minutemail.com",
  "10minutemail.net", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamail.biz", "guerrillamail.de", "sharklasers.com", "grr.la", "yopmail.com",
  "yopmail.fr", "yopmail.net", "trashmail.com", "trashmail.net", "throwawaymail.com",
  "fakeinbox.com", "fake-mail.net", "getnada.com", "nada.email", "maildrop.cc",
  "mintemail.com", "mohmal.com", "mytemp.email", "tempinbox.com", "tempmailaddress.com",
  "dispostable.com", "spambog.com", "spamgourmet.com", "mailnesia.com", "mailcatch.com",
  "tempmailo.com", "emailondeck.com", "moakt.com", "tmail.ws", "harakirimail.com",
  "burnermail.io", "anonbox.net", "discard.email", "mailnull.com", "incognitomail.org",
  "tempr.email", "discardmail.com", "spam4.me", "dropmail.me", "emltmp.com",
  "minutemail.com", "mailtemp.info", "tempemail.net", "mvrht.net", "byom.de",
  "wegwerfmail.de", "trbvm.com", "tempail.com", "vomoto.com", "linshiyou.com",
  "1secmail.com", "1secmail.net", "1secmail.org", "tafmail.com", "kzccv.com",
  "etranquil.com", "instaddr.win", "mail-temp.com", "tempmail.dev", "tempmail.plus",
  "tmpmail.org", "tmpmail.net", "luxusmail.org", "mailpoof.com", "smailpro.com",
  "fakemail.net", "tmpeml.info", "mailfa.tech", "tmail.gg", "mail.tm",
]);

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(60),
  email: z.string().trim().email("Invalid email").max(255).refine(
    (e) => {
      const domain = e.split("@")[1]?.toLowerCase().trim();
      return !!domain && !DISPOSABLE_EMAIL_DOMAINS.has(domain);
    },
    { message: "Disposable / temporary emails are not allowed. Please use your real work email." }
  ),
  password: z.string().min(8, "Min 8 characters").max(72),
  role: z.enum(["ca_student", "practicing_ca", "ca_firm"]),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState(params.get("mode") === "signin" ? "signin" : "signup");
  const [busy, setBusy] = useState(false);

  // Signup state
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState<"ca_student" | "practicing_ca" | "ca_firm">("ca_student");

  // Signin state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!authLoading && user) navigate("/app", { replace: true });
  }, [user, authLoading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ name, email: signupEmail, password: signupPassword, role });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { display_name: parsed.data.name, role: parsed.data.role },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes("already registered") ? "Email already registered. Try signing in." : error.message);
      return;
    }
    toast.success("Check your inbox! Click the verification link to activate your 7-day free trial.", { duration: 8000 });
    setTab("signin");
    setName("");
    setSignupPassword("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("not confirmed") || error.message.toLowerCase().includes("not_confirmed")) {
        toast.error("Please verify your email first. Check your inbox for the confirmation link.");
      } else {
        toast.error("Invalid email or password");
      }
      return;
    }
    navigate("/app", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero">
      <header className="container py-5">
        <Link to="/" className="inline-flex items-center gap-2 font-display font-bold text-lg text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          ConsultYourCA<span className="text-accent"> AI</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card shadow-premium p-6 md:p-8">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signup">Start free trial</TabsTrigger>
                <TabsTrigger value="signin">Sign in</TabsTrigger>
              </TabsList>

              <TabsContent value="signup">
                <div className="mb-5">
                  <h1 className="font-display text-2xl font-bold text-primary">Start your 7-day free trial</h1>
                  <p className="text-sm text-muted-foreground mt-1">No credit card. 25 free queries.</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rohan Kumar" required maxLength={60} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-email">Email</Label>
                    <Input id="su-email" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" required maxLength={255} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="su-pw">Password</Label>
                    <Input id="su-pw" type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} maxLength={72} />
                  </div>
                  <div className="space-y-2">
                    <Label>I am a…</Label>
                    <RadioGroup value={role} onValueChange={(v) => setRole(v as typeof role)} className="grid gap-2">
                      {[
                        { v: "ca_student", l: "CA Student / Articleship" },
                        { v: "practicing_ca", l: "Practicing CA" },
                        { v: "ca_firm", l: "CA Firm" },
                      ].map((o) => (
                        <label
                          key={o.v}
                          htmlFor={o.v}
                          className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 cursor-pointer transition-base hover:border-accent/40 has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
                        >
                          <RadioGroupItem value={o.v} id={o.v} />
                          <span className="text-sm font-medium">{o.l}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start free trial"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signin">
                <div className="mb-5">
                  <h1 className="font-display text-2xl font-bold text-primary">Welcome back</h1>
                  <p className="text-sm text-muted-foreground mt-1">Sign in to your ConsultYourCA dashboard.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pw">Password</Label>
                    <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to our{" "}
            <Link to="/terms" className="underline hover:text-foreground">Terms</Link>{" "}and{" "}
            <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
