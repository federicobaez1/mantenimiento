import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { ApiError } from "../utils/ApiError.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Ya existe un registro con ese valor único" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: "Registro no encontrado" });
      return;
    }
    if (err.code === "P2003") {
      res.status(409).json({ error: "No se puede eliminar: tiene registros relacionados" });
      return;
    }
  }

  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
}