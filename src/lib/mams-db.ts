import { supabase } from "@/integrations/supabase/client";
import type { Agent, Alert, ActivityEntry, Severity, AgentStatus } from "@/lib/mams-mock";
import { executeAgentReasoning } from "@/lib/ai-agent-engine";

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

export interface PendingApproval {
  id: string;
  agentId: string | null;
  agentName: string;
  action: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  requestedAt: number;
  reviewedAt?: number;
  reviewedBy?: string;
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
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return data.map((a) => ({
    id: a.id,
    severity: a.severity as Severity,
    message: a.message,
    ts: ts(a.created_at),
  }));
}

export async function fetchActivity(): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data.map((a) => ({
    id: a.id,
    agent: a.agent_name,
    action: a.action,
    ts: ts(a.created_at),
  }));
}

export async function fetchPendingApprovals(): Promise<PendingApproval[]> {
  const { data, error } = await supabase
    .from("pending_approvals")
    .select("*")
    .eq("status", "pending")
    .order("requested_at", { ascending: false })
    .limit(15);
  if (error) return [];
  return (data || []).map((p) => ({
    id: p.id,
    agentId: p.agent_id,
    agentName: p.agent_name,
    action: p.action,
    amount: Number(p.amount),
    status: p.status as "pending" | "approved" | "rejected",
    requestedAt: ts(p.requested_at),
    reviewedAt: p.reviewed_at ? ts(p.reviewed_at) : undefined,
    reviewedBy: p.reviewed_by ?? undefined,
  }));
}

export async function approvePendingRequest(id: string, reviewer = "Admin") {
  const now = new Date().toISOString();

  // Get item
  const { data: item } = await supabase.from("pending_approvals").select("*").eq("id", id).single();

  if (!item) return;

  // Mark approved
  await supabase
    .from("pending_approvals")
    .update({ status: "approved", reviewed_at: now, reviewed_by: reviewer })
    .eq("id", id);

  // If there's an amount, record transaction
  if (item.amount > 0) {
    await supabase.from("transactions").insert({
      agent_id: item.agent_id,
      amount: Number(item.amount),
      description: `[Aprobado por ${reviewer}] ${item.action}`,
    });
  }

  // Log activity
  await supabase.from("activity_log").insert({
    agent_id: item.agent_id,
    agent_name: item.agent_name,
    action: `Aprobado por ${reviewer}: $${item.amount}`,
  });
}

export async function rejectPendingRequest(id: string, reviewer = "Admin") {
  const now = new Date().toISOString();

  const { data: item } = await supabase.from("pending_approvals").select("*").eq("id", id).single();

  if (!item) return;

  await supabase
    .from("pending_approvals")
    .update({ status: "rejected", reviewed_at: now, reviewed_by: reviewer })
    .eq("id", id);

  await supabase.from("activity_log").insert({
    agent_id: item.agent_id,
    agent_name: item.agent_name,
    action: `Rechazado por ${reviewer}: ${item.action}`,
  });
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
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
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
      date: new Date(p.day + "T12:00:00").toLocaleDateString("es-ES", {
        month: "short",
        day: "numeric",
      }),
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
    .update({
      forced_at: now,
      status: "active",
      last_action: "Ejecución forzada manualmente",
      last_action_at: now,
    })
    .eq("id", agent.id);
  if (error) throw error;
  await Promise.all([
    supabase
      .from("agent_tasks")
      .insert({ agent_id: agent.id, name: "Ejecución forzada manualmente", status: "en curso" }),
    supabase.from("activity_log").insert({
      agent_id: agent.id,
      agent_name: agent.name,
      action: "Ejecución forzada manualmente",
    }),
  ]);
}

const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export async function simulateTick(agents: Agent[]) {
  const settings = await fetchSettings().catch(() => null);
  if (settings?.kill_switch) return;

  const candidates = agents.filter((a) => !a.paused);
  if (!candidates.length) return;

  const agent = pick(candidates);
  const autoApprovalLimit = settings?.auto_approval_limit ?? 100;
  const humanApprovalAbove = settings?.human_approval_above ?? 1000;

  const result = await executeAgentReasoning(agent, autoApprovalLimit, humanApprovalAbove);

  const jobs: PromiseLike<unknown>[] = [];
  const now = new Date().toISOString();

  if (result.requiresHumanApproval && result.approvalAmount) {
    jobs.push(
      supabase.from("pending_approvals").insert({
        agent_id: agent.id,
        agent_name: agent.name,
        action: result.action,
        amount: result.approvalAmount,
        status: "pending",
      }),
    );
  } else if (result.amount && result.amount > 0) {
    jobs.push(
      supabase.from("transactions").insert({
        agent_id: agent.id,
        amount: result.amount,
        description: `${agent.name}: ${result.action}`,
      }),
    );
  }

  jobs.push(
    supabase
      .from("agents")
      .update({ status: result.status, last_action: result.action, last_action_at: now })
      .eq("id", agent.id),
  );

  jobs.push(
    supabase
      .from("activity_log")
      .insert({ agent_id: agent.id, agent_name: agent.name, action: result.action }),
  );

  jobs.push(
    supabase.from("agent_tasks").insert({
      agent_id: agent.id,
      name: result.action,
      status: result.status === "error" ? "fallida" : "completada",
    }),
  );

  if (result.alert) {
    jobs.push(
      supabase
        .from("alerts")
        .insert({ severity: result.alert.severity, message: result.alert.message }),
    );
  }

  await Promise.all(jobs);
}
