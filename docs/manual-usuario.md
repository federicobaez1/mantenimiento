# Manual de usuario

## Acceso

1. Abrir el frontend (por defecto http://localhost:5173).
2. Iniciar sesión con las credenciales de ejemplo (`admin@sistema.com / admin123` o un técnico).
3. El panel muestra estadísticas: total de equipos, equipos en mantenimiento, órdenes totales y completadas, estado de las órdenes y las 5 próximas pendientes.

## Roles

- **ADMIN**: acceso completo (equipos, órdenes y gestión de usuarios).
- **TECNICO**: puede ver y crear órdenes y equipos; no puede borrar ni administrar usuarios.

> El alta de usuarios solo la realiza un ADMIN desde *Usuarios*. No hay registro público.

## Equipos

- **Nuevo equipo**: botón *Nuevo equipo* → completar nombre, código único, ubicación y estado.
- **Buscar**: el campo de texto filtra por código o nombre al instante.
- **Editar / Borrar**: acciones por fila (Borrar solo ADMIN; un equipo con órdenes asociadas no puede eliminarse).

## Órdenes de mantenimiento

- **Nueva orden**: *Nueva orden* → tipo, descripción, equipo, fecha programada, estado y comentario. La orden queda asignada al usuario que la crea.
- **Filtros**: filtrar la tabla por *Estado* y por *Equipo*.
- **Editar**: actualizar datos y cambiar el estado (por ejemplo a `COMPLETADA` con su comentario).
- **Borrar**: solo ADMIN.

## Usuarios (solo ADMIN)

- **Nuevo usuario**: nombre, email, contraseña (mínimo 6 caracteres) y rol.
- **Editar**: cambiar nombre, email, rol o contraseña (dejando la contraseña vacía no se modifica). El propio rol no puede cambiarse.
- **Borrar**: no se puede eliminar a sí mismo; un usuario con órdenes asignadas no puede eliminarse.

## Cierre de sesión

Usar el botón *Salir* en la barra superior. La sesión se guarda en el navegador hasta cerrar sesión o vencer el token (2 h por defecto, configurable con `JWT_EXPIRES`).