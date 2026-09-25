import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { NODE_ENV, PORT, WEB_ORIGINS } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestId } from "./middleware/requestId";
import { authRouter } from "./modules/auth/auth.router";
import { challengesRouter } from "./modules/challenges/challenges.router";
import { geoRouter } from "./modules/geo/geo.router";
import { labRouter } from "./modules/lab/lab.router";
import { apiLabRouter } from "./modules/lab/api-lab.router";
import { lmtRouter } from "./modules/lmt/lmt.router";

const app = express();

// Required for correct client IPs / secure-cookie detection behind any reverse
// proxy (Vercel, Render, Railway, etc.) — without this, rate limiting and
// `secure` cookies misbehave in production.
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: WEB_ORIGINS, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestId);

app.get("/api/health", (req, res) => res.json({ data: { status: "ok" } }));

// Public-facing auth endpoints are the only ones directly exposed to
// unauthenticated abuse (credential stuffing / registration spam), so they get
// a stricter, dedicated rate limit on top of anything else.
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authRateLimiter);

app.use("/api/auth", authRouter);
app.use("/api/geo", geoRouter);
app.use("/api/lab", labRouter);
app.use("/api/lab", apiLabRouter);
app.use("/api/lmt", lmtRouter);
app.use("/api", challengesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] Global QA Practice Platform API listening on http://localhost:${PORT} (${NODE_ENV})`);
});
