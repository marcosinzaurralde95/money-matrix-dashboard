import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Settings } from "@/lib/mams-db";

type Key = "auto_approval_limit" | "human_approval_above" | "max_daily_budget" | "max_concurrent_agents";

const fields: { key: Key; label: string; desc: string; money: boolean }[] = [
  { key: "auto_approval_limit", label: "Límite de auto-aprobación", desc: "Los agentes actúan sin revisión", money: true },
  { key: "human_approval_above", label: "Aprobación humana sobre", desc: "Requiere autorización humana", money: true },
  { key: "max_daily_budget", label: "Presupuesto diario máximo", desc: "Tope de gasto entre todos los agentes", money: true },
  { key: "max_concurrent_agents", label: "Agentes concurrentes máx.", desc: "Límite de ejecución paralela", money: false },
];

export function AutonomySettings({
  settings,
  onSave,
}: {
  settings: Settings | null;
  onSave: (patch: Partial<Settings>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<Key, string>>({} as Record<Key, string>);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (settings && !editing) {
      setDraft(Object.fromEntries(fields.map((f) => [f.key, String(settings[f.key])])) as Record<Key, string>);
    }
  }, [settings, editing]);

  const save = async () => {
    const patch: Partial<Settings> = {};
    for (const f of fields) {
      const n = Number(draft[f.key]);
      if (!Number.isFinite(n) || n < 0) {
        setMsg(`Valor inválido en "${f.label}"`);
        return;
      }
      patch[f.key] = f.money ? n : Math.round(n);
    }
    setSaving(true);
    try {
      await onSave(patch);
      setEditing(false);
      setMsg("Cambios guardados");
    } catch {
      setMsg("No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Configuración de Autonomía</h3>
        {settings && !editing && (
          <Button size="sm" variant="outline" onClick={() => { setEditing(true); setMsg(null); }}>
            Editar
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0">
            <div>
              <p className="text-xs text-foreground">{f.label}</p>
              <p className="text-[10px] text-muted-foreground">{f.desc}</p>
            </div>
            {editing ? (
              <Input
                type="number"
                min={0}
                value={draft[f.key] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                className="w-24 h-8 text-right font-mono"
              />
            ) : (
              <span className="text-sm font-mono font-semibold text-emerald-400 tabular-nums">
                {settings ? (f.money ? `$${Number(settings[f.key]).toLocaleString("en-US")}` : settings[f.key]) : "—"}
              </span>
            )}
          </div>
        ))}
      </div>
      {editing && (
        <div className="flex gap-2 mt-4">
          <Button size="sm" onClick={save} disabled={saving}>{saving ? "Guardando…" : "Guardar"}</Button>
          <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setMsg(null); }}>Cancelar</Button>
        </div>
      )}
      {msg && <p className="text-[11px] text-muted-foreground mt-3">{msg}</p>}
    </Card>
  );
}
