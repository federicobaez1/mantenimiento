import type { Request, Response } from "express";
import type { EstadoOrden } from "../generated/prisma/enums.js";
import { prisma } from "../db.js";
import { ApiError } from "../utils/ApiError.js";

type OrdenBody = {
  tipo?: string;
  descripcion?: string;
  fechaProgramada?: string;
  estado?: EstadoOrden;
  comentario?: string | null;
  fechaRealizada?: string | null;
  usuarioId?: number;
  equipoId?: number;
};

export async function listOrdenes(_req: Request, res: Response): Promise<void> {
  const ordenes = await prisma.orden.findMany({
    orderBy: { fechaProgramada: "asc" },
    include: {
      usuario: { select: { id: true, nombre: true, rol: true } },
      equipo: { select: { id: true, nombre: true, codigo: true } },
    },
  });
  res.json(ordenes);
}

export async function getOrden(req: Request, res: Response): Promise<void> {
  const orden = await prisma.orden.findUnique({
    where: { id: Number(req.params.id) },
    include: { usuario: true, equipo: true },
  });
  if (!orden) {
    throw new ApiError(404, "Orden no encontrada");
  }
  res.json(orden);
}

export async function createOrden(req: Request, res: Response): Promise<void> {
  const body = req.body as Required<
    Pick<OrdenBody, "tipo" | "descripcion" | "fechaProgramada" | "usuarioId" | "equipoId">
  >;

  const equipo = await prisma.equipo.findUnique({
    where: { id: body.equipoId },
  });
  if (!equipo) {
    throw new ApiError(400, "El equipo indicado no existe");
  }

  const usuarioId = body.usuarioId ?? req.user?.id;
  if (!usuarioId) {
    throw new ApiError(400, "No se pudo determinar el usuario asignado");
  }

  const orden = await prisma.orden.create({
    data: {
      tipo: body.tipo,
      descripcion: body.descripcion,
      fechaProgramada: new Date(body.fechaProgramada),
      usuarioId,
      equipoId: body.equipoId,
    },
    include: { usuario: true, equipo: true },
  });
  res.status(201).json(orden);
}

export async function updateOrden(req: Request, res: Response): Promise<void> {
  const { tipo, descripcion, fechaProgramada, estado, comentario, fechaRealizada, usuarioId, equipoId } =
    req.body as OrdenBody;

  const orden = await prisma.orden.update({
    where: { id: Number(req.params.id) },
    data: {
      tipo,
      descripcion,
      fechaProgramada: fechaProgramada ? new Date(fechaProgramada) : undefined,
      estado,
      comentario,
      fechaRealizada: fechaRealizada ? new Date(fechaRealizada) : undefined,
      usuarioId,
      equipoId,
    },
    include: { usuario: true, equipo: true },
  });
  res.json(orden);
}

export async function deleteOrden(req: Request, res: Response): Promise<void> {
  await prisma.orden.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
}