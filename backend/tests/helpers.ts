import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../src/config/env.js";
import { prisma } from "../src/db.js";

export const TEST_PASSWORD = "secreta123";

export interface TestUser {
  id: number;
  nombre: string;
  email: string;
  rol: "ADMIN" | "TECNICO";
}

export async function createUser(
  rol: "ADMIN" | "TECNICO",
  extra?: { email?: string; nombre?: string },
): Promise<TestUser> {
  const email = extra?.email ?? `user-${Date.now()}-${Math.random()}@test.com`;
  return prisma.user.create({
    data: {
      nombre: extra?.nombre ?? "Usuario Test",
      email,
      password: await bcrypt.hash(TEST_PASSWORD, 4),
      rol,
    },
    select: { id: true, nombre: true, email: true, rol: true },
  });
}

export function tokenFor(user: TestUser): string {
  return jwt.sign({ id: user.id, rol: user.rol }, env.jwtSecret, {
    expiresIn: "1h",
  } as jwt.SignOptions);
}

export async function clearDb(): Promise<void> {
  await prisma.orden.deleteMany();
  await prisma.equipo.deleteMany();
  await prisma.user.deleteMany();
}