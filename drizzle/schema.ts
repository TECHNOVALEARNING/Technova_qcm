import { index, integer, json, pgEnum, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  /** OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  password: varchar("password", { length: 128 }),
  role: roleEnum("role").default("user").notNull(),
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const quizSessions = pgTable("quiz_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientSessionId: varchar("clientSessionId", { length: 64 }).notNull(),
  userId: integer("userId").notNull().references(() => users.id),
  displayName: varchar("displayName", { length: 64 }).notNull(),
  theme: varchar("theme", { length: 64 }).notNull(),
  difficulty: varchar("difficulty", { length: 16 }).notNull(),
  score: integer("score").notNull(),
  totalQuestions: integer("totalQuestions").notNull(),
  percentage: integer("percentage").notNull(),
  questionIds: json("questionIds").$type<string[]>().notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("quiz_sessions_client_session_unique").on(table.clientSessionId),
  index("quiz_sessions_ranking_index").on(table.percentage, table.score),
  index("quiz_sessions_user_index").on(table.userId),
]);

export const themeProgress = pgTable("theme_progress", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull().references(() => users.id),
  theme: varchar("theme", { length: 64 }).notNull(),
  attemptedQuestions: integer("attemptedQuestions").default(0).notNull(),
  correctAnswers: integer("correctAnswers").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
}, (table) => [
  uniqueIndex("theme_progress_user_theme_unique").on(table.userId, table.theme),
  index("theme_progress_user_index").on(table.userId),
]);

export type QuizSession = typeof quizSessions.$inferSelect;
export type ThemeProgress = typeof themeProgress.$inferSelect;
