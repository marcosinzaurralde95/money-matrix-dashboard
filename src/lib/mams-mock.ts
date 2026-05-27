export type AgentStatus = "active" | "idle" | "error";
export type Severity = "info" | "warning" | "critical";

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  lastAction: string;
  lastActionAt: number;
}

export interface Alert {
  id: string;
  ts: number;
  severity: Severity;
  message: string;
}

export interface ActivityEntry {
  id: string;
  ts: number;
  agent: string;
  action: string;
}

export const TARGETS = {
  daily: 333,
  weekly: 2333,
  monthly: 10000,
  yearly: 120000,
};

const AGENT_SEED: Omit<Agent, "status" | "lastAction" | "lastActionAt">[] = [
  { id: "director", name: "Director", role: "Orquestador Ejecutivo Principal" },
  { id: "researcher", name: "Investigador", role: "Especialista en Inteligencia de Mercado" },
  { id: "creator", name: "Creador", role: "Especialista en Producción de Contenido" },
  { id: "marketer", name: "Marketing", role: "Crecimiento y Distribución" },
  { id: "sales", name: "Ventas", role: "Conversión de Ingresos" },
  { id: "analyst", name: "Analista", role: "Datos e Insights" },
  { id: "quality", name: "Calidad", role: "QA y Estándares" },
  { id: "compliance", name: "Cumplimiento", role: "Riesgo y Legal" },
  { id: "finance", name: "Finanzas", role: "Tesorería y Contabilidad" },
];

const ACTIONS: Record<string, string[]> = {
  director: ["Asignó tareas a 4 agentes", "Revisó OKRs trimestrales", "Aprobó $240 en publicidad"],
  researcher: ["Analizó 128 páginas de competencia", "Identificó 3 tendencias emergentes", "Actualizó índice de palabras clave"],
  creator: ["Generó 5 publicaciones largas", "Produjo 12 variantes sociales", "Redactó secuencia de email"],
  marketer: ["Lanzó campaña en LinkedIn", "Inició prueba A/B", "Programó 8 publicaciones"],
  sales: ["Cerró trato: $189", "Envió 24 correos en frío", "Agendó 3 demos"],
  analyst: ["Calculó deltas de conversión", "Generó reporte de embudo", "Detectó anomalía en CTR"],
  quality: ["Revisó 18 resultados", "Marcó 1 alucinación", "Aprobó lote de contenido"],
  compliance: ["Escaneó 42 docs por PII", "Revisó actualización de TOS", "Validó 3 divulgaciones"],
  finance: ["Reconcilió pagos de Stripe", "Actualizó modelo de flujo", "Registró $412 de ingresos"],
};

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateAgents(): Agent[] {
  return AGENT_SEED.map((a) => {
    const r = Math.random();
    const status: AgentStatus = r < 0.7 ? "active" : r < 0.92 ? "idle" : "error";
    return {
      ...a,
      status,
      lastAction: rand(ACTIONS[a.id]),
      lastActionAt: Date.now() - Math.floor(Math.random() * 1000 * 60 * 30),
    };
  });
}

export function generateRevenueSeries(days = 30): { date: string; revenue: number; target: number }[] {
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const base = TARGETS.daily;
    const variance = (Math.sin(i / 3) + Math.random() * 0.8 - 0.2) * base * 0.6;
    out.push({
      date: d.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
      revenue: Math.max(0, Math.round(base + variance)),
      target: TARGETS.daily,
    });
  }
  return out;
}

const ALERT_TEMPLATES: { severity: Severity; message: string }[] = [
  { severity: "info", message: "El Director rebalanceó la carga de los agentes" },
  { severity: "info", message: "Nueva campaña desplegada por Marketing" },
  { severity: "warning", message: "Límite de API cercano al máximo (82%)" },
  { severity: "warning", message: "Conversión de Ventas bajo el promedio de 7 días" },
  { severity: "critical", message: "Cumplimiento marcó un mensaje saliente" },
  { severity: "info", message: "Finanzas reconcilió $1,204 en pagos" },
  { severity: "warning", message: "Cola de salida del Creador acumulándose" },
  { severity: "info", message: "Calidad aprobó 24 artefactos" },
  { severity: "critical", message: "Gasto anómalo detectado: $312 en 5m" },
  { severity: "info", message: "Investigador actualizó el índice de mercado" },
];

export function generateAlerts(n = 10): Alert[] {
  return Array.from({ length: n }, (_, i) => {
    const t = rand(ALERT_TEMPLATES);
    return {
      id: `alert-${Date.now()}-${i}`,
      ts: Date.now() - i * 1000 * 60 * Math.floor(Math.random() * 12 + 1),
      severity: t.severity,
      message: t.message,
    };
  });
}

export function generateActivity(n = 25): ActivityEntry[] {
  const agentIds = AGENT_SEED.map((a) => a.id);
  return Array.from({ length: n }, (_, i) => {
    const id = rand(agentIds);
    const agent = AGENT_SEED.find((a) => a.id === id)!;
    return {
      id: `act-${Date.now()}-${i}`,
      ts: Date.now() - i * 1000 * 60 * Math.floor(Math.random() * 5 + 1),
      agent: agent.name,
      action: rand(ACTIONS[id]),
    };
  });
}

export function generateHealth() {
  return {
    cpu: Math.round(30 + Math.random() * 50),
    memory: Math.round(40 + Math.random() * 45),
    apiPerMin: Math.round(120 + Math.random() * 180),
    activeTasks: Math.round(8 + Math.random() * 22),
  };
}

export function currentRevenue() {
  return {
    daily: Math.round(TARGETS.daily * (0.5 + Math.random() * 0.7)),
    weekly: Math.round(TARGETS.weekly * (0.4 + Math.random() * 0.7)),
    monthly: Math.round(TARGETS.monthly * (0.3 + Math.random() * 0.7)),
    yearly: Math.round(TARGETS.yearly * (0.25 + Math.random() * 0.6)),
  };
}

export function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatRelative(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `hace ${diff}s`;
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  return `hace ${Math.floor(diff / 3600)}h`;
}
