import type { NextFunction, Request, Response } from "express";

export class HttpError extends Error {
  status: number;
  type: string;
  constructor(status: number, title: string, detail?: string) {
    super(title);
    this.status = status;
    this.type = `about:blank#${status}`;
    this.detail = detail ?? title;
  }
  detail: string;
}

/** Central error handler — emits RFC7807-style problem JSON (ARCHITECTURE.md §14). */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  const requestId = res.locals.requestId ?? "unknown";
  if (err instanceof HttpError) {
    res.status(err.status).json({
      type: err.type,
      title: err.message,
      status: err.status,
      detail: err.detail,
      requestId,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    type: "about:blank#500",
    title: "Internal Server Error",
    status: 500,
    detail: "An unexpected error occurred.",
    requestId,
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    type: "about:blank#404",
    title: "Not Found",
    status: 404,
    detail: `No route matches ${req.method} ${req.path}`,
    requestId: res.locals.requestId ?? "unknown",
  });
}
