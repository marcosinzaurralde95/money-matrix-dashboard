import { describe, it, expect } from "vitest";
import { executeAgentReasoning } from "./ai-agent-engine";
import type { Agent } from "./mams-mock";

describe("AI Agent Engine", () => {
  const mockAgent: Agent = {
    id: "sales",
    name: "Ventas",
    role: "Conversión de Ingresos",
    status: "active",
    lastAction: "",
    lastActionAt: Date.now(),
  };

  it("should generate a valid action result for an agent", async () => {
    const result = await executeAgentReasoning(mockAgent, 100, 1000);
    expect(result.action).toBeTypeOf("string");
    expect(result.action.length).toBeGreaterThan(0);
    expect(["active", "idle", "error"]).toContain(result.status);
  });

  it("should flag human approval if generated amount exceeds limits", async () => {
    let triggeredHumanApproval = false;

    // Run multiple iterations to verify threshold triggers
    for (let i = 0; i < 50; i++) {
      const result = await executeAgentReasoning(mockAgent, 50, 100);
      if (result.requiresHumanApproval) {
        triggeredHumanApproval = true;
        expect(result.approvalAmount).toBeGreaterThan(50);
        break;
      }
    }

    expect(triggeredHumanApproval).toBe(true);
  });
});
