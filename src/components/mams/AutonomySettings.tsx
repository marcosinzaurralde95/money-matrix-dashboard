import { Card } from "@/components/ui/card";

const settings = [
  { label: "Límite de auto-aprobación", value: "$100", desc: "Los agentes actúan sin revisión" },
  { label: "Aprobación humana sobre", value: "$1,000", desc: "Requiere autorización humana" },
  { label: "Presupuesto diario máximo", value: "$500", desc: "Tope de gasto entre todos los agentes" },
  { label: "Agentes concurrentes máx.", value: "10", desc: "Límite de ejecución paralela" },
];

export function AutonomySettings() {
  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Configuración de Autonomía</h3>
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
