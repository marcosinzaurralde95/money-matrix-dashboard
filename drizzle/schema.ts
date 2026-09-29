import { pgTable, text, boolean, integer, numeric, timestamp, uuid } from "drizzle-orm/pg-core";

export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  status: text("status").notNull().default("active"),
  paused: boolean("paused").notNull().default(false),
  lastAction: text("last_action").notNull().default(""),
  lastActionAt: timestamp("last_action_at", { withTimezone: true }).notNull().defaultNow(),
  forcedAt: timestamp("forced_at", { withTimezone: true }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const agentTasks = pgTable("agent_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: text("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: text("status").notNull().default("completada"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: text("agent_id").references(() => agents.id, { onDelete: "set null" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  severity: text("severity").notNull().default("info"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: text("agent_id").references(() => agents.id, { onDelete: "set null" }),
  agentName: text("agent_name").notNull(),
  action: text("action").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: integer("id").primaryKey().default(1),
  autoApprovalLimit: numeric("auto_approval_limit").notNull().default("100"),
  humanApprovalAbove: numeric("human_approval_above").notNull().default("1000"),
  maxDailyBudget: numeric("max_daily_budget").notNull().default("500"),
  maxConcurrentAgents: integer("max_concurrent_agents").notNull().default(10),
  mode: text("mode").notNull().default("Autónomo"),
  killSwitch: boolean("kill_switch").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pendingApprovals = pgTable("pending_approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: text("agent_id").references(() => agents.id, { onDelete: "set null" }),
  agentName: text("agent_name").notNull(),
  action: text("action").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: text("reviewed_by"),
});
