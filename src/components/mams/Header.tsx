import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Activity, Zap } from "lucide-react";
import { useState } from "react";

type Mode = "Autónomo" | "Supervisado" | "Depuración";

export function Header() {
  const [mode, setMode] = useState<Mode>("Autónomo");
  const [killed, setKilled] = useState(false);

  const modeColors: Record<Mode, string> = {
    "Autónomo": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    "Supervisado": "bg-amber-500/15 text-amber-400 border-amber-500/30",
    "Depuración": "bg-sky-500/15 text-sky-400 border-sky-500/30",
  };

  const modes: Mode[] = ["Autónomo", "Supervisado", "Depuración"];

  return (
    <header className="border-b border-border bg-card/40 backdrop-blur">
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-emerald-500 to-sky-600 grid place-items-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">
              MAMS <span className="text-muted-foreground font-normal">— Sistema Matricial Agéntico de Dinero</span>
            </h1>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Activity className="w-3 h-3" /> Sistema autónomo multi-agente de dinero · v1.0
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/40 p-0.5">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                  mode === m ? modeColors[m] + " border" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <Badge variant="outline" className={modeColors[mode]}>
            Mode: {mode}
          </Badge>

          <div
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors ${
              killed ? "border-red-500 bg-red-500/15" : "border-red-500/40 bg-red-500/5"
            }`}
          >
            <span className={`text-[11px] font-bold uppercase tracking-wider ${killed ? "text-red-300" : "text-red-400"}`}>
              {killed ? "KILLED" : "Kill Switch"}
            </span>
            <Switch checked={killed} onCheckedChange={setKilled} className="data-[state=checked]:bg-red-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
