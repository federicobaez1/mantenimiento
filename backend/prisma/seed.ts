import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/db.js";

type Role = "ADMIN" | "TECNICO";
type EstadoOrden = "PENDIENTE" | "EN_PROGRESO" | "COMPLETADA" | "CANCELADA";
type EstadoEquipo = "OPERATIVO" | "EN_MANTENIMIENTO" | "FUERA_DE_SERVICIO";

const usuarios: Array<{ nombre: string; email: string; password: string; rol: Role }> = [
  { nombre: "Administrador", email: "admin@sistema.com", password: "admin123", rol: "ADMIN" },
  { nombre: "Jorge Ramírez", email: "jorge@sistema.com", password: "tecnico123", rol: "TECNICO" },
  { nombre: "Lucía Fernández", email: "lucia@sistema.com", password: "tecnico123", rol: "TECNICO" },
  { nombre: "Martín Sosa", email: "martin@sistema.com", password: "tecnico123", rol: "TECNICO" },
];

const equipos: Array<{
  nombre: string;
  codigo: string;
  ubicacion: string;
  estado: EstadoEquipo;
}> = [
  { nombre: "Motor Principal", codigo: "EQ-001", ubicacion: "Planta 1 - Sala de máquinas", estado: "OPERATIVO" },
  { nombre: "Bomba de agua", codigo: "EQ-002", ubicacion: "Planta 1 - Tanque", estado: "OPERATIVO" },
  { nombre: "Compresor de aire", codigo: "EQ-003", ubicacion: "Planta 2 - Taller", estado: "EN_MANTENIMIENTO" },
  { nombre: "Transformador 100kVA", codigo: "EQ-004", ubicacion: "Subestación", estado: "OPERATIVO" },
  { nombre: "Generador Diesel", codigo: "EQ-005", ubicacion: "Planta 2 - Anexo", estado: "FUERA_DE_SERVICIO" },
  { nombre: "Cinta transportadora", codigo: "EQ-006", ubicacion: "Planta 1 - Línea 3", estado: "OPERATIVO" },
];

type OrdenSeed = {
  tipo: string;
  descripcion: string;
  estado: EstadoOrden;
  fechaProgramada: string;
  fechaRealizada?: string;
  comentario: string;
  usuario: string;
  equipo: string;
};

