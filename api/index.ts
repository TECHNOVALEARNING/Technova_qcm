import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../server/_core/oauth";
import { appRouter } from "../server/routers";
import { createContext } from "../server/_core/context";

const app = express();
app.set('trust proxy', 1); // Trust Vercel's proxy for rate limiting

// Body parser
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

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

export default function handler(req: any, res: any) {
  return app(req, res);
}
