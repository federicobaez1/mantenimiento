import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "./generated/prisma/client.js";

if (!process.env.DATABASE_URL) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

export const prisma = new PrismaClient({ adapter });