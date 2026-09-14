import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

export function validate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => e.msg);
    throw new ApiError(400, details.join(". "));
  }
  next();
}