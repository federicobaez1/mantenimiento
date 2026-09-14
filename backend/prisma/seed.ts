import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db.js";

async function main() {
  const email = "admin@sistema.com";
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    await prisma.user.create({
      data: {
        nombre: "Administrador",
        email,
        password: await bcrypt.hash("admin123", 10),
        rol: "ADMIN",
      },
    });
    console.log("Seeder: usuario admin creado (admin@sistema.com / admin123)");
  } else {
    console.log("Seeder: el admin ya existe, no se hizo nada.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });