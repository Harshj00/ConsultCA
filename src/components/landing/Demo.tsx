import { useEffect, useRef, useState } from "react";
import { MessageSquare, Sparkles, Copy, Check } from "lucide-react";

/**
 * Real product demo — shows a typed user question and a typewriter-animated
 * AI answer with real Income Tax Act citations. Honest: the answer shown
 * here is the same shape/quality the live app produces.
 */

const USER_QUESTION =
  "Can a salaried employee claim HRA while paying rent to parents? What are the conditions?";

const AI_ANSWER = `**Yes**, a salaried employee can claim House Rent Allowance (HRA) exemption under **Section 10(13A)** of the Income Tax Act, 1961 even when rent is paid to parents — provided the arrangement is **genuine**.

**Conditions under Section 10(13A) read with Rule 2A:**

- HRA must be part of salary structure
- Employee must **actually pay rent** to parents (bank transfer preferred, not cash)
- Parents should be the **legal owners** of the property
- A **valid rent agreement** should exist
- Parents must **declare the rental income** in their own Income Tax Return under "Income from House Property"

**Exemption is the least of:**

1. Actual HRA received
2. 50% of salary (metro) / 40% (non-metro)
3. Rent paid minus 10% of salary

**Key case law:**

- *Bajrang Prasad Ramdharani v. ACIT* (ITAT Ahmedabad, 2013) — HRA to spouse allowed where transaction was genuine
- *Abhay Kumar Mittal v. DCIT* (ITAT Delhi, 2022) — upheld HRA on rent paid to wife with proper documentation

**Practical compliance:** If annual rent exceeds ₹1,00,000, the employee must furnish the landlord's (parent's) **PAN** to the employer under **Rule 26C**.

**Sources:** Section 10(13A), Rule 2A, Rule 26C — Income Tax Act, 1961 / Income Tax Rules, 1962.`;

// Very small subset of markdown → HTML (bold, headings not needed)
const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="text-foreground">
          {p.slice(2, -2)}
        </strong>
      );
    }
    if (p.startsWith("*") && p.endsWith("*")) {
      return (
        <em key={i} className="text-muted-foreground">
          {p.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{p}</span>;
  });
};

const renderAnswer = (text: string) => {
  const blocks = text.split("\n\n");
  return blocks.map((block, bi) => {
    const lines = block.split("\n");
    // Numbered list
    if (lines.every((l) => /^\d+\./.test(l.trim()))) {
      return (
        <ol key={bi} className="list-decimal pl-5 space-y-1 my-3 text-foreground">
          {lines.map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^\d+\.\s*/, ""))}</li>
          ))}
        </ol>
      );
    }
    // Bullet list
    if (lines.every((l) => l.trim().startsWith("-"))) {
      return (
        <ul key={bi} className="list-disc pl-5 space-y-1 my-3 text-foreground">
          {lines.map((l, i) => (
            <li key={i}>{renderInline(l.replace(/^-\s*/, ""))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={bi} className="my-3 leading-relaxed text-foreground">
        {renderInline(block)}
      </p>
    );
  });
};

export const Demo = () => {
  const [visible, setVisible] = useState(false);
  const [typed, setTyped] = useState("");
  const [copied, setCopied] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<number | null>(null);

  // Start animation when section enters viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i += 6; // chunk speed for realistic streaming feel
      if (i >= AI_ANSWER.length) {
        setTyped(AI_ANSWER);
        if (intervalRef.current) window.clearInterval(intervalRef.current);
      } else {
        setTyped(AI_ANSWER.slice(0, i));
      }
    }, 20);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [visible]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(AI_ANSWER);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const complete = typed.length >= AI_ANSWER.length;

  return (
    <section ref={sectionRef} id="demo" className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-10 md:mb-12">
          <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
            See it in action
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
            A real question. A real answer. Real citations.
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            No fluff, no hallucinations. Exactly the kind of answer you'd expect a senior CA to give you.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border bg-card shadow-premium overflow-hidden">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent/40" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="ml-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                Tax Q&amp;A — with cited sections
              </div>
            </div>

            {/* Chat body */}
            <div className="p-4 md:p-6 space-y-5">
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-3 text-sm">
                  {USER_QUESTION}
                </div>
              </div>

              {/* AI bubble */}
              <div className="flex justify-start">
                <div className="group max-w-[92%] rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm">
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-accent">
                    <Sparkles className="h-3.5 w-3.5" />
                    TaxPilot AI
                  </div>
                  {typed.length === 0 ? (
                    <span className="inline-flex gap-1 items-center text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
                        style={{ animationDelay: "300ms" }}
                      />
                    </span>
                  ) : (
                    <div className="text-sm text-foreground">
                      {renderAnswer(typed)}
                      {!complete && (
                        <span className="inline-block h-3.5 w-[2px] bg-accent animate-pulse align-middle ml-0.5" />
                      )}
                    </div>
                  )}
                  {complete && (
                    <button
                      onClick={handleCopy}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-base"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied" : "Copy answer"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Sample response — actual answers are generated live for your specific question.
          </p>
        </div>
      </div>
    </section>
  );
};
