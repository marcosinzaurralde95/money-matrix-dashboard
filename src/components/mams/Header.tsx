import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Activity, Download, ShieldCheck, UserCheck, Zap } from "lucide-react";
import type { Mode, Settings, RevenueSummary, PendingApproval } from "@/lib/mams-db";
import type { Agent, Alert, ActivityEntry } from "@/lib/mams-mock";
import { exportActivityCSV, exportSystemStateJSON } from "@/lib/export-reports";

interface HeaderProps {
  settings: Settings | null;
  onChange: (p: Partial<Settings>) => void;
  agents: Agent[];
  alerts: Alert[];
  activity: ActivityEntry[];
  revenue: RevenueSummary;
  pendingApprovals: PendingApproval[];
}

export function Header({
  settings,
  onChange,
  agents,
  alerts,
  activity,
  revenue,
  pendingApprovals,
}: HeaderProps) {
  const [userRole, setUserRole] = useState<"Admin" | "Espectador">("Admin");
  const mode: Mode = settings?.mode ?? "Autónomo";
  const killed = settings?.kill_switch ?? false;

  const setMode = (m: Mode) => {
    if (userRole !== "Admin") {
      alert("Se requieren permisos de Administrador para cambiar el modo de operación.");
      return;
    }
    onChange({ mode: m });
  };

  const setKilled = (k: boolean) => {
    if (userRole !== "Admin") {
      alert("Se requieren permisos de Administrador para activar el interruptor de emergencia.");
      return;
    }
    onChange({ kill_switch: k });
  };

  const modeColors: Record<Mode, string> = {
    Autónomo: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    Supervisado: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    Depuración: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  };

  const modes: Mode[] = ["Autónomo", "Supervisado", "Depuración"];

  return (
    <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-30">
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-emerald-500 to-sky-600 grid place-items-center shadow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">
              MAMS{" "}
              <span className="text-muted-foreground font-normal">
                — Sistema Matricial Agéntico de Dinero
              </span>
            </h1>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" /> Sistema autónomo
              multi-agente de dinero · v1.0
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Download className="size-3.5" />
                Reportes
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Exportación de Datos</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => exportActivityCSV(activity)}
                className="text-xs cursor-pointer"
              >
                Exportar Actividad (CSV)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  exportSystemStateJSON({
                    agents,
                    alerts,
                    activity,
                    revenue,
                    settings,
                    pendingApprovals,
                  })
                }
                className="text-xs cursor-pointer"
              >
                Estado Completo (JSON)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs border border-border/60"
            onClick={() => setUserRole(userRole === "Admin" ? "Espectador" : "Admin")}
          >
            {userRole === "Admin" ? (
              <ShieldCheck className="size-3.5 text-emerald-400" />
            ) : (
              <UserCheck className="size-3.5 text-sky-400" />
            )}
            {userRole === "Admin" ? "Rol: Admin" : "Rol: Espectador"}
          </Button>

          <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/40 p-0.5">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2.5 py-1 text-[11px] rounded font-medium transition-colors ${
                  mode === m
                    ? modeColors[m] + " border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <Badge variant="outline" className={modeColors[mode]}>
            Modo: {mode}
          </Badge>

          <div
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 transition-colors ${
              killed ? "border-red-500 bg-red-500/15" : "border-red-500/40 bg-red-500/5"
            }`}
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${killed ? "text-red-300" : "text-red-400"}`}
            >
              {killed ? "DETENIDO" : "Interruptor"}
            </span>
            <Switch
              checked={killed}
              onCheckedChange={setKilled}
              className="data-[state=checked]:bg-red-500"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
