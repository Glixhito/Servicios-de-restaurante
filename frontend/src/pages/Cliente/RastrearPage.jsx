import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { pedidosService } from '../../services/pedidosService'
import { Search } from 'lucide-react'
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
      setPedido(res.data)
    } catch (err) {
      setAlert({ type: 'error', message: 'No se encontró ningún pedido con ese número' })
      setPedido(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-[#1a1209] min-h-screen text-[#f5ead8] font-sans p-5 pb-16">
      <h1 className="text-xl font-serif font-bold mb-6 text-center">Rastreo de Pedido</h1>
      <form onSubmit={buscarPedido} className="flex gap-2 mb-6">
        <input type="text" placeholder="Número de pedido (Ej: 1001)" value={numeroPedido} onChange={(e) => setNumeroPedido(e.target.value)} className="flex-1 bg-[#231a0d] border border-[#3a2a18] rounded-xl px-4 py-2.5 text-xs text-[#f5ead8] focus:outline-none focus:border-[#e8621a]" required />
        <button type="submit" disabled={loading} className="bg-[#e8621a] px-5 py-2.5 rounded-xl font-bold text-xs shadow hover:bg-orange-600 transition"><Search size={16} /></button>
      </form>
      {alert && <div className="mb-4"><Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} /></div>}
      {pedido && (
        <div className="bg-[#231a0d] border border-[#3a2a18] rounded-3xl p-6 space-y-6">
          <div className="text-center border-b border-[#3a2a18] pb-4">
            <span className="text-xs text-[#f0a030] font-bold uppercase tracking-wider">Estado Actual</span>
            <h2 className="text-2xl font-serif font-bold mt-1 text-[#f5ead8]">{pedido.estado}</h2>
            <p className="text-xs text-[#9c8a6e] mt-1">Pedido #{pedido.numero_pedido}</p>
          </div>
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-xs text-[#9c8a6e]">Detalles de Entrega</h3>
            <div className="text-xs space-y-1 bg-[#1a1209] p-3 rounded-xl border border-[#3a2a18]">
              <p><strong className="text-[#f5ead8]">Cliente:</strong> {pedido.cliente?.nombre}</p>
              <p><strong className="text-[#f5ead8]">Dirección:</strong> {pedido.direccion}</p>
              <p><strong className="text-[#f5ead8]">Zona:</strong> {pedido.zona?.nombre}</p>
            </div>
          </div>
          <div className="border-t border-[#3a2a18] pt-4 flex justify-between items-center text-sm font-bold">
            <span>Total Pagado:</span>
            <span className="text-[#f0a030] text-base"></span>
          </div>
        </div>
      )}
    </div>
  )
}