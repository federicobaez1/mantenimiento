import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { api, getApiError } from '../lib/api'
import { useAuth } from '../context/useAuth'
import type { Equipo, EstadoOrden, Orden } from '../types'

interface OrdenForm {
  tipo: string
  descripcion: string
  fechaProgramada: string
  estado: EstadoOrden
  comentario: string
  equipoId: string
}

const estadoColor: Record<EstadoOrden, 'default' | 'info' | 'success' | 'error'> = {
  PENDIENTE: 'default',
  EN_PROGRESO: 'info',
  COMPLETADA: 'success',
  CANCELADA: 'error',
}

const emptyForm: OrdenForm = {
  tipo: '',
  descripcion: '',
  fechaProgramada: '',
  estado: 'PENDIENTE',
  comentario: '',
  equipoId: '',
}

function formatDate(value: string): string {
  return new Date(value).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toDateTimeLocal(value: string): string {
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function Ordenes() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'ADMIN'

  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Orden | null>(null)
  const [form, setForm] = useState<OrdenForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<Orden | null>(null)

  const loadOrdenes = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Orden[]>('/ordenes')
      setOrdenes(data)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const loadEquipos = useCallback(async () => {
    try {
      const { data } = await api.get<Equipo[]>('/equipos')
      setEquipos(data)
    } catch {
      /* el error principal se muestra en loadOrdenes */
    }
  }, [])

  useEffect(() => {
    void Promise.all([loadOrdenes(), loadEquipos()])
  }, [loadOrdenes, loadEquipos])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (orden: Orden) => {
    setEditing(orden)
    setForm({
      tipo: orden.tipo,
      descripcion: orden.descripcion,
      fechaProgramada: toDateTimeLocal(orden.fechaProgramada),
      estado: orden.estado,
      comentario: orden.comentario ?? '',
      equipoId: String(orden.equipoId),
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        equipoId: Number(form.equipoId),
        comentario: form.comentario || null,
      }
      if (editing) {
        await api.put(`/ordenes/${editing.id}`, payload)
      } else {
        await api.post('/ordenes', payload)
      }
      setDialogOpen(false)
      await loadOrdenes()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setSaving(true)
    setError('')
    try {
      await api.delete(`/ordenes/${deleting.id}`)
      setDeleting(null)
      await loadOrdenes()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Órdenes de mantenimiento</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nueva orden
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Equipo</TableCell>
              <TableCell>Asignado a</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Programada</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Cargando…</TableCell>
              </TableRow>
            ) : ordenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">No hay órdenes registradas.</TableCell>
              </TableRow>
            ) : (
              ordenes.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell>{o.tipo}</TableCell>
                  <TableCell>{o.descripcion}</TableCell>
                  <TableCell>
                    {o.equipo.nombre} <Typography variant="caption">({o.equipo.codigo})</Typography>
                  </TableCell>
                  <TableCell>{o.usuario.nombre}</TableCell>
                  <TableCell>
                    <Chip label={o.estado} size="small" color={estadoColor[o.estado]} />
                  </TableCell>
                  <TableCell>{formatDate(o.fechaProgramada)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(o)}>
                        Editar
                      </Button>
                      {isAdmin && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDeleting(o)}
                        >
                          Borrar
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar orden' : 'Nueva orden'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tipo"
              fullWidth
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={2}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
            <TextField
              select
              label="Equipo"
              fullWidth
              value={form.equipoId}
              onChange={(e) => setForm({ ...form, equipoId: e.target.value })}
            >
              {equipos.map((eq) => (
                <MenuItem key={eq.id} value={String(eq.id)}>
                  {eq.nombre} ({eq.codigo})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Fecha programada"
              type="datetime-local"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.fechaProgramada}
              onChange={(e) => setForm({ ...form, fechaProgramada: e.target.value })}
            />
            <TextField
              select
              label="Estado"
              fullWidth
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoOrden })}
            >
              {Object.keys(estadoColor).map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Comentario"
              fullWidth
              multiline
              rows={2}
              value={form.comentario}
              onChange={(e) => setForm({ ...form, comentario: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleting !== null} onClose={() => setDeleting(null)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Estás seguro de eliminar la orden «{deleting?.tipo}»?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={saving}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}