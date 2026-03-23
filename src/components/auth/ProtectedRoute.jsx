import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { SpinnerPage } from '../ui/Spinner'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  if (loading) return <SpinnerPage />
  if (!user) return <Navigate to="/giris" replace />
  return <>{children}</>
}
