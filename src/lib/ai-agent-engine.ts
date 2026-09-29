import type { Agent, AgentStatus, Severity } from "./mams-mock";

export interface AgentActionResult {
  action: string;
  amount?: number;
  status: AgentStatus;
  alert?: { severity: Severity; message: string };
  requiresHumanApproval?: boolean;
  approvalAmount?: number;
}

const DOMAIN_ACTIONS: Record<
  string,
  {
    actions: string[];
    monetaryGenerator?: () => number;
    errorRate?: number;
  }
> = {
  director: {
    actions: [
      "Rebalanceó la carga de trabajo entre 4 agentes",
      "Revisó y ajustó OKRs del trimestre actual",
      "Aprobó presupuesto publicitario de $250 para Marketing",
      "Asignó prioridad de ejecución al Agente de Ventas",
    ],
  },
  researcher: {
    actions: [
      "Escaneó 140 páginas de competidores clave",
      "Identificó 3 tendencias emergentes en el sector Fintech",
      "Actualizó el índice semántico de palabras clave SEO",
      "Sintetizó informe de mercado para el Agente Creador",
    ],
  },
  creator: {
    actions: [
      "Generó 5 artículos técnicos de formato largo",
      "Produjo 12 piezas de contenido para redes sociales",
      "Redactó secuencia de e-mails de nutrición para clientes",
      "Optimizó copies publicitarios para campañas activas",
    ],
  },
  marketer: {
    actions: [
      "Lanzó campaña de retargeting en LinkedIn Ads",
      "Inició prueba A/B en página de captura principal",
      "Programó 10 publicaciones multicanal",
      "Optimizó el costo por adquisición (CPA) a $14.20",
    ],
    monetaryGenerator: () => Math.round(150 + Math.random() * 450),
  },
  sales: {
    actions: [
      "Cerró acuerdo comercial con cliente enterprise",
      "Envió 35 correos de prospección cualificados",
      "Agendó 4 demostraciones de producto",
      "Convertió un lead calificado en contrato activo",
    ],
    monetaryGenerator: () => Math.round(200 + Math.random() * 1200),
  },
  analyst: {
    actions: [
      "Calculó deltas de conversión del embudo de ventas",
      "Generó informe semanal de métricas y Cohorts",
      "Detectó anomalía positiva en la tasa de clics (CTR)",
      "Actualizó tablero de atribución multicanal",
    ],
  },
  quality: {
    actions: [
      "Auditó 24 artefactos de contenido producidos",
      "Marcó y corrigió 1 imprecisión de datos",
      "Aprobó lote de publicaciones para distribución",
      "Validó estándares de tono y estilo de marca",
    ],
  },
  compliance: {
    actions: [
      "Escaneó 50 documentos en busca de datos PII sensibles",
      "Revisó cumplimiento de Términos y Condiciones (TOS)",
      "Validó 3 divulgaciones legales en material saliente",
      "Verificó políticas de privacidad y protección de datos",
    ],
  },
  finance: {
    actions: [
      "Reconcilió cobros y suscripciones de Stripe",
      "Actualizó modelo predictivo de flujo de caja",
      "Registró ingresos por renovaciones automáticas",
      "Auditó comisión por transacciones y tarifas bancarias",
    ],
    monetaryGenerator: () => Math.round(100 + Math.random() * 800),
  },
};

const RANDOM_ALERTS: { severity: Severity; message: string }[] = [
  { severity: "info", message: "Director rebalanceó recursos ante aumento de tráfico" },
  { severity: "warning", message: "Tasa de uso de API consumió el 85% de la cuota" },
  { severity: "warning", message: "Conversión de Ventas bajo la media semanal en un 4%" },
  { severity: "critical", message: "Cumplimiento retuvo publicación por revisión legal" },
  { severity: "info", message: "Calidad aprobó sin observaciones el último lote de tareas" },
];

function pick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export async function executeAgentReasoning(
  agent: Agent,
  autoApprovalLimit: number,
  humanApprovalAbove: number,
): Promise<AgentActionResult> {
  const domain = DOMAIN_ACTIONS[agent.id] || { actions: ["Ejecutó tarea del sistema"] };
  const actionText = pick(domain.actions);
  const rand = Math.random();

  const status: AgentStatus = rand < 0.82 ? "active" : rand < 0.95 ? "idle" : "error";

  let amount: number | undefined;
  let requiresHumanApproval = false;
  let approvalAmount: number | undefined;

  if (domain.monetaryGenerator && Math.random() < 0.65) {
    const calculatedAmount = domain.monetaryGenerator();
    if (calculatedAmount > autoApprovalLimit || calculatedAmount >= humanApprovalAbove) {
      requiresHumanApproval = true;
      approvalAmount = calculatedAmount;
    } else {
      amount = calculatedAmount;
    }
  }

  let alert: { severity: Severity; message: string } | undefined;
  if (status === "error") {
    alert = {
      severity: "critical",
      message: `${agent.name} reportó un error en: "${actionText}"`,
    };
  } else if (requiresHumanApproval) {
    alert = {
      severity: "warning",
      message: `Acción de ${agent.name} de $${approvalAmount} requiere aprobación humana`,
    };
  } else if (Math.random() < 0.25) {
    alert = pick(RANDOM_ALERTS);
  }

  return {
    action: actionText,
    amount,
    status,
    alert,
    requiresHumanApproval,
    approvalAmount,
  };
}
