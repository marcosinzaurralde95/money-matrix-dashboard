import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/mams/Header";
import { MetricCard } from "@/components/mams/MetricCard";
import { RevenueChart } from "@/components/mams/RevenueChart";
import { AgentGrid } from "@/components/mams/AgentGrid";
import { SystemHealth } from "@/components/mams/SystemHealth";
import { AutonomySettings } from "@/components/mams/AutonomySettings";
import { AlertsFeed } from "@/components/mams/AlertsFeed";
import { ActivityLog } from "@/components/mams/ActivityLog";
import { useMamsData } from "@/hooks/useMamsData";
import { TARGETS } from "@/lib/mams-mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MAMS — Matrix Agentic Money System" },
      { name: "description", content: "Real-time dashboard for a multi-agent autonomous money system." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { agents, alerts, activity, health, revenueSeries, revenue } = useMamsData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Daily Revenue" value={revenue.daily} target={TARGETS.daily} period="Today" />
          <MetricCard label="Weekly Revenue" value={revenue.weekly} target={TARGETS.weekly} period="This week" />
          <MetricCard label="Monthly Revenue" value={revenue.monthly} target={TARGETS.monthly} period="This month" />
          <MetricCard label="Yearly Revenue" value={revenue.yearly} target={TARGETS.yearly} period="This year" />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueSeries} />
          </div>
          <SystemHealth health={health} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AgentGrid agents={agents} />
          </div>
          <AutonomySettings />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AlertsFeed alerts={alerts} />
          <ActivityLog entries={activity} />
        </section>

        <footer className="text-center text-[11px] text-muted-foreground py-4">
          MAMS Dashboard · Auto-refresh every 5s · Mock data simulation
        </footer>
      </main>
    </div>
  );
}
