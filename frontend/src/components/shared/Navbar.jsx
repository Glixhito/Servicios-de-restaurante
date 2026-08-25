import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCarritoStore } from '../../store/carritoStore'
import { useState } from 'react'

export default function Navbar() {
  const { obtenerCantidadTotal } = useCarritoStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const cantidad = obtenerCantidadTotal()

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-red-600 flex items-center gap-2">
            🍔 Mi Restaurante
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/" className="hover:text-red-600 transition font-semibold">
              Menú
            </Link>
            <Link to="/rastrear" className="hover:text-red-600 transition font-semibold">
              Rastrear
            </Link>
            <Link to="/carrito" className="relative">
              <ShoppingCart size={24} />
              {cantidad > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cantidad}
                </span>
              )}
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            <Link to="/" className="block hover:text-red-600 transition font-semibold py-2">
              Menú
            </Link>
            <Link to="/rastrear" className="block hover:text-red-600 transition font-semibold py-2">
              Rastrear
            </Link>
            <Link to="/carrito" className="block hover:text-red-600 transition font-semibold py-2">
              Carrito ({cantidad})
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}