const ordenes: OrdenSeed[] = [
  {
    tipo: "Preventivo",
    descripcion: "Cambio de aceite del reductor",
    estado: "COMPLETADA",
    fechaProgramada: "2026-08-05T09:00:00.000Z",
    fechaRealizada: "2026-08-05T10:30:00.000Z",
    comentario: "Aceite 220 reemplazado, sin novedades.",
    usuario: "Jorge Ramírez",
    equipo: "EQ-001",
  },
  {
    tipo: "Correctivo",
    descripcion: "Lubricación perdida, revisar sello del eje",
    estado: "EN_PROGRESO",
    fechaProgramada: "2026-09-12T08:00:00.000Z",
    comentario: "Fuga detectada en el sello mecánico.",
    usuario: "Lucía Fernández",
    equipo: "EQ-002",
  },
  {
    tipo: "Preventivo",
    descripcion: "Reemplazo de filtros de aire",
    estado: "COMPLETADA",
    fechaProgramada: "2026-09-10T14:00:00.000Z",
    fechaRealizada: "2026-09-10T15:00:00.000Z",
    comentario: "Filtros y elemento separador reemplazados.",
    usuario: "Martín Sosa",
    equipo: "EQ-003",
  },
  {
    tipo: "Preventivo",
    descripcion: "Termografía y limpieza de aletas",
    estado: "PENDIENTE",
    fechaProgramada: "2026-10-02T10:00:00.000Z",
    comentario: "Programar parada de línea durante la inspección.",
    usuario: "Jorge Ramírez",
    equipo: "EQ-004",
  },
  {
    tipo: "Correctivo",
    descripcion: "No arranca, revisar baterías y alternador",
    estado: "PENDIENTE",
    fechaProgramada: "2026-09-20T08:00:00.000Z",
    comentario: "Se solicitaron repuestos al proveedor.",
    usuario: "Martín Sosa",
    equipo: "EQ-005",
  },
  {
    tipo: "Preventivo",
    descripcion: "Tensado y alineación de rodillos",
    estado: "COMPLETADA",
    fechaProgramada: "2026-09-08T07:30:00.000Z",
    fechaRealizada: "2026-09-08T09:00:00.000Z",
    comentario: "Alineación corregida en rodillo 12.",
    usuario: "Lucía Fernández",
    equipo: "EQ-006",
  },
  {
    tipo: "Correctivo",
    descripcion: "Vibraciones anormales en el motor principal",
    estado: "CANCELADA",
    fechaProgramada: "2026-08-20T09:00:00.000Z",
    comentario: "Se reprograma, requiere análisis espectral.",
    usuario: "Jorge Ramírez",
    equipo: "EQ-001",
  },
  {
    tipo: "Preventivo",
    descripcion: "Inspección visual y apriete de conexiones",
    estado: "COMPLETADA",
    fechaProgramada: "2026-08-25T11:00:00.000Z",
    fechaRealizada: "2026-08-25T11:45:00.000Z",
    comentario: "Sin observaciones.",
    usuario: "Martín Sosa",
    equipo: "EQ-004",
  },
  {
    tipo: "Correctivo",
    descripcion: "Reemplazo del sello mecánico de la bomba",
    estado: "PENDIENTE",
    fechaProgramada: "2026-09-25T09:00:00.000Z",
    comentario: "Repuesto en stock, ordenar parada de bomba.",
    usuario: "Lucía Fernández",
    equipo: "EQ-002",
  },
  {
    tipo: "Preventivo",
    descripcion: "Servicio de 1000 horas al generador",
    estado: "EN_PROGRESO",
    fechaProgramada: "2026-09-15T13:00:00.000Z",
    comentario: "Diagnóstico: baterías bajas, se cargan en paralelo.",
    usuario: "Jorge Ramírez",
    equipo: "EQ-005",
  },
  {
    tipo: "Correctivo",
    descripcion: "Rodamiento del tambor motriz con ruido",
    estado: "COMPLETADA",
    fechaProgramada: "2026-08-28T08:00:00.000Z",
    fechaRealizada: "2026-08-28T12:00:00.000Z",
    comentario: "Rodamiento reemplazado, prueba en vacío OK.",
    usuario: "Martín Sosa",
    equipo: "EQ-006",
  },
  {
    tipo: "Preventivo",
    descripcion: "Mantenimiento general del compresor",
    estado: "PENDIENTE",
    fechaProgramada: "2026-10-10T09:00:00.000Z",
    comentario: "Incluir limpieza de válvulas.",
    usuario: "Lucía Fernández",
    equipo: "EQ-003",
  },
];

type UsuarioSeed = { id: number; nombre: string; email: string };

const cmpNombre = (a: { nombre: string }, b: string) => a.nombre === b;

async function main() {
  const createdUsers: Array<{ id: number; nombre: string; email: string }> = [];
  for (const u of usuarios) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        nombre: u.nombre,
        email: u.email,
        password: await bcrypt.hash(u.password, 10),
        rol: u.rol,
      },
      select: { id: true, nombre: true, email: true },
    });
    createdUsers.push(user);
    console.log(`Seeder: usuario ${user.email}`);
  }

  const createdEquipos: Array<{ id: number; codigo: string; nombre: string }> = [];
  for (const e of equipos) {
    const equipo = await prisma.equipo.upsert({
      where: { codigo: e.codigo },
      update: {},
      create: {
        nombre: e.nombre,
        codigo: e.codigo,
        ubicacion: e.ubicacion,
        estado: e.estado,
      },
      select: { id: true, codigo: true, nombre: true },
    });
    createdEquipos.push(equipo);
    console.log(`Seeder: equipo ${equipo.codigo} - ${equipo.nombre}`);
  }

  const total = await prisma.orden.count();
  if (total > 0) {
    console.log(`Seeder: ya existen ${total} órdenes, no se crean más.`);
  } else {
    for (const o of ordenes) {
      const usuario = createdUsers.find((u) => cmpNombre(u, o.usuario));
      const equipo = createdEquipos.find((e) => e.codigo === o.equipo);
      if (!usuario || !equipo) throw new Error(`Seed inconsistente para orden "${o.descripcion}"`);
      await prisma.orden.create({
        data: {
          tipo: o.tipo,
          descripcion: o.descripcion,
          estado: o.estado,
          fechaProgramada: new Date(o.fechaProgramada),
          fechaRealizada: o.fechaRealizada ? new Date(o.fechaRealizada) : undefined,
          comentario: o.comentario,
          usuarioId: usuario.id,
          equipoId: equipo.id,
        },
      });
    }
    console.log(`Seeder: ${ordenes.length} órdenes creadas.`);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });