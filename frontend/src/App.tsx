import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './context/useAuth'
import Login from './pages/Login'
import Equipos from './pages/Equipos'
import Ordenes from './pages/Ordenes'

function ProtectedRoutes() {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <Layout />
}

export default function App() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/equipos" replace /> : <Login />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/ordenes" element={<Ordenes />} />
      </Route>
      <Route path="*" element={<Navigate to={token ? '/equipos' : '/login'} replace />} />
    </Routes>
  )
}