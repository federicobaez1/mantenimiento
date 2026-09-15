import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { ApiError } from "../utils/ApiError.js";

type UsuarioBody = {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: "ADMIN" | "TECNICO";
};

const toDto = (u: {
  id: number;
  nombre: string;
  email: string;
  rol: "ADMIN" | "TECNICO";
  createdAt: Date;
  _count?: { ordenes: number };
}) => ({
  id: u.id,
  nombre: u.nombre,
  email: u.email,
  rol: u.rol,
  createdAt: u.createdAt,
  cantidadOrdenes: u._count?.ordenes ?? 0,
});

export async function listUsuarios(_req: Request, res: Response): Promise<void> {
  const usuarios = await prisma.user.findMany({
    orderBy: { id: "asc" },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      createdAt: true,
      _count: { select: { ordenes: true } },
    },
  });
  res.json(usuarios.map(toDto));
}

export async function createUsuario(req: Request, res: Response): Promise<void> {
  const { nombre, email, password, rol = "TECNICO" } = req.body as Required<UsuarioBody>;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new ApiError(409, "Ya existe un usuario con ese email");
  }

  const user = await prisma.user.create({
    data: { nombre, email, password: await bcrypt.hash(password, 10), rol },
    select: { id: true, nombre: true, email: true, rol: true, createdAt: true },
  });

  res.status(201).json({ ...toDto(user), cantidadOrdenes: 0 });
}

export async function updateUsuario(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const { nombre, email, password, rol } = req.body as UsuarioBody;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    throw new ApiError(404, "Usuario no encontrado");
  }

  if (email && email !== target.email) {
    const conflict = await prisma.user.findUnique({ where: { email } });
    if (conflict) {
      throw new ApiError(409, "Ya existe un usuario con ese email");
    }
  }

  if (rol && id === req.user?.id && rol !== target.rol) {
    throw new ApiError(400, "No puede cambiarse el propio rol");
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      nombre,
      email,
      rol,
      ...(password ? { password: await bcrypt.hash(password, 10) } : {}),
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      createdAt: true,
      _count: { select: { ordenes: true } },
    },
  });

  res.json(toDto(user));
}

export async function deleteUsuario(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (id === req.user?.id) {
    throw new ApiError(400, "No puede eliminarse a sí mismo");
  }

  await prisma.user.delete({ where: { id } });
  res.status(204).send();
}