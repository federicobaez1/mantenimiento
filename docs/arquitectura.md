# Arquitectura

Sistema de gestión de mantenimiento: aplicación web de dos capas con API REST.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19 + Vite 8 + TypeScript + Material UI v9 (MUI) |
| Backend | Node.js + Express 5 + TypeScript |
| ORM | Prisma 7 (driver adapter `@prisma/adapter-mariadb`) |
| Base de datos | MariaDB 11.8 (collation `utf8mb4_spanish_ci`) |
| Autenticación | JWT (`bcrypt` para hash de contraseñas) |
| Tests | Jest + ts-jest + Supertest |

## Estructura del monorepo

```
mantenimiento/
├── backend/
│   ├── prisma/            # schema.prisma, migraciones y seed
│   ├── src/               # código fuente (TypeScript)
│   │   ├── config/        # variables de entorno tipadas
│   │   ├── controllers/   # lógica de negocio de cada recurso
│   │   ├── middlewares/   # auth, validación y manejo de errores
│   │   ├── routes/        # definición de endpoints REST
│   │   ├── utils/         # ApiError, asyncHandler
│   │   └── generated/     # cliente Prisma generado (gitignored)
│   └── tests/             # tests de integración (BD mantenimiento_test)
├── frontend/
│   └── src/
│       ├── components/    # Layout (AppBar + Drawer responsive)
│       ├── context/       # autenticación (AuthContext + useAuth)
│       ├── lib/           # instancia de axios con token
│       ├── pages/         # Inicio, Equipos, Órdenes, Usuarios, Login
│       └── types.ts       # tipos compartidos con la API
└── docs/                  # esta documentación
```

## Modelo de datos

- **User**: usuario del sistema con rol `ADMIN` o `TECNICO`.
- **Equipo**: bien a mantener, con código único, ubicación y estado (`OPERATIVO`, `EN_MANTENIMIENTO`, `FUERA_DE_SERVICIO`).
- **Orden**: orden de mantenimiento ligada a un equipo y asignada a un usuario, con tipo (Preventivo/Correctivo), fechas, estado (`PENDIENTE`, `EN_PROGRESO`, `COMPLETADA`, `CANCELADA`) y comentario.

## API REST

Todas las rutas `/api/*` requieren autenticación JWT salvo `POST /api/auth/login`.

| Método | Ruta | Rol | Descripción |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | público | Iniciar sesión |
| POST | `/api/auth/register` | ADMIN | Crear usuario desde el panel |
| GET | `/api/resumen` | autenticado | Estadísticas del panel |
| GET/POST | `/api/equipos` | autenticado | Listar / crear equipos |
| GET/PUT/DELETE | `/api/equipos/:id` | GET autenticado; PUT/DELETE ADMIN | Detalle / actualizar / eliminar |
| GET/POST | `/api/ordenes` | autenticado | Listar / crear órdenes |
| GET/PUT | `/api/ordenes/:id` | autenticado | Detalle / actualizar |
| DELETE | `/api/ordenes/:id` | ADMIN | Eliminar |
| GET/POST | `/api/usuarios` | ADMIN | Listar / crear usuarios |
| PATCH/DELETE | `/api/usuarios/:id` | ADMIN | Actualizar / eliminar |

Convenciones de error: `400` validación, `401` sin/credenciales inválidas/token vencido, `403` sin permisos, `404` recurso inexistente, `409` duplicado o restricción de integridad.

### Detalles de implementación

- `usuarioId` de una orden se autocompleta con el usuario autenticado al crearla.
- No se puede eliminar a sí mismo ni cambiarse el propio rol.
- Recursos referenciados por otros no pueden eliminarse (protegido por FK, responde `409`).

## Base de datos

- El esquema se migra con `npx prisma migrate deploy`.
- Un usuario no puede registrarse solo (el registro es exclusivo de ADMIN); los datos de demostración se cargan con `npx prisma db seed`.
- Se usa una base `mantenimiento_test` separada para los tests de integración.