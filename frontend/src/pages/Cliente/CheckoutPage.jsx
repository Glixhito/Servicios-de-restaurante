import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCarritoStore } from '../../store/carritoStore'
import { zonasService } from '../../services/zonasService'
import { pedidosService } from '../../services/pedidosService'
import Alert from '../../components/shared/Alert'
import { ChevronLeft, MapPin, User, CreditCard, CheckCircle } from 'lucide-react'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, obtenerSubtotal, limpiarCarrito } = useCarritoStore()
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState(null)
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null)

  const [formData, setFormData] = useState({
    cliente: { nombre: '', telefono: '' },
    entrega: { direccion: '', zona_id: '', referencia: '', instrucciones: '' },
    pago: { metodo: 'EFECTIVO' },
  })

  useEffect(() => {
    cargarZonas()
  }, [])

  const cargarZonas = async () => {
    try {
      const res = await zonasService.obtenerActivas()
      setZonas(res.data)
      if (res.data.length > 0) {
        setZonaSeleccionada(res.data[0])
        setFormData(prev => ({
          ...prev,
          entrega: { ...prev.entrega, zona_id: res.data[0].id }
        }))
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'Error cargando zonas de entrega' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.cliente.nombre.trim() || !formData.cliente.telefono.trim()) {
      setAlert({ type: 'error', message: 'Completa tu nombre y teléfono' })
      return
    }
    if (!formData.entrega.direccion.trim()) {
      setAlert({ type: 'error', message: 'La dirección es obligatoria' })
      return
    }
    try {
      setLoading(true)
      const datos = {
        ...formData,
        carrito: items.map(item => ({ producto_id: item.id, cantidad: item.cantidad })),
      }
      const res = await pedidosService.crear(datos)
      setAlert({ type: 'success', message: '¡Pedido #' + res.data.numero_pedido + ' creado con éxito!' })
      limpiarCarrito()
      setTimeout(() => { navigate('/rastrear?numero=' + res.data.numero_pedido) }, 1500)
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error al procesar el pedido' })
    } finally {
      setLoading(false)
    }
  }

  const subtotal = obtenerSubtotal()
  const tarifa = zonaSeleccionada?.tarifa || 0
  const total = subtotal + tarifa

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] p-6 text-center flex flex-col justify-center">
        <h2 className="text-xl font-serif font-bold mb-4">Tu carrito está vacío</h2>
        <Link to="/" className="bg-[#e8621a] text-white py-3 rounded-xl font-bold">Volver al Menú</Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] font-sans p-5 pb-28">
      <div className="flex items-center justify-between mb-6 border-b border-[#3a2a18] pb-4">
        <Link to="/carrito" className="bg-[#231a0d] border border-[#3a2a18] p-2 rounded-xl text-[#9c8a6e] hover:text-white"><ChevronLeft size={20} /></Link>
        <h1 className="font-serif font-bold text-lg">Checkout y Pago</h1>
        <div className="w-9"></div>
      </div>
      {alert && <div className="mb-4"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl p-4 space-y-4">
          <h2 className="font-serif font-bold text-sm text-[#f0a030] flex items-center gap-2"><User size={16} /> Tus Datos</h2>
          <input type="text" placeholder="Nombre completo" required value={formData.cliente.nombre} onChange={(e) => setFormData(prev => ({ ...prev, cliente: { ...prev.cliente, nombre: e.target.value } }))} className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-2.5 text-xs text-[#f5ead8] focus:outline-none focus:border-[#e8621a]" />
          <input type="tel" placeholder="Teléfono / WhatsApp" required value={formData.cliente.telefono} onChange={(e) => setFormData(prev => ({ ...prev, cliente: { ...prev.cliente, telefono: e.target.value } }))} className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-2.5 text-xs text-[#f5ead8] focus:outline-none focus:border-[#e8621a]" />
        </div>
        <div className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl p-4 space-y-4">
          <h2 className="font-serif font-bold text-sm text-[#f0a030] flex items-center gap-2"><MapPin size={16} /> Zona y Dirección</h2>
          <select required value={formData.entrega.zona_id} onChange={(e) => { const zona = zonas.find(z => z.id === e.target.value); setZonaSeleccionada(zona); setFormData(prev => ({ ...prev, entrega: { ...prev.entrega, zona_id: e.target.value } })) }} className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-2.5 text-xs text-[#f5ead8] focus:outline-none focus:border-[#e8621a]">
            {zonas.map(zona => (<option key={zona.id} value={zona.id}>{zona.nombre} (+)</option>))}
          </select>
          <input type="text" placeholder="Dirección completa" required value={formData.entrega.direccion} onChange={(e) => setFormData(prev => ({ ...prev, entrega: { ...prev.entrega, direccion: e.target.value } }))} className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-2.5 text-xs text-[#f5ead8] focus:outline-none focus:border-[#e8621a]" />
          <input type="text" placeholder="Referencia (Opcional)" value={formData.entrega.referencia} onChange={(e) => setFormData(prev => ({ ...prev, entrega: { ...prev.entrega, referencia: e.target.value } }))} className="w-full bg-[#1a1209] border border-[#3a2a18] rounded-xl px-4 py-2.5 text-xs text-[#f5ead8] focus:outline-none focus:border-[#e8621a]" />
        </div>
        <div className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl p-4 space-y-3">
          <h2 className="font-serif font-bold text-sm text-[#f0a030] flex items-center gap-2"><CreditCard size={16} /> Método de Pago</h2>
          {[{ value: 'EFECTIVO', label: 'Efectivo contra entrega' }, { value: 'TRANSFERENCIA', label: 'Transferencia Bancaria' }, { value: 'PAGO_LINEA', label: 'Pago en Línea / Tarjeta' }].map(metodo => (
            <label key={metodo.value} className="flex items-center justify-between p-3 bg-[#1a1209] border border-[#3a2a18] rounded-xl cursor-pointer">
              <span className="text-xs font-semibold">{metodo.label}</span>
              <input type="radio" name="pago" value={metodo.value} checked={formData.pago.metodo === metodo.value} onChange={(e) => setFormData(prev => ({ ...prev, pago: { metodo: e.target.value } }))} className="accent-[#e8621a]" />
            </label>
          ))}
        </div>
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#231a0d] border-t border-[#3a2a18] p-5 shadow-2xl">
          <div className="flex justify-between items-center mb-3 text-xs text-[#9c8a6e]">
            <span>Total a Pagar (Incluye domicilio):</span>
            <span className="font-bold text-[#f0a030] text-base"></span>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#e8621a] hover:bg-orange-600 text-white font-serif font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50">
            <CheckCircle size={18} />
            <span>{loading ? 'Procesando Pedido...' : 'Confirmar y Enviar Pedido'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}