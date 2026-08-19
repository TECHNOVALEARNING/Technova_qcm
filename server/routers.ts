import { COOKIE_NAME } from "../shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { deleteUserAndData, getAllUsers, getLeaderboardEntries, getThemeProgressForUser, recordQuizSession, updateUserAdmin } from "./db";
import questionBank from "../client/src/data/questions.json";
import { badgeForProgress, isNewBadge, scoreSubmittedSession } from "./quiz-utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as db from "./db";
import { sdk } from "./_core/sdk";

type BankQuestion = (typeof questionBank.questions)[number];

const questionIndex = new Map<string, BankQuestion>(questionBank.questions.map((question) => [String(question.id), question]));
const sessionInput = z.object({
  clientSessionId: z.string().min(12).max(64),
  displayName: z.string().trim().min(1).max(24),
  theme: z.string().trim().min(1).max(64),
  difficulty: z.enum(["all", "easy", "medium", "hard"]),
  questionIds: z.array(z.string()).min(1).max(100),
  answers: z.array(z.object({ questionId: z.string(), answer: z.string().max(500) })).min(1).max(100),
});

const badgeView = (progress: { theme: string; correctAnswers: number; attemptedQuestions: number }) => {
  const badge = badgeForProgress(progress.correctAnswers);
  return {
    theme: progress.theme,
    correctAnswers: progress.correctAnswers,
    attemptedQuestions: progress.attemptedQuestions,
    badge: badge ? { ...badge } : null,
  };
};

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      (ctx.res as any).clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    localLogin: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"), name: z.string().optional(), isSignUp: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        let user;
        if (input.isSignUp) {
          user = await db.getUserByEmail(input.email);
          if (user) throw new TRPCError({ code: "CONFLICT", message: "Cet email est déjà utilisé" });
          const openId = `local-${crypto.randomUUID()}`;
          const hashedPassword = await bcrypt.hash(input.password, 12);
          await db.upsertUser({
            openId,
            email: input.email,
            password: hashedPassword,
            name: input.name || "Joueur",
            loginMethod: "local",
            lastSignedIn: new Date()
          });
          user = await db.getUserByOpenId(openId);
        } else {
          user = await db.getUserByEmail(input.email);
          if (!user || !user.password) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou mot de passe incorrect" });
          }
          const isValid = await bcrypt.compare(input.password, user.password);
          if (!isValid) {
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou mot de passe incorrect" });
          }
        }
        
        const sessionToken = await sdk.createSessionToken(user!.openId, {
          name: user!.name || "",
          expiresInMs: 31536000000, // 1 year
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        (ctx.res as any).cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 31536000000 });
        
        return { success: true, role: user!.role };
      }),
  }),
  quiz: router({
    leaderboard: publicProcedure.input(z.object({ limit: z.number().int().min(3).max(20).default(8) })).query(async ({ input }) => {
      return getLeaderboardEntries(input.limit);
    }),
    myProgress: protectedProcedure.query(async ({ ctx }) => {
      const progress = await getThemeProgressForUser(ctx.user.id);
      return progress.map(badgeView);
    }),
    submitSession: protectedProcedure.input(sessionInput).mutation(async ({ ctx, input }) => {
      const uniqueQuestionIds = Array.from(new Set(input.questionIds));
      if (uniqueQuestionIds.length !== input.questionIds.length) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Une session ne peut pas contenir deux fois la même question." });
      }
      const questions = uniqueQuestionIds.map((id) => questionIndex.get(id));
      if (questions.some((question) => !question)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "La session comporte une question inconnue." });
      }
      const validQuestions = questions as BankQuestion[];
      const result = scoreSubmittedSession(validQuestions, input.answers);
      const percentage = Math.round((result.score / result.totalQuestions) * 100);
      const recorded = await recordQuizSession({
        clientSessionId: input.clientSessionId,
        userId: ctx.user.id,
        displayName: input.displayName,
        theme: input.theme,
        difficulty: input.difficulty,
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage,
        questionIds: uniqueQuestionIds,
        progressByTheme: result.progressByTheme,
      });

      const progress = recorded.alreadySubmitted ? await getThemeProgressForUser(ctx.user.id) : recorded.progressAfter;
      const previous = new Map((recorded.alreadySubmitted ? [] : recorded.progressBefore).map((item) => [item.theme, item.correctAnswers]));
      const newBadges = recorded.alreadySubmitted ? [] : progress.flatMap((item) => {
        const badge = isNewBadge(previous.get(item.theme) || 0, item.correctAnswers);
        return badge ? [{ theme: item.theme, ...badge }] : [];
      });

      return {
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage,
        alreadySubmitted: recorded.alreadySubmitted,
        newBadges,
        progress: progress.map(badgeView),
      };
    }),
  }),
  admin: router({
    getUsers: adminProcedure.query(async () => {
      const users = await getAllUsers();
      return users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        level: u.level,
        xp: u.xp,
        createdAt: u.createdAt,
      }));
    }),
    updateUser: adminProcedure.input(z.object({ userId: z.number(), role: z.enum(["admin", "user"]).optional(), name: z.string().optional() })).mutation(async ({ input }) => {
      await updateUserAdmin(input.userId, { role: input.role, name: input.name });
      return { success: true };
    }),
    deleteUser: adminProcedure.input(z.object({ userId: z.number() })).mutation(async ({ input, ctx }) => {
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Vous ne pouvez pas supprimer votre propre compte." });
      }
      await deleteUserAndData(input.userId);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
