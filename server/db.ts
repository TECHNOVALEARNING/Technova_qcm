import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, quizSessions, themeProgress, users } from "../drizzle/schema";
import { ENV } from './_core/env';
import type { ThemeScore } from "./quiz-utils";

let _db: ReturnType<typeof drizzle> | null = null;
let _queryClient: ReturnType<typeof postgres> | null = null;

const mockUsers = new Map<string, any>();
const mockSessions = new Map<string, any>();

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _queryClient = postgres(process.env.DATABASE_URL, { prepare: false });
      _db = drizzle(_queryClient);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    const existing = mockUsers.get(user.openId) || { id: mockUsers.size + 1, createdAt: new Date(), xp: 0, level: 1 };
    mockUsers.set(user.openId, { ...existing, ...user, updatedAt: new Date(), lastSignedIn: user.lastSignedIn || new Date(), role: user.role || 'user' });
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "password"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    return mockUsers.get(openId);
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    for (const user of Array.from(mockUsers.values())) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLeaderboardEntries(limit: number) {
  const db = await getDb();
  if (!db) {
    const allUsers = Array.from(mockUsers.values()).filter(u => u.xp > 0);
    allUsers.sort((a, b) => b.xp - a.xp);
    return allUsers.slice(0, limit).map(u => ({
      userId: u.id,
      displayName: u.name || "Joueur",
      xp: u.xp,
      level: u.level,
    }));
  }
  
  const rows = await db
    .select({
      userId: users.id,
      displayName: users.name,
      xp: users.xp,
      level: users.level,
    })
    .from(users)
    .where(sql`${users.xp} > 0`)
    .orderBy(desc(users.xp))
    .limit(limit);

  return rows.map(r => ({
    ...r,
    displayName: r.displayName || "Joueur",
  }));
}

export async function getThemeProgressForUser(userId: number) {
  const db = await getDb();
  if (!db) {
    const sessions = Array.from(mockSessions.values()).filter(s => s.userId === userId);
    const progressMap = new Map<string, any>();
    for (const session of sessions) {
      const existing = progressMap.get(session.theme) || { theme: session.theme, correctAnswers: 0, attemptedQuestions: 0 };
      existing.correctAnswers += session.score;
      existing.attemptedQuestions += session.totalQuestions || 0;
      progressMap.set(session.theme, existing);
    }
    return Array.from(progressMap.values());
  }
  return db.select().from(themeProgress).where(eq(themeProgress.userId, userId)).orderBy(desc(themeProgress.correctAnswers));
}

export async function recordQuizSession(input: {
  clientSessionId: string;
  userId: number;
  displayName: string;
  theme: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  questionIds: string[];
  progressByTheme: Map<string, ThemeScore>;
}) {
  const xpGained = input.score * 50; // 50 XP per correct answer

  const db = await getDb();
  if (!db) {
    if (mockSessions.has(input.clientSessionId)) {
      return { alreadySubmitted: true, progressBefore: [], progressAfter: [], xpGained: 0 };
    }
    mockSessions.set(input.clientSessionId, {
      ...input,
      isCompleted: true,
      completedAt: new Date(),
    });

    // Update mock user XP & Level
    const user = Array.from(mockUsers.values()).find(u => u.id === input.userId);
    if (user) {
      user.xp = (user.xp || 0) + xpGained;
      user.level = Math.floor(user.xp / 1000) + 1;
    }
    return { alreadySubmitted: false, progressBefore: [], progressAfter: [], xpGained };
  }

  return db.transaction(async (tx) => {
    const existing = await tx.select({ id: quizSessions.id }).from(quizSessions).where(eq(quizSessions.clientSessionId, input.clientSessionId)).limit(1);
    if (existing.length > 0) return { alreadySubmitted: true, progressBefore: [], progressAfter: [], xpGained: 0 };

    const progressBefore = await tx.select().from(themeProgress).where(eq(themeProgress.userId, input.userId));
    
    // 1. Record session
    await tx.insert(quizSessions).values({
      clientSessionId: input.clientSessionId,
      userId: input.userId,
      displayName: input.displayName,
      theme: input.theme,
      difficulty: input.difficulty,
      score: input.score,
      totalQuestions: input.totalQuestions,
      percentage: input.percentage,
      questionIds: input.questionIds,
    });

    // 2. Update Theme Progress
    for (const [theme, progress] of Array.from(input.progressByTheme.entries())) {
      await tx.insert(themeProgress).values({
        userId: input.userId,
        theme,
        attemptedQuestions: progress.attempted,
        correctAnswers: progress.correct,
      }).onConflictDoUpdate({
        target: [themeProgress.userId, themeProgress.theme],
        set: {
          attemptedQuestions: sql`${themeProgress.attemptedQuestions} + ${progress.attempted}`,
          correctAnswers: sql`${themeProgress.correctAnswers} + ${progress.correct}`,
          updatedAt: new Date(),
        },
      });
    }

    // 3. Update User XP and Level
    await tx.update(users)
      .set({
        xp: sql`${users.xp} + ${xpGained}`,
        level: sql`FLOOR((${users.xp} + ${xpGained}) / 1000) + 1`,
      })
      .where(eq(users.id, input.userId));

    const progressAfter = await tx.select().from(themeProgress).where(eq(themeProgress.userId, input.userId));
    return { alreadySubmitted: false, progressBefore, progressAfter, xpGained };
  });
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    return Array.from(mockUsers.values());
  }
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserAdmin(userId: number, updates: { role?: "admin" | "user", name?: string }) {
  const db = await getDb();
  if (!db) {
    const user = Array.from(mockUsers.values()).find(u => u.id === userId);
    if (user) {
      if (updates.role) user.role = updates.role;
      if (updates.name) user.name = updates.name;
    }
    return;
  }
  
  const setObj: any = {};
  if (updates.role !== undefined) setObj.role = updates.role;
  if (updates.name !== undefined) setObj.name = updates.name;
  
  if (Object.keys(setObj).length > 0) {
    await db.update(users).set(setObj).where(eq(users.id, userId));
  }
}

export async function deleteUserAndData(userId: number) {
  const db = await getDb();
  if (!db) {
    const user = Array.from(mockUsers.values()).find(u => u.id === userId);
    if (user && user.openId) mockUsers.delete(user.openId);
    return;
  }
  
  return db.transaction(async (tx) => {
    await tx.delete(quizSessions).where(eq(quizSessions.userId, userId));
    await tx.delete(themeProgress).where(eq(themeProgress.userId, userId));
    await tx.delete(users).where(eq(users.id, userId));
  });
}
