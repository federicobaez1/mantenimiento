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
import type { Equipo, EstadoEquipo } from '../types'

interface EquipoForm {
  nombre: string
  codigo: string
  ubicacion: string
  estado: EstadoEquipo
}

const estadoColor: Record<EstadoEquipo, 'success' | 'warning' | 'error'> = {
  OPERATIVO: 'success',
  EN_MANTENIMIENTO: 'warning',
  FUERA_DE_SERVICIO: 'error',
}

const emptyForm: EquipoForm = { nombre: '', codigo: '', ubicacion: '', estado: 'OPERATIVO' }

export default function Equipos() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'ADMIN'

  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Equipo | null>(null)
  const [form, setForm] = useState<EquipoForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  const [deleting, setDeleting] = useState<Equipo | null>(null)

  const loadEquipos = useCallback(async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.get<Equipo[]>('/equipos')
      setEquipos(data)
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEquipos()
  }, [loadEquipos])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (equipo: Equipo) => {
    setEditing(equipo)
    setForm({
      nombre: equipo.nombre,
      codigo: equipo.codigo,
      ubicacion: equipo.ubicacion ?? '',
      estado: equipo.estado,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, ubicacion: form.ubicacion || null }
      if (editing) {
        await api.put(`/equipos/${editing.id}`, payload)
      } else {
        await api.post('/equipos', payload)
      }
      setDialogOpen(false)
      await loadEquipos()
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
      await api.delete(`/equipos/${deleting.id}`)
      setDeleting(null)
      await loadEquipos()
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Equipos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Nuevo equipo
        </Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Código</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Ubicación</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Órdenes</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Cargando…</TableCell>
              </TableRow>
            ) : equipos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No hay equipos registrados.</TableCell>
              </TableRow>
            ) : (
              equipos.map((eq) => (
                <TableRow key={eq.id} hover>
                  <TableCell>{eq.codigo}</TableCell>
                  <TableCell>{eq.nombre}</TableCell>
                  <TableCell>{eq.ubicacion ?? '—'}</TableCell>
                  <TableCell>
                    <Chip label={eq.estado} size="small" color={estadoColor[eq.estado]} />
                  </TableCell>
                  <TableCell align="right">{eq._count?.ordenes ?? 0}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => openEdit(eq)}>
                        Editar
                      </Button>
                      {isAdmin && (
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDeleting(eq)}
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
        <DialogTitle>{editing ? 'Editar equipo' : 'Nuevo equipo'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <TextField
              label="Código"
              fullWidth
              value={form.codigo}
              onChange={(e) => setForm({ ...form, codigo: e.target.value })}
            />
            <TextField
              label="Ubicación"
              fullWidth
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            />
            <TextField
              select
              label="Estado"
              fullWidth
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoEquipo })}
            >
              {Object.keys(estadoColor).map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </TextField>
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
          ¿Estás seguro de eliminar el equipo «{deleting?.nombre}»?
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