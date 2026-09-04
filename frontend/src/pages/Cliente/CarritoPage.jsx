import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2, Plus, Minus, ChevronLeft, ArrowRight, Utensils } from 'lucide-react'
import { useCarritoStore } from '../../store/carritoStore'

export default function CarritoPage() {
  const { items, actualizarCantidad, removerProducto, obtenerSubtotal } = useCarritoStore()
  const navigate = useNavigate()
  
  const subtotal = Number(obtenerSubtotal()) || 0

  const formatearPrecio = (precio) => {
    const valorSeguro = Number(precio) || 0;
    const precioRedondeado = Math.round(valorSeguro);
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(precioRedondeado);
  }

  // ESTADO: CARRITO VACÍO
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] p-6 flex flex-col items-center justify-center text-center">
        <div className="bg-[#231a0d] border border-[#3a2a18] p-6 rounded-3xl mb-6 shadow-[0_0_30px_rgba(232,98,26,0.15)]">
          <ShoppingBag size={48} className="text-[#e8621a] mx-auto opacity-90" />
        </div>
        <h2 className="text-2xl font-serif font-bold mb-2">Tu carrito está vacío</h2>
        <p className="text-sm text-[#9c8a6e] mb-8 px-4">Añade los mejores cortes y platos de la parrilla para continuar.</p>
        <Link to="/" className="w-full bg-[#e8621a] text-white font-serif font-bold py-4 rounded-xl shadow-[0_5px_20px_rgba(232,98,26,0.3)] hover:bg-orange-600 transition-all duration-300 block transform hover:-translate-y-1">
          Ver Menú al Carbón
        </Link>
      </div>
    )
  }

  // ESTADO: CARRITO CON PRODUCTOS
  return (
    <div className="max-w-md mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] font-sans p-5 pb-40 relative">
      <div className="flex items-center justify-between mb-6 border-b border-[#3a2a18] pb-4">
        <Link to="/" className="bg-[#231a0d] border border-[#3a2a18] p-2 rounded-xl text-[#9c8a6e] hover:text-white hover:bg-[#2e2010] transition">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="font-serif font-bold text-lg tracking-wide">Tu Pedido Actual</h1>
        <div className="w-9"></div>
      </div>
      
      {/* LISTA DE PRODUCTOS */}
      <div className="space-y-4 mb-8">
        {items.map(item => {
          // Usamos cartItemId si existe, o el id por defecto
          const uniqueId = item.cartItemId || item.id;

          return (
            <div key={uniqueId} className="bg-[#231a0d] border border-[#3a2a18] rounded-3xl p-3.5 flex items-center gap-4 shadow-[0_4px_15px_rgba(0,0,0,0.15)] transition-colors hover:border-[#e8621a]/30">
              <img 
                src={item.imagen_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&h=500&fit=crop&auto=format"} 
                alt={item.nombre} 
                className="w-20 h-20 rounded-2xl object-cover border border-[#3a2a18]" 
              />
              
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="font-serif font-bold text-[15px] text-[#f5ead8] leading-tight line-clamp-2">
                      {item.nombre}
                    </h3>
                  </div>

                  {/* 🥩 Muestra el gramaje seleccionado si es un corte de carne con porción */}
                  {item.gramos && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#f0a030] bg-[#f0a030]/10 px-2 py-0.5 rounded-md mt-1 border border-[#f0a030]/20">
                      <Utensils size={12} />
                      {item.gramos} gramos
                    </span>
                  )}

                  {/* Precio unitario x cantidad */}
                  <p className="text-sm text-[#f0a030] font-bold mt-1">
                    {formatearPrecio(item.precio * item.cantidad)}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3 bg-[#1a1209] border border-[#3a2a18] px-2 py-1.5 rounded-lg shadow-inner">
                    {/* 👇 Usamos uniqueId para que sepa exactamente qué porción modificar */}
                    <button onClick={() => actualizarCantidad(uniqueId, item.cantidad - 1)} className="text-[#9c8a6e] hover:text-[#e8621a] transition-colors"><Minus size={16} /></button>
                    <span className="text-sm font-bold w-4 text-center">{item.cantidad}</span>
                    <button onClick={() => actualizarCantidad(uniqueId, item.cantidad + 1)} className="text-[#9c8a6e] hover:text-[#e8621a] transition-colors"><Plus size={16} /></button>
                  </div>
                  
                  {/* 👇 Usamos uniqueId para borrar la porción correcta */}
                  <button onClick={() => removerProducto(uniqueId)} className="text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER TOTAL FIJO */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#231a0d]/95 backdrop-blur-md border-t border-[#3a2a18] p-5 space-y-4 shadow-[0_-15px_40px_rgba(0,0,0,0.6)] z-50 rounded-t-3xl">
        <div className="flex justify-between items-center text-sm px-1">
          <span className="text-[#9c8a6e] font-medium">Subtotal platos</span>
          <span className="font-bold text-[#f5ead8]">{formatearPrecio(subtotal)}</span>
        </div>
        
        <div className="flex justify-between items-end border-t border-[#3a2a18] pt-3 px-1">
          <span className="font-bold text-base text-[#f5ead8]">Total estimado<br/><span className="text-[11px] text-[#9c8a6e] font-normal">(Sin domicilio)</span></span>
          <span className="text-[#f0a030] text-2xl font-serif font-bold">{formatearPrecio(subtotal)}</span>
        </div>
        
        <button onClick={() => navigate('/checkout')} className="w-full bg-[#e8621a] hover:bg-orange-600 text-white font-serif font-bold py-4 rounded-xl shadow-[0_5px_20px_rgba(232,98,26,0.3)] transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
          <span className="tracking-wide">Continuar a Entrega y Pago</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}