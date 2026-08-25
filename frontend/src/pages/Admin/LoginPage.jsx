import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { authService } from '../../services/authService'
import Alert from '../../components/shared/Alert'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@restaurante.com')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setAlert(null)
      const res = await authService.login(email, password)
      login(res.data.access_token, { email })
      navigate('/admin/dashboard')
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Error al iniciar sesión'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🍔</h1>
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-gray-600 mt-2">Inicia sesión para continuar</p>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={20} />
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Demo:</strong> email@admin.com / admin123
          </p>
        </div>
      </div>
    </div>
  )
}