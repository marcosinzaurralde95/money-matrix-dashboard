import { Card } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { Alert } from "@/lib/mams-mock";
import { formatTime } from "@/lib/mams-mock";

const config = {
  info: { Icon: Info, color: "text-sky-400", border: "border-l-sky-400" },
  warning: { Icon: AlertTriangle, color: "text-amber-400", border: "border-l-amber-400" },
  critical: { Icon: AlertCircle, color: "text-red-400", border: "border-l-red-400" },
};

export function AlertsFeed({ alerts }: { alerts: Alert[] }) {
  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-sm font-semibold text-foreground mb-3">Alertas Recientes</h3>
      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
        {alerts.map((a) => {
          const c = config[a.severity];
          return (
            <div
              key={a.id}
              className={`flex items-start gap-2 py-1.5 px-2 rounded border-l-2 bg-background/40 ${c.border}`}
            >
              <c.Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${c.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-foreground truncate">{a.message}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-[10px] uppercase font-medium ${c.color}`}>{a.severity}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{formatTime(a.ts)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
