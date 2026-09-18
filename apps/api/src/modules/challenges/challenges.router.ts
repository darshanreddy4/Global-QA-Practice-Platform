import { Router } from "express";
import { challengeRegistry, categories, getChallengeById, getChallengesByCategory } from "@qaplatform/shared";
import { HttpError } from "../../middleware/errorHandler";

export const challengesRouter = Router();

challengesRouter.get("/categories", (req, res) => {
  res.json({ data: categories });
});

challengesRouter.get("/challenges", (req, res) => {
  const categoryId = req.query.categoryId as string | undefined;
  const data = categoryId ? getChallengesByCategory(categoryId) : challengeRegistry.filter((c) => c.isActive);
  res.json({ data });
});

challengesRouter.get("/challenges/:id", (req, res, next) => {
  const challenge = getChallengeById(req.params.id);
  if (!challenge) return next(new HttpError(404, "Not Found", `Challenge '${req.params.id}' does not exist.`));
  res.json({ data: challenge });
});
