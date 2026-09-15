import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/db.js";
import { clearDb, createUser, tokenFor } from "./helpers.js";

async function seedEquipo(token: string): Promise<number> {
  const res = await request(app)
    .post("/api/equipos")
    .set("Authorization", `Bearer ${token}`)
    .send({ nombre: "Motor Principal", codigo: "EQ-333" });
  return res.body.id;
}

beforeEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Ordenes API", () => {
  it("crea una orden asignándola al usuario autenticado", async () => {
    const admin = await createUser("ADMIN");
    const token = tokenFor(admin);
    const equipoId = await seedEquipo(token);

    const res = await request(app)
      .post("/api/ordenes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        tipo: "Preventivo",
        descripcion: "Cambio de aceite",
        fechaProgramada: "2026-10-01T10:00:00.000Z",
        equipoId,
      });

    expect(res.status).toBe(201);
    expect(res.body.usuarioId).toBe(admin.id);
  });

  it("rechaza crear una orden con equipo inexistente", async () => {
    const token = tokenFor(await createUser("ADMIN"));

    const res = await request(app)
      .post("/api/ordenes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        tipo: "Correctivo",
        descripcion: "Fuga",
        fechaProgramada: "2026-10-01T10:00:00.000Z",
        equipoId: 9999,
      });

    expect(res.status).toBe(400);
  });

  it("lista órdenes con equipo y usuario", async () => {
    const admin = await createUser("ADMIN");
    const token = tokenFor(admin);
    const equipoId = await seedEquipo(token);

    await request(app).post("/api/ordenes").set("Authorization", `Bearer ${token}`).send({
      tipo: "Preventivo",
      descripcion: "Revisión",
      fechaProgramada: "2026-10-01T10:00:00.000Z",
      equipoId,
    });

    const res = await request(app).get("/api/ordenes").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].equipo.nombre).toBe("Motor Principal");
    expect(res.body[0].usuario.nombre).toBe(admin.nombre);
  });

  it("permite completar una orden", async () => {
    const admin = await createUser("ADMIN");
    const token = tokenFor(admin);
    const equipoId = await seedEquipo(token);

    const created = await request(app).post("/api/ordenes").set("Authorization", `Bearer ${token}`).send({
      tipo: "Preventivo",
      descripcion: "Revisión",
      fechaProgramada: "2026-10-01T10:00:00.000Z",
      equipoId,
    });

    const res = await request(app)
      .put(`/api/ordenes/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ estado: "COMPLETADA", comentario: "Todo listo" });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("COMPLETADA");
    expect(res.body.comentario).toBe("Todo listo");
  });

  it("valida campos obligatorios al crear una orden", async () => {
    const token = tokenFor(await createUser("ADMIN"));

    const res = await request(app)
      .post("/api/ordenes")
      .set("Authorization", `Bearer ${token}`)
      .send({ descripcion: "Sin tipo y sin fecha" });

    expect(res.status).toBe(400);
  });
});