import "dotenv/config";
import express from "express";

const app = express();
app.set('trust proxy', 1);

// Body parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// Wrap all imports in try-catch to surface the real error
let initialized = false;
let initError: any = null;

async function initApp() {
  if (initialized) return;
  try {
    const rateLimit = (await import("express-rate-limit")).default;
    const { createExpressMiddleware } = await import("@trpc/server/adapters/express");
    const { registerOAuthRoutes } = await import("../server/_core/oauth");
    const { appRouter } = await import("../server/routers");
    const { createContext } = await import("../server/_core/context");

    // Rate limiter for auth routes
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: "Trop de requêtes. Veuillez réessayer dans quelques minutes." },
    });
    app.use("/api/trpc/auth", apiLimiter);

    // Register OAuth routes (mock login and callback)
    registerOAuthRoutes(app);

    // Register tRPC API
    app.use(
      "/api/trpc",
      createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );

    initialized = true;
  } catch (err: any) {
    initError = err;
    console.error("[API INIT ERROR]", err);
  }
}

export default async function handler(req: any, res: any) {
  await initApp();
  if (initError) {
    return res.status(500).json({
      error: "Server initialization failed",
      message: initError.message,
      stack: initError.stack?.split("\n").slice(0, 5),
    });
  }
  return new Promise((resolve, reject) => {
    res.on("finish", resolve);
    res.on("error", reject);
    app(req, res);
  });
}
