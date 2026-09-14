import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import BuildIcon from '@mui/icons-material/Build'
import { useAuth } from '../context/useAuth'
import { getApiError } from '../lib/api'

export default function Login() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register(nombre, email, password)
      }
      navigate('/equipos')
    } catch (err) {
      setError(getApiError(err))
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'primary.main',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent>
          <Stack spacing={3} sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center' }}>
              <BuildIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Sistema de Mantenimiento
              </Typography>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {mode === 'register' && (
                  <TextField
                    label="Nombre"
                    fullWidth
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                )}
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                  label="Contraseña"
                  type="password"
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit" variant="contained" size="large" disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : mode === 'login' ? 'Ingresar' : 'Registrarme'}
                </Button>
              </Stack>
            </Box>

            <Button variant="text" onClick={toggleMode}>
              {mode === 'login'
                ? 'No tengo cuenta · Registrarme'
                : 'Ya tengo cuenta · Ingresar'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}