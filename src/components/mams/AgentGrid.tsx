import { Card } from "@/components/ui/card";
import type { Agent } from "@/lib/mams-mock";
import { formatRelative } from "@/lib/mams-mock";

const statusColor = {
  active: "bg-emerald-400 shadow-emerald-400/50",
  idle: "bg-slate-500 shadow-slate-500/30",
  error: "bg-red-500 shadow-red-500/50",
};

const statusLabel = {
  active: "Activo",
  idle: "Inactivo",
  error: "Error",
};

export function AgentGrid({ agents }: { agents: Agent[] }) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Agent Status</h3>
        <span className="text-[11px] text-muted-foreground">
          {agents.filter((a) => a.status === "active").length}/{agents.length} active
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-md border border-border/60 bg-background/40 p-3 hover:border-border transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${statusColor[agent.status]} ${
                      agent.status === "active" ? "animate-pulse" : ""
                    }`}
                  />
                  <span className="text-sm font-semibold text-foreground truncate">{agent.name}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{agent.role}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {statusLabel[agent.status]}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-border/40">
              <p className="text-[11px] text-muted-foreground line-clamp-1">{agent.lastAction}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                {formatRelative(agent.lastActionAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
