import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db.js";

async function main(): Promise<void> {
  await prisma.$connect();
  app.listen(env.port, () => {
    console.log(`API lista en http://localhost:${env.port}`);
  });
}

main().catch(async (err) => {
  console.error("Error al iniciar el servidor:", err);
  await prisma.$disconnect();
  process.exit(1);
});