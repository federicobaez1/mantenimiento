import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/db.js";
import { clearDb, createUser, tokenFor } from "./helpers.js";

beforeEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/resumen", () => {
  it("rechaza sin token", async () => {
    const res = await request(app).get("/api/resumen");
    expect(res.status).toBe(401);
  });

  it("devuelve estadísticas y órdenes próximas", async () => {
    const admin = await createUser("ADMIN");
    const token = tokenFor(admin);

    const equipo = await prisma.equipo.create({
      data: { nombre: "Motor", codigo: "EQ-R" },
    });
    await prisma.orden.create({
      data: {
        tipo: "Preventivo",
        descripcion: "Próxima revisión",
        estado: "PENDIENTE",
        fechaProgramada: new Date("2026-10-01T10:00:00.000Z"),
        usuarioId: admin.id,
        equipoId: equipo.id,
      },
    });

    const res = await request(app).get("/api/resumen").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalEquipos).toBe(1);
    expect(res.body.totalOrdenes).toBe(1);
    expect(res.body.ordenesPorEstado).toEqual({
      PENDIENTE: 1,
      EN_PROGRESO: 0,
      COMPLETADA: 0,
      CANCELADA: 0,
    });
    expect(res.body.proximas).toHaveLength(1);
    expect(res.body.proximas[0].equipo.nombre).toBe("Motor");
  });
});