import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ChevronDown, Gauge, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { SystemOneRoute } from "../../../supabase/functions/_shared/system-one-routing";

export type RouterStage = "idle" | "routing" | "blocked" | "escalating" | "complete" | "error";

export interface RouterTelemetry {
  stage: RouterStage;
  route?: SystemOneRoute;
  jevLatencyMs?: number;
  generationLatencyMs?: number;
  confidence?: number;
  complexity?: number;
  inputTokens?: number;
}

interface Props {
  telemetry: RouterTelemetry;
}

const routeLabels: Record<SystemOneRoute, string> = {
  jailbreak_or_harm: "Safety review",
  basic_tax_lookup: "Focused tax lookup",
  complex_legal_research: "Complex research",
};

const JEV_INPUT_RATE = 0.000000042;
const ASTRA_INPUT_RATE = 0.00001;

export const SystemOneTelemetry = ({ telemetry }: Props) => {
  const [open, setOpen] = useState(false);
  const hasMeasurements = telemetry.jevLatencyMs !== undefined;
  const estimatedInputSavings = (telemetry.inputTokens ?? 0) * (ASTRA_INPUT_RATE - JEV_INPUT_RATE);
  const chartData = hasMeasurements
    ? [
        { name: "Jev router", latency: telemetry.jevLatencyMs ?? 0 },
        { name: "Answer stream", latency: telemetry.generationLatencyMs ?? 0 },
      ]
    : [];

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="shrink-0 border-b border-border bg-card">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex min-h-12 w-full items-center justify-between gap-3 px-4 md:px-6 text-left hover:bg-muted/50 transition-base"
          aria-label={open ? "Hide System One telemetry" : "Show System One telemetry"}
        >
          <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground">
            <Activity className="h-4 w-4 shrink-0 text-accent" />
            <span>System One telemetry</span>
            {telemetry.stage === "routing" && <Badge variant="secondary">Evaluating</Badge>}
            {telemetry.stage === "blocked" && <Badge variant="destructive">Blocked</Badge>}
            {telemetry.stage === "escalating" && <Badge variant="secondary">Routed</Badge>}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="grid gap-5 border-t border-border px-4 py-4 md:grid-cols-[minmax(0,1.35fr)_minmax(240px,0.65fr)] md:px-6">
          <section aria-label="Measured routing and generation latency" className="min-w-0">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Latest request timing</h3>
                <p className="text-xs text-muted-foreground">Measured durations; response time is measured in this browser.</p>
              </div>
              {telemetry.route && <Badge variant="outline">{routeLabels[telemetry.route]}</Badge>}
            </div>
            {hasMeasurements ? (
              <div className="h-28 w-full" role="img" aria-label={`Jev routing took ${Math.round(telemetry.jevLatencyMs ?? 0)} milliseconds; answer stream took ${Math.round(telemetry.generationLatencyMs ?? 0)} milliseconds`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 2, right: 20, left: 6, bottom: 2 }}>
                    <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} unit=" ms" />
                    <YAxis type="category" dataKey="name" width={92} tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`${Math.round(Number(value))} ms`, "Measured"]} cursor={{ fill: "hsl(var(--muted))" }} />
                    <Bar dataKey="latency" name="Duration" fill="hsl(var(--accent))" radius={[0, 3, 3, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-28 items-center justify-center border-y border-dashed border-border text-sm text-muted-foreground">
                No requests measured this session
              </div>
            )}
          </section>

          <section className="flex flex-col justify-center gap-3 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0" aria-label="Routing metrics">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 rounded-sm bg-accent-soft p-2 text-accent"><Gauge className="h-4 w-4" /></span>
              <div>
                <p className="text-xs text-muted-foreground">Estimated router-only input savings · session</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums">${estimatedInputSavings.toFixed(6)} USD</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">Compared with Astra input pricing for the same Jev-evaluated tokens. The answer generation is separate.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-border pt-3">
              <span className="mt-0.5 rounded-sm bg-secondary p-2 text-secondary-foreground"><ShieldCheck className="h-4 w-4" /></span>
              <div className="text-xs leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">
                  {telemetry.stage === "routing" ? "Evaluating request" : telemetry.stage === "blocked" ? "Safety rule stopped the request" : telemetry.stage === "error" ? "Routing unavailable" : telemetry.stage === "escalating" || telemetry.stage === "complete" ? "Full answer sent to the AI assistant" : "No request in progress"}
                </p>
                <p className="mt-0.5">
                  {hasMeasurements
                    ? `${telemetry.inputTokens ?? 0} router input tokens · ${Math.round(telemetry.jevLatencyMs ?? 0)} ms · confidence ${Math.round((telemetry.confidence ?? 0) * 100)}% · complexity ${telemetry.complexity?.toFixed(1) ?? "—"}/5`
                    : "Metrics appear after your next request."}
                </p>
              </div>
            </div>
          </section>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};