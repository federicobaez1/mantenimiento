import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import AssignmentIcon from '@mui/icons-material/Assignment'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { api, getApiError } from '../lib/api'
import type { EstadoOrden, Resumen } from '../types'

const estadoLabels: Record<EstadoOrden, string> = {
  PENDIENTE: 'Pendientes',
  EN_PROGRESO: 'En progreso',
  COMPLETADA: 'Completadas',
  CANCELADA: 'Canceladas',
}

const estadoColor: Record<EstadoOrden, 'default' | 'info' | 'success' | 'error'> = {
  PENDIENTE: 'default',
  EN_PROGRESO: 'info',
  COMPLETADA: 'success',
  CANCELADA: 'error',
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

export default function Inicio() {
  const navigate = useNavigate()
  const [data, setData] = useState<Resumen | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      const { data } = await api.get<Resumen>('/resumen')
      setData(data)
    } catch (err) {
      setError(getApiError(err))
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const tarjetas = data
    ? [
        { label: 'Equipos registrados', valor: data.totalEquipos, icon: <BuildIcon />, color: 'primary.main' },
        { label: 'En mantenimiento / fuera de servicio', valor: data.totalEnMantenimiento, icon: <WarningAmberIcon />, color: 'warning.main' },
        { label: 'Órdenes totales', valor: data.totalOrdenes, icon: <AssignmentIcon />, color: 'info.main' },
        { label: 'Órdenes completadas', valor: data.ordenesPorEstado.COMPLETADA, icon: <CheckCircleIcon />, color: 'success.main' },
      ]
    : []

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>Panel de control</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {data && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {tarjetas.map((t) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={t.label}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: t.color }}>
                      {t.icon}
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{t.valor}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
            {(Object.keys(estadoLabels) as EstadoOrden[]).map((e) => (
              <Chip key={e} label={`${estadoLabels[e]}: ${data.ordenesPorEstado[e]}`} color={estadoColor[e]} variant="outlined" />
            ))}
          </Stack>

          <Typography variant="h6" sx={{ mb: 1 }}>Próximas órdenes</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Programada</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.proximas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No hay órdenes pendientes ni en progreso.</TableCell>
                  </TableRow>
                ) : (
                  data.proximas.map((o) => (
                    <TableRow
                      key={o.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate('/ordenes')}
                    >
                      <TableCell>{o.tipo}</TableCell>
                      <TableCell>{o.descripcion}</TableCell>
                      <TableCell>
                        {o.equipo.nombre} <Typography variant="caption">({o.equipo.codigo})</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={o.estado} size="small" color={estadoColor[o.estado]} />
                      </TableCell>
                      <TableCell>{formatDate(o.fechaProgramada)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  )
}