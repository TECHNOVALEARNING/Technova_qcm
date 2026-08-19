import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  getLeaderboardEntries: vi.fn(),
  getThemeProgressForUser: vi.fn(),
  recordQuizSession: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";
import questionBank from "../client/src/data/questions.json";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 7,
    openId: "quiz-test-user",
    name: "Joueur test",
    email: "test@example.com",
    loginMethod: "local",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("quiz router", () => {
  it("recalcule le score côté serveur et retourne le badge nouvellement déverrouillé", async () => {
    const question = questionBank.questions[0]!;
    const theme = question.themes[0]!;
    dbMocks.recordQuizSession.mockResolvedValue({
      alreadySubmitted: false,
      progressBefore: [],
      progressAfter: [{ theme, correctAnswers: 5, attemptedQuestions: 5 }],
    });

    const caller = appRouter.createCaller(createContext());
    const result = await caller.quiz.submitSession({
      clientSessionId: "session-test-123",
      displayName: "Joueur test",
      theme,
      difficulty: "all",
      questionIds: [String(question.id)],
      answers: [{ questionId: String(question.id), answer: question.answers[question.correctIndex]! }],
    });

    expect(result).toMatchObject({ score: 1, totalQuestions: 1, percentage: 100, alreadySubmitted: false });
    expect(result.newBadges).toEqual([{ theme, tier: "bronze", threshold: 5, label: "Départ" }]);
    expect(dbMocks.recordQuizSession).toHaveBeenCalledWith(expect.objectContaining({
      userId: 7,
      score: 1,
      totalQuestions: 1,
      percentage: 100,
    }));
  });

  it("expose le classement public sans exiger de connexion", async () => {
    dbMocks.getLeaderboardEntries.mockResolvedValue([{ displayName: "Ada", xp: 500, level: 1 }]);
    const result = await appRouter.createCaller({ ...createContext(), user: null }).quiz.leaderboard({ limit: 3 });
    expect(result).toEqual([{ displayName: "Ada", xp: 500, level: 1 }]);
    expect(dbMocks.getLeaderboardEntries).toHaveBeenCalledWith(3);
  });
});
