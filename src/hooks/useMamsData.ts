import { useCallback, useEffect, useRef, useState } from "react";
import { generateHealth, type Agent, type Alert, type ActivityEntry } from "@/lib/mams-mock";
import {
  fetchActivity,
  fetchAgents,
  fetchAlerts,
  fetchRevenue,
  fetchSettings,
  saveSettings,
  simulateTick,
  type RevenueSummary,
  type Settings,
} from "@/lib/mams-db";

export function useMamsData() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [health, setHealth] = useState(() => generateHealth());
  const [revenueSeries, setRevenueSeries] = useState<{ date: string; revenue: number; target: number }[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary>({ daily: 0, weekly: 0, monthly: 0, yearly: 0 });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const agentsRef = useRef<Agent[]>([]);
  const settingsRef = useRef<Settings | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [ag, al, ac, rv, st] = await Promise.all([
        fetchAgents(),
        fetchAlerts(),
        fetchActivity(),
        fetchRevenue(),
        fetchSettings(),
      ]);
      agentsRef.current = ag;
      settingsRef.current = st;
      setAgents(ag);
      setAlerts(al);
      setActivity(ac);
      setRevenue(rv.summary);
      setRevenueSeries(rv.series);
      setSettings(st);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo conectar con la base de datos");
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(async () => {
      setHealth(generateHealth());
      const st = settingsRef.current;
      if (st && !st.kill_switch && agentsRef.current.length) {
        try {
          await simulateTick(agentsRef.current);
        } catch {
          /* ignore, refresh will surface errors */
        }
      }
      refresh();
    }, 5000);
    return () => clearInterval(id);
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

  return { agents, alerts, activity, health, revenueSeries, revenue, settings, updateSettings, refresh, error };
}
