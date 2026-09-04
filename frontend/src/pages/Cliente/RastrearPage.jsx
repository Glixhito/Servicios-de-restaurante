import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { pedidosService } from '../../services/pedidosService'
import { Search, MapPin, User, Package, Clock, Truck, ChefHat, CheckCircle, AlertCircle, ShoppingBag, Utensils } from 'lucide-react'
import Alert from '../../components/shared/Alert'

export default function RastrearPage() {
  const [searchParams] = useSearchParams()
  const [numeroPedido, setNumeroPedido] = useState(searchParams.get('numero') || '')
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)

  const buscarPedido = async (e) => {
    e.preventDefault()
    if (!numeroPedido.trim()) return
    try {
      setLoading(true)
      setAlert(null)
      const res = await pedidosService.obtenerPorNumero(numeroPedido)
      setPedido(res.data.pedido || res.data)
    } catch (err) {
      setAlert({ type: 'error', message: 'No se encontró ningún pedido con ese número' })
      setPedido(null)
    } finally {
      setLoading(false)
    }
  }

  // 🛡️ FORMATEO SEGURO DE PRECIOS
  const formatearPrecio = (precio) => {
    const valorSeguro = Number(precio) || 0;
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(Math.round(valorSeguro));
  }

  // 🎨 CONFIGURACIÓN DINÁMICA DE ESTADOS
  const getStatusConfig = (estado) => {
    switch (estado) {
      case 'PENDIENTE': 
        return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'Pendiente de Confirmación' }
      case 'CONFIRMADO': 
        return { icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Pedido Confirmado' }
      case 'PREPARANDO': 
        return { icon: ChefHat, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'En Preparación' }
      case 'LISTO': 
        return { icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'Listo para Envío' }
      case 'EN_CAMINO': 
        return { icon: Truck, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30', label: 'En Camino' }
      case 'ENTREGADO': 
        return { icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30', label: 'Entregado con Éxito' }
      case 'RECHAZADO': 
        return { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Pedido Rechazado' }
      default: 
        return { icon: Package, color: 'text-[#f5ead8]', bg: 'bg-[#1a1209]', border: 'border-[#3a2a18]', label: estado }
    }
  }

  return (
    <div className="max-w-xl mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] font-sans p-5 sm:p-8 pb-16 animate-fade-in">
      
      {/* HEADER BÚSQUEDA */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-[#231a0d] border border-[#3a2a18] rounded-2xl mb-4 shadow-sm">
          <Search className="text-[#e8621a] w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#f5ead8]">Rastrea tu Pedido</h1>
        <p className="text-[#9c8a6e] text-sm mt-2">Ingresa tu número de pedido para conocer su estado actual.</p>
      </div>

      <form onSubmit={buscarPedido} className="relative flex items-center mb-8 shadow-lg">
        <input 
          type="text" 
          placeholder="Ej: 260109" 
          value={numeroPedido} 
          onChange={(e) => setNumeroPedido(e.target.value)} 
          className="w-full bg-[#231a0d] border border-[#3a2a18] rounded-2xl pl-5 pr-14 py-4 text-sm sm:text-base text-[#f5ead8] font-bold tracking-widest placeholder:text-[#9c8a6e]/50 placeholder:font-normal focus:outline-none focus:border-[#e8621a] transition-colors" 
          required 
        />
        <button 
          type="submit" 
          disabled={loading} 
          className="absolute right-2 bg-[#e8621a] p-2.5 rounded-xl font-bold shadow-md hover:bg-orange-600 transition disabled:opacity-50"
        >
          <Search size={20} className="text-white" />
        </button>
      </form>

      {alert && (
        <div className="mb-6 animate-fade-in">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* RESULTADO DEL PEDIDO */}
      {pedido && (() => {
        const statusCfg = getStatusConfig(pedido.estado);
        const StatusIcon = statusCfg.icon;

        return (
          <div className="bg-[#231a0d] border border-[#3a2a18] rounded-3xl p-6 sm:p-8 shadow-xl animate-fade-in">
            
            {/* ESTADO DINÁMICO */}
            <div className="text-center border-b border-[#3a2a18] pb-6 mb-6">
              <div className={`inline-flex items-center justify-center p-4 rounded-full ${statusCfg.bg} ${statusCfg.border} border mb-4 shadow-inner`}>
                <StatusIcon className={`w-10 h-10 ${statusCfg.color}`} />
              </div>
              <h2 className={`text-2xl sm:text-3xl font-serif font-extrabold uppercase tracking-wide ${statusCfg.color} drop-shadow-sm`}>
                {statusCfg.label}
              </h2>
              <p className="text-[#9c8a6e] text-sm mt-2 font-medium tracking-widest">
                PEDIDO #{pedido.numero_pedido}
              </p>
            </div>

            {/* DETALLES EN TARJETAS INTERNAS */}
            <div className="space-y-4 mb-6">
              <div className="bg-[#1a1209] border border-[#3a2a18] rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-[#231a0d] p-2.5 rounded-xl border border-[#3a2a18]">
                  <User className="text-[#e8621a] w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-[#9c8a6e] font-bold uppercase tracking-wider mb-0.5">Cliente</p>
                  <p className="text-sm sm:text-base font-medium">{pedido.cliente?.nombre || 'No registrado'}</p>
                </div>
              </div>

              <div className="bg-[#1a1209] border border-[#3a2a18] rounded-2xl p-4 flex items-center gap-4">
                <div className="bg-[#231a0d] p-2.5 rounded-xl border border-[#3a2a18]">
                  <MapPin className="text-[#e8621a] w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-[#9c8a6e] font-bold uppercase tracking-wider mb-0.5">Dirección de Entrega</p>
                  <p className="text-sm sm:text-base font-medium">{pedido.direccion}</p>
                  {pedido.referencia && <p className="text-xs text-[#9c8a6e] mt-0.5">Ref: {pedido.referencia}</p>}
                </div>
              </div>
            </div>

            {/* 🔥 LISTA DE PRODUCTOS PEDIDOS */}
            {pedido.detalles && pedido.detalles.length > 0 && (
              <div className="bg-[#1a1209] border border-[#3a2a18] rounded-2xl p-4 mb-6">
                <h3 className="text-[10px] sm:text-xs text-[#e8621a] font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShoppingBag size={14} /> Resumen del Pedido
                </h3>
                <div className="space-y-3">
                  {pedido.detalles.map((d, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm border-b border-[#3a2a18]/50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#231a0d] border border-[#3a2a18] text-[#f0a030] font-bold px-2 py-1 rounded-lg text-xs shadow-inner">
                          x{d.cantidad}
                        </span>
                        <span className="text-[#f5ead8] font-medium">{d.producto?.nombre || 'Plato'}</span>
                      </div>
                      <span className="text-[#f0a030] font-bold">
                        {formatearPrecio(d.precio_unitario_en_momento * d.cantidad)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOTAL DESTACADO */}
            <div className="bg-gradient-to-br from-[#1a1209] to-[#231a0d] border border-[#3a2a18] rounded-2xl p-5 space-y-2 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-[#f5ead8] uppercase tracking-wider">Total Productos</span>
                <span className="text-[#f0a030] text-2xl font-serif font-extrabold drop-shadow-sm">
                  {formatearPrecio(pedido.subtotal || pedido.total)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs text-[#e8621a] pt-2 border-t border-[#3a2a18]">
                <span>Costo de domicilio:</span>
                <span className="font-medium">Pago en efectivo al repartidor</span>
              </div>
            </div>

            {/* BOTÓN PARA VOLVER AL MENÚ */}
            <div className="mt-6 pt-6 border-t border-[#3a2a18]">
              <Link 
                to="/" 
                className="w-full bg-[#1a1209] hover:bg-[#e8621a] text-[#f0a030] hover:text-white border border-[#3a2a18] hover:border-[#e8621a] font-serif font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm"
              >
                <Utensils size={18} />
                Volver al Menú Principal
              </Link>
            </div>
            
          </div>
        );
      })()}
    </div>
  )
}