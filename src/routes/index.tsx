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
      { title: "MAMS — Sistema Matricial Agéntico de Dinero" },
      { name: "description", content: "Panel en tiempo real para un sistema autónomo multi-agente de dinero." },
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
          <MetricCard label="Ingresos Diarios" value={revenue.daily} target={TARGETS.daily} period="Hoy" />
          <MetricCard label="Ingresos Semanales" value={revenue.weekly} target={TARGETS.weekly} period="Esta semana" />
          <MetricCard label="Ingresos Mensuales" value={revenue.monthly} target={TARGETS.monthly} period="Este mes" />
          <MetricCard label="Ingresos Anuales" value={revenue.yearly} target={TARGETS.yearly} period="Este año" />
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
          Panel MAMS · Actualización automática cada 5s · Simulación con datos de prueba
        </footer>
      </main>
    </div>
  );
}
