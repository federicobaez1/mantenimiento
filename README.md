# mantenimiento

Sistema web para la gestión y seguimiento de tareas de mantenimiento.

## Descripción

Aplicación web que permite registrar, consultar y administrar la información relacionada
con los trabajos de mantenimiento: equipos, órdenes de trabajo y usuarios.

## Tecnologías

- Frontend: React + TypeScript + Vite + Material UI
- Backend: Node.js + Express + TypeScript
- Base de datos: MariaDB (MySQL) con Prisma ORM
- API: REST con autenticación JWT y autorización por roles (ADMIN / TECNICO)
- Tests: Jest + Supertest

## Documentación

- [Arquitectura](docs/arquitectura.md)
- [Instalación y puesta en marcha](docs/instalacion.md)
- [Manual de usuario](docs/manual-usuario.md)

## Arranque rápido

```bash
cd backend
npm install
cp .env.example .env          # editar credenciales y JWT_SECRET
npx prisma migrate deploy
npx prisma db seed
npm run dev                   # API en http://localhost:4000
```

```bash
cd frontend
npm install
npm run dev                   # app en http://localhost:5173
```

Acceso de ejemplo: `admin@sistema.com` / `admin123`
(técnicos: `jorge@sistema.com`, `lucia@sistema.com`, `martin@sistema.com` con clave `tecnico123`).

## Autor

Federico Báez — Proyecto académico

## Licencia

Este proyecto se distribuye bajo la licencia GNU General Public License v3.0.