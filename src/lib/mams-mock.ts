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
  { id: "director", name: "Director", role: "Chief Executive Orchestrator" },
  { id: "researcher", name: "Researcher", role: "Market Intelligence Specialist" },
  { id: "creator", name: "Creator", role: "Content Production Specialist" },
  { id: "marketer", name: "Marketer", role: "Growth & Distribution" },
  { id: "sales", name: "Sales", role: "Revenue Conversion" },
  { id: "analyst", name: "Analyst", role: "Data & Insights" },
  { id: "quality", name: "Quality", role: "QA & Standards" },
  { id: "compliance", name: "Compliance", role: "Risk & Legal" },
  { id: "finance", name: "Finance", role: "Treasury & Accounting" },
];

const ACTIONS: Record<string, string[]> = {
  director: ["Allocated tasks to 4 agents", "Reviewed quarterly OKRs", "Approved $240 ad spend"],
  researcher: ["Scraped 128 competitor pages", "Identified 3 emerging trends", "Updated keyword index"],
  creator: ["Generated 5 long-form posts", "Produced 12 social variants", "Drafted email sequence"],
  marketer: ["Pushed campaign to LinkedIn", "A/B test launched", "Scheduled 8 posts"],
  sales: ["Closed deal: $189", "Sent 24 outbound emails", "Booked 3 demos"],
  analyst: ["Computed conversion deltas", "Built funnel report", "Detected CTR anomaly"],
  quality: ["Reviewed 18 outputs", "Flagged 1 hallucination", "Approved content batch"],
  compliance: ["Scanned 42 docs for PII", "Reviewed TOS update", "Cleared 3 disclosures"],
  finance: ["Reconciled Stripe payouts", "Updated cashflow model", "Logged $412 revenue"],
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
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.max(0, Math.round(base + variance)),
      target: TARGETS.daily,
    });
  }
  return out;
}

const ALERT_TEMPLATES: { severity: Severity; message: string }[] = [
  { severity: "info", message: "Director rebalanced agent workload" },
  { severity: "info", message: "New campaign deployed by Marketer" },
  { severity: "warning", message: "API rate limit approaching (82%)" },
  { severity: "warning", message: "Sales conversion below 7-day average" },
  { severity: "critical", message: "Compliance flagged outbound message" },
  { severity: "info", message: "Finance reconciled $1,204 in payouts" },
  { severity: "warning", message: "Creator output queue backing up" },
  { severity: "info", message: "Quality approved 24 artifacts" },
  { severity: "critical", message: "Anomalous spend detected: $312 in 5m" },
  { severity: "info", message: "Researcher updated market index" },
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
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatRelative(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
