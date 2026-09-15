import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './context/useAuth'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Equipos from './pages/Equipos'
import Ordenes from './pages/Ordenes'
import Usuarios from './pages/Usuarios'

function ProtectedRoutes() {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <Layout isAdmin={user?.rol === 'ADMIN'} />
}

export default function App() {
  const { token, user } = useAuth()
  const isAdmin = user?.rol === 'ADMIN'

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/ordenes" element={<Ordenes />} />
        {isAdmin && <Route path="/usuarios" element={<Usuarios />} />}
      </Route>
      <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
    </Routes>
  )
}