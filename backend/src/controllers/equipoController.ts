import type { Request, Response } from "express";
import type { EstadoEquipo } from "../generated/prisma/enums.js";
import { prisma } from "../db.js";
import { ApiError } from "../utils/ApiError.js";

type EquipoBody = {
  nombre?: string;
  codigo?: string;
  ubicacion?: string | null;
  estado?: EstadoEquipo;
};

export async function listEquipos(_req: Request, res: Response): Promise<void> {
  const equipos = await prisma.equipo.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { ordenes: true } } },
  });
  res.json(equipos);
}

export async function getEquipo(req: Request, res: Response): Promise<void> {
  const equipo = await prisma.equipo.findUnique({
    where: { id: Number(req.params.id) },
    include: { ordenes: true },
  });
  if (!equipo) {
    throw new ApiError(404, "Equipo no encontrado");
  }
  res.json(equipo);
}

export async function createEquipo(req: Request, res: Response): Promise<void> {
  const body = req.body as Required<Pick<EquipoBody, "nombre" | "codigo">>;
  const equipo = await prisma.equipo.create({
    data: {
      nombre: body.nombre,
      codigo: body.codigo,
      ubicacion: req.body.ubicacion ?? null,
    },
  });
  res.status(201).json(equipo);
}

export async function updateEquipo(req: Request, res: Response): Promise<void> {
  const { nombre, codigo, ubicacion, estado } = req.body as EquipoBody;
  const equipo = await prisma.equipo.update({
    where: { id: Number(req.params.id) },
    data: { nombre, codigo, ubicacion, estado },
  });
  res.json(equipo);
}

export async function deleteEquipo(req: Request, res: Response): Promise<void> {
  await prisma.equipo.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
}