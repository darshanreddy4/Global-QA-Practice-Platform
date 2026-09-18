import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

/** Attaches a stable request id used in logs, error payloads and lab-endpoint responses. */
export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers["x-request-id"] as string) || randomUUID();
  res.locals.requestId = id;
  res.setHeader("X-Request-Id", id);
  next();
}
