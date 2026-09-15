# Instalación y puesta en marcha

## Requisitos

- Node.js ≥ 20
- MariaDB ≥ 11 (o MySQL 8) corriendo localmente
- npm

## 1. Configurar la base de datos

Crear las bases de datos de desarrollo y de tests (collation en español):

```sql
CREATE DATABASE IF NOT EXISTS mantenimiento CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
CREATE DATABASE IF NOT EXISTS mantenimiento_test CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci;
```

> Ajustar usuario/contraseña a los del entorno local si no es `root`/sin clave.

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# editar .env: DATABASE_URL, JWT_SECRET, etc.

npx prisma migrate deploy   # aplica la estructura de tablas
npx prisma db seed          # carga usuarios, equipos y órdenes de ejemplo
npm run dev                 # servidor en http://localhost:4000
```

Credenciales de la carga de ejemplo:

| Usuario | Clave |
| --- | --- |
| admin@sistema.com | admin123 |
| jorge@sistema.com | tecnico123 |
| lucia@sistema.com | tecnico123 |
| martin@sistema.com | tecnico123 |

## 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxy /api → :4000)
```

## 4. Tests

Los tests de integración corren contra `mantenimiento_test` (se migra automáticamente al iniciar jest).

```bash
cd backend
npm test
```

## Scripts útiles

| Carpeta | Script | Descripción |
| --- | --- | --- |
| backend | `npm run dev` | servidor con recarga en caliente (tsx watch) |
| backend | `npm run build` `npm start` | compilar y ejecutar en producción |
| backend | `npm run typecheck` | verificación de tipos |
| backend | `npm test` | tests de integración |
| frontend | `npm run dev` | Vite dev server |
| frontend | `npm run build` | build de producción |
| frontend | `npx oxlint` | linter |

## Problemas frecuentes

- **`prisma migrate deploy` no crea la base**: la base debe existir antes (ver paso 1); `migrate deploy` solo aplica migraciones.
- **`JWT_SECRET` vacío**: el backend no arranca sin él; generá uno con `openssl rand -hex 32`.
- **Puerto ocupado**: cambiar `PORT` en `backend/.env` y, en ese caso, el target del proxy en `frontend/vite.config.ts`.