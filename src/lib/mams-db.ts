import { supabase } from "@/integrations/supabase/client";
import type { Agent, Alert, ActivityEntry, Severity, AgentStatus } from "@/lib/mams-mock";

export type Mode = "Autónomo" | "Supervisado" | "Depuración";

export interface Settings {
  auto_approval_limit: number;
  human_approval_above: number;
  max_daily_budget: number;
  max_concurrent_agents: number;
  mode: Mode;
  kill_switch: boolean;
}

export interface AgentTask {
  id: string;
  name: string;
  status: string;
  ts: number;
}

export interface RevenueSummary {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

const ts = (s: string) => new Date(s).getTime();

export async function fetchAgents(): Promise<Agent[]> {
  const { data, error } = await supabase.from("agents").select("*").order("sort_order");
  if (error) throw error;
  return data.map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role,
    status: a.status as AgentStatus,
    paused: a.paused,
    forcedAt: a.forced_at ? ts(a.forced_at) : undefined,
    lastAction: a.last_action,
    lastActionAt: ts(a.last_action_at),
  }));
}

export async function fetchAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(10);
  if (error) throw error;
  return data.map((a) => ({ id: a.id, severity: a.severity as Severity, message: a.message, ts: ts(a.created_at) }));
}

export async function fetchActivity(): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data.map((a) => ({ id: a.id, agent: a.agent_name, action: a.action, ts: ts(a.created_at) }));
}

export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase.from("system_settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return {
    auto_approval_limit: Number(data.auto_approval_limit),
    human_approval_above: Number(data.human_approval_above),
    max_daily_budget: Number(data.max_daily_budget),
    max_concurrent_agents: data.max_concurrent_agents,
    mode: data.mode as Mode,
    kill_switch: data.kill_switch,
  };
}

export async function saveSettings(patch: Partial<Settings>) {
  const { error } = await supabase
    .from("system_settings")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;
}

export async function fetchRevenue(): Promise<{
  summary: RevenueSummary;
  series: { date: string; revenue: number; target: number }[];
}> {
  const { data, error } = await supabase.rpc("revenue_overview");
  if (error) throw error;
  const d = data as unknown as {
    daily: number; weekly: number; monthly: number; yearly: number;
    series: { day: string; revenue: number }[];
  };
  return {
    summary: {
      daily: Math.round(Number(d.daily)),
      weekly: Math.round(Number(d.weekly)),
      monthly: Math.round(Number(d.monthly)),
      yearly: Math.round(Number(d.yearly)),
    },
    series: (d.series ?? []).map((p) => ({
      date: new Date(p.day + "T12:00:00").toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
      revenue: Math.round(Number(p.revenue)),
      target: 333,
    })),
  };
}

export async function fetchAgentTasks(agentId: string): Promise<AgentTask[]> {
  const { data, error } = await supabase
    .from("agent_tasks")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  return data.map((t) => ({ id: t.id, name: t.name, status: t.status, ts: ts(t.created_at) }));
}

export async function setAgentPaused(agent: Agent, paused: boolean) {
  const { error } = await supabase.from("agents").update({ paused }).eq("id", agent.id);
  if (error) throw error;
  await supabase.from("activity_log").insert({
    agent_id: agent.id,
    agent_name: agent.name,
    action: paused ? "Pausado manualmente" : "Reanudado manualmente",
  });
}

export async function forceAgentRun(agent: Agent) {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("agents")
    .update({ forced_at: now, status: "active", last_action: "Ejecución forzada manualmente", last_action_at: now })
    .eq("id", agent.id);
  if (error) throw error;
  await Promise.all([
    supabase.from("agent_tasks").insert({ agent_id: agent.id, name: "Ejecución forzada manualmente", status: "en curso" }),
    supabase.from("activity_log").insert({ agent_id: agent.id, agent_name: agent.name, action: "Ejecución forzada manualmente" }),
  ]);
}

// --- Simulated agent work, written to the database (stand-in for real agents) ---
const ACTIONS: Record<string, string[]> = {
  director: ["Asignó tareas a 4 agentes", "Revisó OKRs trimestrales", "Aprobó $240 en publicidad"],
  researcher: ["Analizó 128 páginas de competencia", "Identificó 3 tendencias emergentes", "Actualizó índice de palabras clave"],
  creator: ["Generó 5 publicaciones largas", "Produjo 12 variantes sociales", "Redactó secuencia de email"],
  marketer: ["Lanzó campaña en LinkedIn", "Inició prueba A/B", "Programó 8 publicaciones"],
  sales: ["Cerró trato", "Envió 24 correos en frío", "Agendó 3 demos"],
  analyst: ["Calculó deltas de conversión", "Generó reporte de embudo", "Detectó anomalía en CTR"],
  quality: ["Revisó 18 resultados", "Marcó 1 alucinación", "Aprobó lote de contenido"],
  compliance: ["Escaneó 42 docs por PII", "Revisó actualización de TOS", "Validó 3 divulgaciones"],
  finance: ["Reconcilió pagos de Stripe", "Actualizó modelo de flujo", "Registró ingresos"],
};
const ALERTS: { severity: Severity; message: string }[] = [
  { severity: "info", message: "El Director rebalanceó la carga de los agentes" },
  { severity: "info", message: "Nueva campaña desplegada por Marketing" },
  { severity: "warning", message: "Límite de API cercano al máximo (82%)" },
  { severity: "warning", message: "Conversión de Ventas bajo el promedio de 7 días" },
  { severity: "critical", message: "Cumplimiento marcó un mensaje saliente" },
  { severity: "info", message: "Calidad aprobó 24 artefactos" },
];
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export async function simulateTick(agents: Agent[]) {
  const candidates = agents.filter((a) => !a.paused);
  if (!candidates.length) return;
  const agent = pick(candidates);
  const r = Math.random();
  const status: AgentStatus = r < 0.8 ? "active" : r < 0.95 ? "idle" : "error";
  let action = pick(ACTIONS[agent.id] ?? ["Procesó tarea"]);
  const jobs: PromiseLike<unknown>[] = [];

  if ((agent.id === "sales" || agent.id === "finance") && Math.random() < 0.7) {
    const amount = Math.round(40 + Math.random() * 160);
    action = agent.id === "sales" ? `Cerró trato: $${amount}` : `Registró $${amount} de ingresos`;
    jobs.push(supabase.from("transactions").insert({ agent_id: agent.id, amount, description: action }));
  }
  const now = new Date().toISOString();
  jobs.push(supabase.from("agents").update({ status, last_action: action, last_action_at: now }).eq("id", agent.id));
  jobs.push(supabase.from("activity_log").insert({ agent_id: agent.id, agent_name: agent.name, action }));
  jobs.push(supabase.from("agent_tasks").insert({ agent_id: agent.id, name: action, status: status === "error" ? "fallida" : "completada" }));
  if (status === "error") {
    jobs.push(supabase.from("alerts").insert({ severity: "critical", message: `${agent.name} reportó un error en su última tarea` }));
  } else if (Math.random() < 0.2) {
    jobs.push(supabase.from("alerts").insert(pick(ALERTS)));
  }
  await Promise.all(jobs);
}
