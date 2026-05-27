import { useEffect, useState } from "react";
import {
  generateAgents,
  generateAlerts,
  generateActivity,
  generateHealth,
  generateRevenueSeries,
  currentRevenue,
  type Agent,
  type Alert,
  type ActivityEntry,
} from "@/lib/mams-mock";

export function useMamsData() {
  const [agents, setAgents] = useState<Agent[]>(() => generateAgents());
  const [alerts, setAlerts] = useState<Alert[]>(() => generateAlerts());
  const [activity, setActivity] = useState<ActivityEntry[]>(() => generateActivity());
  const [health, setHealth] = useState(() => generateHealth());
  const [revenueSeries, setRevenueSeries] = useState(() => generateRevenueSeries());
  const [revenue, setRevenue] = useState(() => currentRevenue());

  useEffect(() => {
    const id = setInterval(() => {
      setAgents(generateAgents());
      setHealth(generateHealth());
      setRevenue(currentRevenue());
      setRevenueSeries((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        next[next.length - 1] = {
          ...last,
          revenue: Math.max(0, last.revenue + Math.round((Math.random() - 0.4) * 40)),
        };
        return next;
      });
      // Prepend a new activity entry
      setActivity((prev) => {
        const fresh = generateActivity(1)[0];
        return [{ ...fresh, ts: Date.now(), id: `act-${Date.now()}` }, ...prev].slice(0, 30);
      });
      // Occasionally add a new alert
      if (Math.random() < 0.4) {
        setAlerts((prev) => {
          const fresh = generateAlerts(1)[0];
          return [{ ...fresh, ts: Date.now(), id: `alert-${Date.now()}` }, ...prev].slice(0, 10);
        });
      }
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return { agents, alerts, activity, health, revenueSeries, revenue };
}
