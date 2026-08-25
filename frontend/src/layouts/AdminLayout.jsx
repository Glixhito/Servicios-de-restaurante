import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, LayoutDashboard, ShoppingCart, Package, Layers, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const isActive = (path) => location.pathname === path

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { label: 'Pedidos', icon: ShoppingCart, path: '/admin/pedidos' },
    { label: 'Productos', icon: Package, path: '/admin/productos' },
    { label: 'Categorías', icon: Layers, path: '/admin/categorias' },
    { label: 'Zonas', icon: MapPin, path: '/admin/zonas' },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* HEADER */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          {sidebarOpen && <h1 className="font-bold text-lg">🍔 Admin</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-gray-800 p-2 rounded"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 p-4">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                isActive(item.path)
                  ? 'bg-red-600 text-white'
                  : 'hover:bg-gray-800'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-700">
          {sidebarOpen && <p className="text-sm text-gray-400 mb-3 truncate">{user?.email}</p>}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 p-2 rounded flex items-center justify-center gap-2 transition"
          >
            <LogOut size={18} />
            {sidebarOpen && 'Salir'}
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800">Panel Administrativo</h2>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}