import type { Request, Response } from "express";
import type { EstadoOrden } from "../generated/prisma/enums.js";
import { prisma } from "../db.js";

const ESTADOS: EstadoOrden[] = ["PENDIENTE", "EN_PROGRESO", "COMPLETADA", "CANCELADA"];

export async function resumen(_req: Request, res: Response): Promise<void> {
  const [totalEquipos, totalOrdenes, porEstado, totalEnMantenimiento, proximas] =
    await Promise.all([
      prisma.equipo.count(),
      prisma.orden.count(),
      prisma.orden.groupBy({ by: ["estado"], _count: { _all: true } }),
      prisma.equipo.count({
        where: { estado: { in: ["EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"] } },
      }),
      prisma.orden.findMany({
        where: { estado: { in: ["PENDIENTE", "EN_PROGRESO"] } },
        orderBy: { fechaProgramada: "asc" },
        take: 5,
        include: {
          equipo: { select: { id: true, nombre: true, codigo: true } },
          usuario: { select: { id: true, nombre: true } },
        },
      }),
    ]);

  const ordenesPorEstado = Object.fromEntries(
    ESTADOS.map((e) => [
      e,
      porEstado.find((g) => g.estado === e)?._count._all ?? 0,
    ]),
  ) as Record<EstadoOrden, number>;

  res.json({
    totalEquipos,
    totalEnMantenimiento,
    totalOrdenes,
    ordenesPorEstado,
    proximas,
  });
}