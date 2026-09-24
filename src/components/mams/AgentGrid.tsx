import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { Agent } from "@/lib/mams-mock";
import { formatRelative } from "@/lib/mams-mock";
import { AgentDetailSheet } from "./AgentDetailSheet";

const statusColor = {
  active: "bg-emerald-400 shadow-emerald-400/50",
  idle: "bg-slate-500 shadow-slate-500/30",
  error: "bg-red-500 shadow-red-500/50",
  paused: "bg-amber-400 shadow-amber-400/40",
};

const statusLabel = {
  active: "Activo",
  idle: "Inactivo",
  error: "Error",
  paused: "Pausado",
};

export function AgentGrid({ agents }: { agents: Agent[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [paused, setPaused] = useState<Record<string, boolean>>({});
  const [forced, setForced] = useState<Record<string, number>>({});
  const selected = agents.find((a) => a.id === selectedId) ?? null;

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Estado de Agentes</h3>
        <span className="text-[11px] text-muted-foreground">
          {agents.filter((a) => a.status === "active" && !paused[a.id]).length}/{agents.length} activos
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agent) => {
          const st = paused[agent.id] ? "paused" : agent.status;
          const forcedAt = forced[agent.id];
          const recentForce = forcedAt && Date.now() - forcedAt < 60000;
          return (
            <button
              type="button"
              key={agent.id}
              onClick={() => setSelectedId(agent.id)}
              className="text-left rounded-md border border-border/60 bg-background/40 p-3 hover:border-primary/60 hover:bg-background/70 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${statusColor[st]} ${st === "active" ? "animate-pulse" : ""}`}
                    />
                    <span className="text-sm font-semibold text-foreground truncate">{agent.name}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{agent.role}</p>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{statusLabel[st]}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-border/40">
                <p className="text-[11px] text-muted-foreground line-clamp-1">
                  {recentForce ? "Ejecución forzada manualmente" : agent.lastAction}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {formatRelative(recentForce ? forcedAt : agent.lastActionAt)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <AgentDetailSheet
        agent={selected}
        paused={!!(selected && paused[selected.id])}
        forcedAt={selected ? forced[selected.id] : undefined}
        onOpenChange={(o) => !o && setSelectedId(null)}
        onTogglePause={() => selected && setPaused((p) => ({ ...p, [selected.id]: !p[selected.id] }))}
        onForce={() => selected && setForced((f) => ({ ...f, [selected.id]: Date.now() }))}
      />
    </Card>
  );
}
