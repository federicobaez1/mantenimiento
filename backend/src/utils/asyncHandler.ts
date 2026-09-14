import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ApiError } from "./ApiError.js";

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new ApiError(404, `No se encontró la ruta ${req.method} ${req.path}`));
}