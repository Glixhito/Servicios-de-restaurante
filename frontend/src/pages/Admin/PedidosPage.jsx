import { useState, useEffect } from 'react'
import { pedidosService } from '../../services/pedidosService'
import { useNavigate } from 'react-router-dom'
import Loading from '../../components/shared/Loading'
import Alert from '../../components/shared/Alert'
import Modal from '../../components/shared/Modal'
import { Eye, RefreshCw } from 'lucide-react'
import { EstadoPedido } from '../../constants/estados'

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    cargarPedidos()
    const interval = setInterval(cargarPedidos, 15000)
    return () => clearInterval(interval)
  }, [estadoFiltro])

  const cargarPedidos = async () => {
    try {
      setLoading(true)
      const res = await pedidosService.obtenerTodos(estadoFiltro || undefined)
      setPedidos(res.data)
    } catch (error) {
      setAlert({ type: 'error', message: 'Error cargando pedidos' })
    } finally {
      setLoading(false)
    }
  }

  const abrirDetalles = (pedido) => {
    setPedidoSeleccionado(pedido)
    setModalOpen(true)
  }

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      await pedidosService.cambiarEstado(pedidoId, {
        estado: nuevoEstado,
      })
      setAlert({ type: 'success', message: 'Estado actualizado' })
      cargarPedidos()
      setModalOpen(false)
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al cambiar estado' })
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🛵 Gestión de Pedidos</h1>
        <button
          onClick={cargarPedidos}
          className="btn btn-primary flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Actualizar
        </button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* FILTROS */}
      <div className="flex gap-2 flex-wrap">
        {['', 'PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'LISTO', 'EN_CAMINO', 'RECHAZADO'].map(
          estado => (
            <button
              key={estado}
              onClick={() => setEstadoFiltro(estado)}
              className={`px-4 py-2 rounded-lg transition ${
                estadoFiltro === estado
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {estado || 'Todos'}
            </button>
          )
        )}
      </div>

      {/* TABLA */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left py-3 px-4">Pedido</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Pago</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-600">
                    No hay pedidos
                  </td>
                </tr>
              ) : (
                pedidos.map(pedido => (
                  <tr key={pedido.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold">#{pedido.numero_pedido}</td>
                    <td className="py-3 px-4">{pedido.cliente?.nombre}</td>
                    <td className="py-3 px-4 font-semibold">${pedido.total.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                        pedido.estado === 'PENDIENTE' ? 'bg-yellow-500' :
                        pedido.estado === 'CONFIRMADO' ? 'bg-blue-500' :
                        pedido.estado === 'PREPARANDO' ? 'bg-orange-500' :
                        pedido.estado === 'LISTO' ? 'bg-purple-500' :
                        pedido.estado === 'EN_CAMINO' ? 'bg-green-500' :
                        'bg-red-500'
                      }`}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        pedido.metodo_pago === 'EFECTIVO' ? 'bg-green-100 text-green-700' :
                        pedido.metodo_pago === 'TRANSFERENCIA' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {pedido.metodo_pago}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => abrirDetalles(pedido)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLES */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Pedido #${pedidoSeleccionado?.numero_pedido}`}
        size="lg"
      >
        {pedidoSeleccionado && (
          <div className="space-y-6">
            {/* INFORMACIÓN DEL CLIENTE */}
            <div>
              <h3 className="font-bold mb-3">👤 Cliente</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Nombre:</strong> {pedidoSeleccionado.cliente?.nombre}</p>
                <p><strong>Teléfono:</strong> {pedidoSeleccionado.cliente?.telefono}</p>
              </div>
            </div>

            {/* DIRECCIÓN */}
            <div>
              <h3 className="font-bold mb-3">📍 Entrega</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Dirección:</strong> {pedidoSeleccionado.direccion}</p>
                <p><strong>Zona:</strong> {pedidoSeleccionado.zona?.nombre}</p>
                {pedidoSeleccionado.referencia && (
                  <p><strong>Referencia:</strong> {pedidoSeleccionado.referencia}</p>
                )}
                {pedidoSeleccionado.instrucciones && (
                  <p><strong>Instrucciones:</strong> {pedidoSeleccionado.instrucciones}</p>
                )}
              </div>
            </div>

            {/* PRODUCTOS */}
            <div>
              <h3 className="font-bold mb-3">🍽️ Productos</h3>
              <div className="space-y-2 text-sm">
                {pedidoSeleccionado.detalles?.map(d => (
                  <div key={d.id} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>{d.producto?.nombre} x{d.cantidad}</span>
                    <span>${(d.precio_unitario_en_momento * d.cantidad).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* TOTALES */}
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${pedidoSeleccionado.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-4 pb-4 border-b">
                <span>Domicilio:</span>
                <span>${pedidoSeleccionado.tarifa_domicilio.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-red-600">${pedidoSeleccionado.total.toLocaleString()}</span>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="space-y-2">
              {pedidoSeleccionado.estado === 'PENDIENTE' && (
                <>
                  <button
                    onClick={() => cambiarEstado(pedidoSeleccionado.id, 'CONFIRMADO')}
                    className="btn btn-primary w-full"
                  >
                    ✓ Confirmar Pedido
                  </button>
                  <button
                    onClick={() => {
                      const razon = prompt('Motivo del rechazo:')
                      if (razon) {
                        pedidosService.rechazar(pedidoSeleccionado.id, { razon })
                        .then(() => {
                          setAlert({ type: 'success', message: 'Pedido rechazado' })
                          cargarPedidos()
                          setModalOpen(false)
                        })
                      }
                    }}
                    className="btn btn-danger w-full"
                  >
                    ✗ Rechazar
                  </button>
                </>
              )}

              {pedidoSeleccionado.estado === 'CONFIRMADO' && (
                <button
                  onClick={() => cambiarEstado(pedidoSeleccionado.id, 'PREPARANDO')}
                  className="btn btn-primary w-full"
                >
                  👨‍🍳 Comenzar Preparación
                </button>
              )}

              {pedidoSeleccionado.estado === 'PREPARANDO' && (
                <button
                  onClick={() => cambiarEstado(pedidoSeleccionado.id, 'LISTO')}
                  className="btn btn-primary w-full"
                >
                  📦 Marcar Listo
                </button>
              )}

              {pedidoSeleccionado.estado === 'LISTO' && (
                <>
                  {pedidoSeleccionado.metodo_pago === 'EFECTIVO' && !pedidoSeleccionado.pago_efectivo_recibido && (
                    <button
                      onClick={() => {
                        pedidosService.confirmarPagoEfectivo(pedidoSeleccionado.id)
                        .then(() => {
                          setAlert({ type: 'success', message: 'Pago confirmado' })
                          cargarPedidos()
                          setModalOpen(false)
                        })
                      }}
                      className="btn btn-primary w-full"
                    >
                      💰 Confirmar Pago Efectivo
                    </button>
                  )}
                  <button
                    onClick={() => cambiarEstado(pedidoSeleccionado.id, 'EN_CAMINO')}
                    className="btn btn-primary w-full"
                  >
                    🛵 Enviar Pedido
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}