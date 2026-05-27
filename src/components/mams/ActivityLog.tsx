import { Card } from "@/components/ui/card";
import type { ActivityEntry } from "@/lib/mams-mock";
import { formatTime } from "@/lib/mams-mock";

export function ActivityLog({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Registro de Actividad</h3>
        <span className="text-[10px] text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> EN VIVO
        </span>
      </div>
      <div className="space-y-1 max-h-80 overflow-y-auto pr-1 font-mono text-[11px]">
        {entries.map((e) => (
          <div key={e.id} className="flex gap-2 py-1 border-b border-border/30 last:border-0">
            <span className="text-muted-foreground/70 tabular-nums shrink-0">{formatTime(e.ts)}</span>
            <span className="text-sky-400 shrink-0 w-20 truncate">{e.agent}</span>
            <span className="text-foreground/80 truncate">{e.action}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
