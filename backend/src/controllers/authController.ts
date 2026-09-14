import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../db.js";
import { ApiError } from "../utils/ApiError.js";

interface LoginBody {
  email: string;
  password: string;
}

function signToken(id: number, rol: string): string {
  return jwt.sign({ id, rol }, env.jwtSecret, {
    expiresIn: env.jwtExpires,
  } as jwt.SignOptions);
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginBody;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(401, "Credenciales inválidas");
  }

  res.json({
    token: signToken(user.id, user.rol),
    user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
  });
}

interface RegisterBody extends LoginBody {
  nombre: string;
  rol?: "ADMIN" | "TECNICO";
}

export async function register(req: Request, res: Response): Promise<void> {
  const { nombre, email, password, rol = "TECNICO" } = req.body as RegisterBody;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    throw new ApiError(409, "Ya existe un usuario con ese email");
  }

  const user = await prisma.user.create({
    data: {
      nombre,
      email,
      password: await bcrypt.hash(password, 10),
      rol,
    },
    select: { id: true, nombre: true, email: true, rol: true },
  });

  res.status(201).json({
    token: signToken(user.id, user.rol),
    user,
  });
}