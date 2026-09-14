import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { Role } from "../generated/prisma/enums.js";
import { ApiError } from "../utils/ApiError.js";

interface TokenPayload {
  id: number;
  rol: Role;
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "Token no proporcionado");
  }

  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as TokenPayload;
    req.user = { id: payload.id, rol: payload.rol };
    next();
  } catch {
    throw new ApiError(401, "Token inválido o expirado");
  }
}

export function authorize(...roles: Role[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, "No autenticado");
    }
    if (!roles.includes(req.user.rol)) {
      throw new ApiError(403, "No tiene permisos para esta acción");
    }
    next();
  };
}