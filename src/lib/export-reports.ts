import type { Agent, Alert, ActivityEntry } from "@/lib/mams-mock";
import type { RevenueSummary, Settings, PendingApproval } from "@/lib/mams-db";

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportActivityCSV(activities: ActivityEntry[]) {
  const headers = ["ID", "Fecha/Hora", "Agente", "Acción Ejecutada"];
  const rows = activities.map((a) => [
    a.id,
    new Date(a.ts).toISOString(),
    `"${a.agent.replace(/"/g, '""')}"`,
    `"${a.action.replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  downloadBlob(csv, `mams-actividad-${Date.now()}.csv`, "text/csv;charset=utf-8;");
}

export function exportSystemStateJSON(data: {
  agents: Agent[];
  alerts: Alert[];
  activity: ActivityEntry[];
  revenue: RevenueSummary;
  settings: Settings | null;
  pendingApprovals: PendingApproval[];
}) {
  const json = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      system: "MAMS — Sistema Matricial Agéntico de Dinero",
      ...data,
    },
    null,
    2,
  );

  downloadBlob(json, `mams-reporte-completo-${Date.now()}.json`, "application/json");
}
