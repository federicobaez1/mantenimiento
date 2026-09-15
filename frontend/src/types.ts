export type Rol = 'ADMIN' | 'TECNICO'
export type EstadoEquipo = 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO'
export type EstadoOrden = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA'

export interface User {
  id: number
  nombre: string
  email: string
  rol: Rol
}

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: Rol
  createdAt: string
  cantidadOrdenes: number
}

export interface Equipo {
  id: number
  nombre: string
  codigo: string
  ubicacion: string | null
  estado: EstadoEquipo
  createdAt: string
  updatedAt: string
  _count?: { ordenes: number }
}

export interface Orden {
  id: number
  tipo: string
  descripcion: string
  estado: EstadoOrden
  fechaProgramada: string
  fechaRealizada: string | null
  comentario: string | null
  usuarioId: number
  equipoId: number
  usuario: Pick<User, 'id' | 'nombre' | 'rol'>
  equipo: Pick<Equipo, 'id' | 'nombre' | 'codigo'>
}

export interface AuthContextValue {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (nombre: string, email: string, password: string) => Promise<void>
  logout: () => void
}