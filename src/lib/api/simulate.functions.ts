import { createServerFn } from "@tanstack/react-start";
import { fetchAgents, simulateTick, fetchSettings } from "@/lib/mams-db";

export const runServerSimulationTick = createServerFn({ method: "POST" }).handler(async () => {
  const settings = await fetchSettings().catch(() => null);
  if (settings?.kill_switch) {
    return { success: false, reason: "Kill switch is active" };
  }
  const agents = await fetchAgents();
  await simulateTick(agents);
  return { success: true, timestamp: new Date().toISOString() };
});
