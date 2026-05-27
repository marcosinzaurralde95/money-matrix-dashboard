import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Props {
  label: string;
  value: number;
  target: number;
  period: string;
}

export function MetricCard({ label, value, target, period }: Props) {
  const pct = Math.min(100, (value / target) * 100);
  const ahead = pct >= 100;
  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground">{period}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums text-foreground">
          ${value.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground">/ ${target.toLocaleString()}</span>
      </div>
      <div className="mt-3 space-y-1">
        <Progress value={pct} className="h-1.5" />
        <div className="flex justify-between text-[11px] tabular-nums">
          <span className={ahead ? "text-emerald-400" : "text-muted-foreground"}>
            {pct.toFixed(1)}%
          </span>
          <span className={ahead ? "text-emerald-400" : "text-amber-400"}>
            {ahead ? "On target" : `$${(target - value).toLocaleString()} to go`}
          </span>
        </div>
      </div>
    </Card>
  );
}
