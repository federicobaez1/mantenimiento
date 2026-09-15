import request from "supertest";
import { app } from "../src/app.js";
import { prisma } from "../src/db.js";
import { clearDb, createUser, TEST_PASSWORD, tokenFor } from "./helpers.js";

beforeEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/auth/login", () => {
  it("devuelve token y usuario con credenciales válidas", async () => {
    const user = await createUser("ADMIN", { email: "admin@test.com" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.rol).toBe("ADMIN");
  });

  it("responde 401 con credenciales inválidas", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nadie@test.com", password: "incorrecta" });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/register", () => {
  it("crea un usuario técnico por defecto (solo ADMIN)", async () => {
    const adminToken = tokenFor(await createUser("ADMIN"));

    const res = await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nombre: "Nuevo", email: "nuevo@test.com", password: "secret123" });

    expect(res.status).toBe(201);
    expect(res.body.user.rol).toBe("TECNICO");
    expect(res.body.token).toBeDefined();
  });

  it("rechaza registro sin ser ADMIN", async () => {
    const tecnicoToken = tokenFor(await createUser("TECNICO"));

    const res = await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${tecnicoToken}`)
      .send({ nombre: "Nuevo", email: "nuevo@test.com", password: "secret123" });

    expect(res.status).toBe(403);
  });

  it("responde 409 si el email ya existe", async () => {
    await createUser("TECNICO", { email: "repetido@test.com" });
    const adminToken = tokenFor(await createUser("ADMIN"));

    const res = await request(app)
      .post("/api/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ nombre: "Otro", email: "repetido@test.com", password: "secret123" });

    expect(res.status).toBe(409);
  });
});