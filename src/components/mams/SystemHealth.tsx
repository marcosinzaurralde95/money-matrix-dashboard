import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  health: { cpu: number; memory: number; apiPerMin: number; activeTasks: number };
}

function Gauge({ label, value, suffix = "%", max = 100 }: { label: string; value: number; suffix?: string; max?: number }) {
  const pct = (value / max) * 100;
  const color = pct > 80 ? "bg-red-500" : pct > 60 ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums text-foreground font-medium">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-background/60 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function SystemHealth({ health }: Props) {
  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">System Health</h3>
      <div className="space-y-3">
        <Gauge label="CPU" value={health.cpu} />
        <Gauge label="Memory" value={health.memory} />
        <Gauge label="API calls/min" value={health.apiPerMin} suffix="" max={400} />
        <Gauge label="Active tasks" value={health.activeTasks} suffix="" max={40} />
      </div>
    </Card>
  );
}
