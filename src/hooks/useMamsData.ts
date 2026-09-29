import { useCallback, useEffect, useRef, useState } from "react";
import { generateHealth, type Agent, type Alert, type ActivityEntry } from "@/lib/mams-mock";
import {
  fetchActivity,
  fetchAgents,
  fetchAlerts,
  fetchPendingApprovals,
  fetchRevenue,
  fetchSettings,
  saveSettings,
  approvePendingRequest,
  rejectPendingRequest,
  simulateTick,
  type RevenueSummary,
  type Settings,
  type PendingApproval,
} from "@/lib/mams-db";
import { supabase } from "@/integrations/supabase/client";

export function useMamsData() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [health, setHealth] = useState(() => generateHealth());
  const [revenueSeries, setRevenueSeries] = useState<
    { date: string; revenue: number; target: number }[]
  >([]);
  const [revenue, setRevenue] = useState<RevenueSummary>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const agentsRef = useRef<Agent[]>([]);
  const settingsRef = useRef<Settings | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [ag, al, ac, pa, rv, st] = await Promise.all([
        fetchAgents(),
        fetchAlerts(),
        fetchActivity(),
        fetchPendingApprovals(),
        fetchRevenue(),
        fetchSettings(),
      ]);
      agentsRef.current = ag;
      settingsRef.current = st;
      setAgents(ag);
      setAlerts(al);
      setActivity(ac);
      setPendingApprovals(pa);
      setRevenue(rv.summary);
      setRevenueSeries(rv.series);
      setSettings(st);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar con la base de datos");
    }
  }, []);

  // Supabase Realtime Subscription: Instant updates when DB changes
  useEffect(() => {
    refresh();

    const channel = supabase
      .channel("mams-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agents" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_log" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pending_approvals" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => void refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_settings" },
        () => void refresh(),
      )
      .subscribe();

    const intervalId = setInterval(async () => {
      setHealth(generateHealth());
      const st = settingsRef.current;
      if (st && !st.kill_switch && agentsRef.current.length) {
        try {
          await simulateTick(agentsRef.current);
        } catch {
          /* ignore */
        }
      }
    }, 6000);

    return () => {
      void supabase.removeChannel(channel);
      clearInterval(intervalId);
    };
  }, [refresh]);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      setSettings((s) => (s ? { ...s, ...patch } : s));
      if (settingsRef.current) settingsRef.current = { ...settingsRef.current, ...patch };
      await saveSettings(patch);
      refresh();
    },
    [refresh],
  );

  const handleApprove = useCallback(
    async (id: string) => {
      await approvePendingRequest(id, "Administrador");
      refresh();
    },
    [refresh],
  );

  const handleReject = useCallback(
    async (id: string) => {
      await rejectPendingRequest(id, "Administrador");
      refresh();
    },
    [refresh],
  );

  return {
    agents,
    alerts,
    activity,
    pendingApprovals,
    health,
    revenueSeries,
    revenue,
    settings,
    updateSettings,
    approvePending: handleApprove,
    rejectPending: handleReject,
    refresh,
    error,
  };
}
