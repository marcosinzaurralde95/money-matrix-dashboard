import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Pause, Play, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { Agent } from "@/lib/mams-mock";
import { formatRelative, formatTime } from "@/lib/mams-mock";

const TASKS = [
  "Procesar cola de entrada",
  "Sincronizar datos con Director",
  "Generar reporte parcial",
  "Validar resultados previos",
  "Optimizar parámetros",
  "Revisar métricas de conversión",
];
const DECISIONS = [
  "Priorizó tarea de alto impacto sobre baja urgencia",
  "Rechazó acción por superar límite de auto-aprobación",
  "Escaló decisión al Director",
  "Reasignó recursos a campaña con mejor ROI",
  "Descartó resultado con baja confianza (0.42)",
];

function seeded(id: string) {
  let s = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

interface Props {
  agent: Agent | null;
  paused: boolean;
  forcedAt?: number;
  onOpenChange: (open: boolean) => void;
  onTogglePause: () => void;
  onForce: () => void;
}

export function AgentDetailSheet({ agent, paused, forcedAt, onOpenChange, onTogglePause, onForce }: Props) {
  const details = useMemo(() => {
    if (!agent) return null;
    const r = seeded(agent.id);
    const now = Date.now();
    const statuses = ["completada", "completada", "en curso", "fallida"] as const;
    return {
      tasks: Array.from({ length: 6 }, (_, i) => ({
        name: TASKS[Math.floor(r() * TASKS.length)],
        status: statuses[Math.floor(r() * statuses.length)],
        ts: now - i * 1000 * 60 * (3 + Math.floor(r() * 10)),
      })),
      decisions: Array.from({ length: 4 }, (_, i) => ({
        text: DECISIONS[Math.floor(r() * DECISIONS.length)],
        confidence: Math.round(60 + r() * 39),
        ts: now - i * 1000 * 60 * (5 + Math.floor(r() * 20)),
      })),
      api: Array.from({ length: 12 }, (_, i) => ({
        h: `${String((new Date().getHours() - 11 + i + 24) % 24).padStart(2, "0")}h`,
        calls: Math.round(20 + r() * 120),
      })),
      cost: (r() * 8 + 1).toFixed(2),
    };
  }, [agent?.id]);

  const totalCalls = details?.api.reduce((a, b) => a + b.calls, 0) ?? 0;
  const statusText = paused ? "Pausado" : agent?.status === "active" ? "Activo" : agent?.status === "idle" ? "Inactivo" : "Error";

  return (
    <Sheet open={!!agent} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-border">
        {agent && details && (
          <>
            <SheetHeader>
              <SheetTitle className="text-foreground">{agent.name}</SheetTitle>
              <SheetDescription>{agent.role} · {statusText}</SheetDescription>
            </SheetHeader>

            <div className="flex gap-2 px-4">
              <Button variant={paused ? "default" : "outline"} size="sm" onClick={onTogglePause}>
                {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                {paused ? "Reanudar" : "Pausar"}
              </Button>
              <Button size="sm" variant="secondary" onClick={onForce} disabled={paused}>
                <Zap className="size-4" /> Forzar ejecución
              </Button>
            </div>
            {forcedAt && (
              <p className="px-4 text-[11px] text-muted-foreground">Ejecución forzada {formatRelative(forcedAt)}</p>
            )}

            <section className="px-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Consumo de API (12h)</h4>
                <span className="text-xs text-foreground">{totalCalls} llamadas · ${details.cost}</span>
              </div>
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={details.api}>
                    <XAxis dataKey="h" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", fontSize: 12 }} />
                    <Area type="monotone" dataKey="calls" name="Llamadas" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="px-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tareas recientes</h4>
              <ul className="space-y-1.5">
                {details.tasks.map((t, i) => (
                  <li key={i} className="flex items-center justify-between rounded border border-border/60 bg-background/40 px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatTime(t.ts)}</p>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider ${t.status === "fallida" ? "text-destructive" : t.status === "en curso" ? "text-primary" : "text-muted-foreground"}`}>
                      {t.status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="px-4 pb-6 space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Decisiones tomadas</h4>
              <ul className="space-y-1.5">
                {details.decisions.map((d, i) => (
                  <li key={i} className="rounded border border-border/60 bg-background/40 px-3 py-2">
                    <p className="text-sm text-foreground">{d.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Confianza {d.confidence}% · {formatRelative(d.ts)}</p>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
