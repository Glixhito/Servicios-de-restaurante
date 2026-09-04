import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Menu, X, LayoutDashboard, ShoppingCart, Package, Layers, MapPin, Flame } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false) // 📱 Estado separado para móviles
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
    <div className="flex h-screen bg-[#1a1209] text-[#f5ead8] font-sans overflow-hidden relative">
      
      {/* 📱 HEADER MÓVIL SUPERIOR (Solo visible en pantallas pequeñas) */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-[#231a0d] border-b border-[#3a2a18] px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#e8621a]/10 border border-[#e8621a]/30 flex items-center justify-center text-[#e8621a]">
            <Flame size={18} />
          </div>
          <h1 className="font-serif font-bold text-sm tracking-wide text-[#f5ead8]">Admin Asadero</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="hover:bg-[#1a1209] text-[#9c8a6e] hover:text-[#f5ead8] p-2 rounded-xl border border-[#3a2a18] transition-all"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* 📱 OVERLAY OSCURO PARA MÓVIL CUANDO EL MENÚ ESTÁ ABIERTO */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* SIDEBAR (Deslizable en móvil / Colapsable en Desktop) */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarOpen ? 'w-64' : 'w-20'} 
          bg-[#231a0d] border-r border-[#3a2a18] transition-all duration-300 flex flex-col shadow-2xl lg:shadow-xl
        `}
      >
        {/* HEADER DEL SIDEBAR */}
        <div className="p-5 border-b border-[#3a2a18] flex justify-between items-center h-16 lg:h-auto">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#e8621a]/10 border border-[#e8621a]/30 flex items-center justify-center text-[#e8621a]">
                <Flame size={18} />
              </div>
              <h1 className="font-serif font-bold text-base tracking-wide text-[#f5ead8]">Admin Asadero</h1>
            </div>
          ) : (
            <div className="hidden lg:flex w-full justify-center text-[#e8621a]">
              <Flame size={20} />
            </div>
          )}
          
          {/* Botón para contraer en Desktop */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex hover:bg-[#1a1209] text-[#9c8a6e] hover:text-[#f5ead8] p-2 rounded-xl border border-transparent hover:border-[#3a2a18] transition-all"
            title={sidebarOpen ? 'Contraer menú' : 'Expandir menú'}
          >
            <Menu size={18} />
          </button>

          {/* Botón para cerrar en Móvil */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden hover:bg-[#1a1209] text-[#9c8a6e] hover:text-[#f5ead8] p-2 rounded-xl border border-[#3a2a18]"
          >
            <X size={18} />
          </button>
        </div>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  active
                    ? 'bg-[#e8621a] text-white shadow-[0_4px_15px_rgba(232,98,26,0.35)] font-semibold'
                    : 'text-[#9c8a6e] hover:bg-[#1a1209] hover:text-[#f5ead8]'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} className={active ? 'text-white' : 'text-[#9c8a6e] group-hover:text-[#e8621a] transition-colors'} />
                {sidebarOpen && <span className="text-sm tracking-wide">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* FOOTER DEL SIDEBAR (USUARIO Y SALIDA) */}
        <div className="p-4 border-t border-[#3a2a18] bg-[#1a1209]/30">
          {sidebarOpen && (
            <div className="mb-3 px-2">
              <p className="text-[11px] uppercase tracking-wider text-[#9c8a6e] font-semibold">Sesión activa</p>
              <p className="text-xs text-[#f5ead8] truncate font-mono mt-0.5">{user?.email || 'admin@restaurante.com'}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-600 p-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-sm font-semibold"
            title="Cerrar Sesión"
          >
            <LogOut size={16} />
            {sidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#1a1209] pt-16 lg:pt-0">
        
        {/* CABECERA SUPERIOR */}
        <header className="bg-[#231a0d] border-b border-[#3a2a18] px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between shadow-sm z-10">
          <div>
            <h2 className="text-base sm:text-xl font-serif font-bold text-[#f5ead8] tracking-wide">Panel de Control General</h2>
            <p className="text-[11px] sm:text-xs text-[#9c8a6e] mt-0.5">Control total del restaurante en tiempo real.</p>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-[#1a1209] border border-[#3a2a18] px-3.5 py-2 rounded-xl text-xs text-[#f0a030] font-medium shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#e8621a] animate-ping"></span>
            Sistema Operativo OK
          </div>
        </header>

        {/* ÁREA DINÁMICA DE VISTAS */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 bg-[#1a1209] scrollbar-thin scrollbar-thumb-[#3a2a18]">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}