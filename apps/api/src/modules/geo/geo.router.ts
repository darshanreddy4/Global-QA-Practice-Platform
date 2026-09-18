import { Router } from "express";
import { countries, states, cities } from "@qaplatform/shared";
import { HttpError } from "../../middleware/errorHandler";

export const geoRouter = Router();

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

geoRouter.get("/countries", async (req, res) => {
  const start = Date.now();
  await delay(400);
  res.json({ data: countries, meta: { requestId: res.locals.requestId, durationMs: Date.now() - start } });
});

geoRouter.get("/states", async (req, res, next) => {
  const start = Date.now();
  const countryCode = String(req.query.country ?? "");
  if (!countryCode) return next(new HttpError(400, "Bad Request", "Query param 'country' is required."));
  const known = countries.some((c) => c.code === countryCode);
  if (!known) return next(new HttpError(400, "Bad Request", `Unknown country code '${countryCode}'.`));

  await delay(700);
  const data = states.filter((s) => s.countryCode === countryCode);
  res.json({ data, meta: { requestId: res.locals.requestId, durationMs: Date.now() - start } });
});

geoRouter.get("/cities", async (req, res, next) => {
  const start = Date.now();
  const stateCode = String(req.query.state ?? "");
  if (!stateCode) return next(new HttpError(400, "Bad Request", "Query param 'state' is required."));
  const known = states.some((s) => s.code === stateCode);
  if (!known) return next(new HttpError(400, "Bad Request", `Unknown state code '${stateCode}'.`));

  await delay(700);
  const data = cities.filter((c) => c.stateCode === stateCode);
  res.json({ data, meta: { requestId: res.locals.requestId, durationMs: Date.now() - start } });
});
