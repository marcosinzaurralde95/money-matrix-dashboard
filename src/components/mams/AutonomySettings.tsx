import { Card } from "@/components/ui/card";

const settings = [
  { label: "Auto-approval limit", value: "$100", desc: "Agents act without review" },
  { label: "Human approval above", value: "$1,000", desc: "Requires human sign-off" },
  { label: "Max daily budget", value: "$500", desc: "Spend cap across all agents" },
  { label: "Max concurrent agents", value: "10", desc: "Parallel execution ceiling" },
];

export function AutonomySettings() {
  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Autonomy Settings</h3>
      <div className="space-y-3">
        {settings.map((s) => (
          <div key={s.label} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0">
            <div>
              <p className="text-xs text-foreground">{s.label}</p>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </div>
            <span className="text-sm font-mono font-semibold text-emerald-400 tabular-nums">{s.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
