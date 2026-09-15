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

describe("Equipos API", () => {
  it("rechaza peticiones sin token", async () => {
    const res = await request(app).get("/api/equipos");
    expect(res.status).toBe(401);
  });

  it("un ADMIN puede crear un equipo", async () => {
    const token = tokenFor(await createUser("ADMIN"));

    const res = await request(app)
      .post("/api/equipos")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Motor", codigo: "EQ-100", ubicacion: "Planta 1" });

    expect(res.status).toBe(201);
    expect(res.body.codigo).toBe("EQ-100");
    expect(res.body.estado).toBe("OPERATIVO");
  });

  it("rechaza duplicar el código de un equipo", async () => {
    const admin = await createUser("ADMIN");
    const token = tokenFor(admin);
    const base = { nombre: "Motor", codigo: "EQ-100" };

    await request(app).post("/api/equipos").set("Authorization", `Bearer ${token}`).send(base);
    const res = await request(app).post("/api/equipos").set("Authorization", `Bearer ${token}`).send(base);

    expect(res.status).toBe(409);
  });

  it("lista los equipos", async () => {
    const token = tokenFor(await createUser("ADMIN"));
    await request(app).post("/api/equipos").set("Authorization", `Bearer ${token}`).send({ nombre: "Bomba", codigo: "EQ-200" });

    const res = await request(app).get("/api/equipos").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("un TECNICO no puede eliminar un equipo", async () => {
    const admin = await createUser("ADMIN");
    const adminToken = tokenFor(admin);
    const created = await request(app).post("/api/equipos").set("Authorization", `Bearer ${adminToken}`).send({ nombre: "Motor", codigo: "EQ-100" });

    const tecnicoToken = tokenFor(await createUser("TECNICO"));
    const res = await request(app)
      .delete(`/api/equipos/${created.body.id}`)
      .set("Authorization", `Bearer ${tecnicoToken}`);

    expect(res.status).toBe(403);
  });

  it("un ADMIN puede eliminar un equipo sin órdenes", async () => {
    const admin = await createUser("ADMIN");
    const token = tokenFor(admin);
    const created = await request(app).post("/api/equipos").set("Authorization", `Bearer ${token}`).send({ nombre: "Motor", codigo: "EQ-100" });

    const res = await request(app)
      .delete(`/api/equipos/${created.body.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});