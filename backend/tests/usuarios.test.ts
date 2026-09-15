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

describe("Usuarios API", () => {
  it("rechaza el listado a un TECNICO", async () => {
    const token = tokenFor(await createUser("TECNICO"));

    const res = await request(app).get("/api/usuarios").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("un ADMIN puede listar los usuarios", async () => {
    const admin = await createUser("ADMIN", { email: "admin@test.com" });
    await createUser("TECNICO", { email: "tec@test.com" });
    const token = tokenFor(admin);

    const res = await request(app).get("/api/usuarios").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].cantidadOrdenes).toBe(0);
  });

  it("un ADMIN puede crear un usuario", async () => {
    const token = tokenFor(await createUser("ADMIN"));

    const res = await request(app)
      .post("/api/usuarios")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Carlos", email: "carlos@test.com", password: "clave123", rol: "TECNICO" });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe("carlos@test.com");
  });

  it("rechaza crear un usuario con email duplicado", async () => {
    const admin = await createUser("ADMIN");
    await createUser("TECNICO", { email: "dup@test.com" });
    const token = tokenFor(admin);

    const res = await request(app)
      .post("/api/usuarios")
      .set("Authorization", `Bearer ${token}`)
      .send({ nombre: "Dup", email: "dup@test.com", password: "clave123" });

    expect(res.status).toBe(409);
  });

  it("un ADMIN puede actualizar rol y contraseña de otro usuario", async () => {
    const admin = await createUser("ADMIN");
    const target = await createUser("TECNICO", { email: "tec@test.com" });
    const token = tokenFor(admin);

    const res = await request(app)
      .patch(`/api/usuarios/${target.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rol: "ADMIN", password: "nuevaclave123" });

    expect(res.status).toBe(200);
    expect(res.body.rol).toBe("ADMIN");
  });

  it("no permite cambiarse el propio rol", async () => {
    const admin = await createUser("ADMIN");
    const token = tokenFor(admin);

    const res = await request(app)
      .patch(`/api/usuarios/${admin.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rol: "TECNICO" });

    expect(res.status).toBe(400);
  });

  it("un ADMIN no puede eliminarse a sí mismo", async () => {
    const admin = await createUser("ADMIN");
    const token = tokenFor(admin);

    const res = await request(app)
      .delete(`/api/usuarios/${admin.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it("un ADMIN puede eliminar a otro usuario sin órdenes", async () => {
    const admin = await createUser("ADMIN");
    const target = await createUser("TECNICO");
    const token = tokenFor(admin);

    const res = await request(app)
      .delete(`/api/usuarios/${target.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});