import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2, Plus, Minus, ChevronLeft, ArrowRight } from 'lucide-react'
import { useCarritoStore } from '../../store/carritoStore'

export default function CarritoPage() {
  const { items, actualizarCantidad, removerProducto, obtenerSubtotal } = useCarritoStore()
  const navigate = useNavigate()
  const subtotal = obtenerSubtotal()

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-[#231a0d] border border-[#3a2a18] p-6 rounded-3xl mb-6"><ShoppingBag size={48} className="text-[#9c8a6e] mx-auto" /></div>
        <h2 className="text-2xl font-serif font-bold mb-2">Tu carrito está vacío</h2>
        <p className="text-xs text-[#9c8a6e] mb-6">Añade los mejores cortes y platos de la parrilla para continuar.</p>
        <Link to="/" className="w-full bg-[#e8621a] text-white font-serif font-bold py-3.5 rounded-2xl shadow-lg hover:bg-orange-600 transition">Ver Menú al Carbón</Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] font-sans p-5 pb-28 relative">
      <div className="flex items-center justify-between mb-6 border-b border-[#3a2a18] pb-4">
        <Link to="/" className="bg-[#231a0d] border border-[#3a2a18] p-2 rounded-xl text-[#9c8a6e] hover:text-white"><ChevronLeft size={20} /></Link>
        <h1 className="font-serif font-bold text-lg">Tu Pedido Actual</h1>
        <div className="w-9"></div>
      </div>
      <div className="space-y-3 mb-8">
        {items.map(item => (
          <div key={item.id} className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl p-3 flex items-center gap-3">
            <img src={item.imagen_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&h=500&fit=crop&auto=format"} alt={item.nombre} className="w-16 h-16 rounded-xl object-cover border border-[#3a2a18]" />
            <div className="flex-1 min-w-0">
              <h3 className="font-serif font-bold text-xs text-[#f5ead8] truncate">{item.nombre}</h3>
              <p className="text-xs text-[#f0a030] font-bold mt-0.5"></p>
            </div>
            <div className="flex items-center gap-2 bg-[#1a1209] border border-[#3a2a18] px-2 py-1 rounded-xl">
              <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)} className="text-[#9c8a6e] hover:text-white"><Minus size={14} /></button>
              <span className="text-xs font-bold w-3 text-center">{item.cantidad}</span>
              <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)} className="text-[#9c8a6e] hover:text-white"><Plus size={14} /></button>
            </div>
            <button onClick={() => removerProducto(item.id)} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#231a0d] border-t border-[#3a2a18] p-5 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#9c8a6e]">Subtotal platos</span>
          <span className="font-bold text-[#f5ead8]"></span>
        </div>
        <div className="flex justify-between items-center text-base font-bold border-t border-[#3a2a18] pt-3">
          <span>Total estimado</span>
          <span className="text-[#f0a030] text-lg"></span>
        </div>
        <button onClick={() => navigate('/checkout')} className="w-full bg-[#e8621a] hover:bg-orange-600 text-white font-serif font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2">
          <span>Continuar a Entrega y Pago</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}