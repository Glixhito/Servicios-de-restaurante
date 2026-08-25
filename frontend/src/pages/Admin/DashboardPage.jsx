import { useState, useEffect } from 'react'
import { dashboardService } from '../../services/dashboardService'
import { ShoppingCart, ChefHat, Package, Truck } from 'lucide-react'
import Loading from '../../components/shared/Loading'
import Alert from '../../components/shared/Alert'

export default function DashboardPage() {
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    cargarResumen()
    const interval = setInterval(cargarResumen, 30000) // Actualizar cada 30s
    return () => clearInterval(interval)
  }, [])

  const cargarResumen = async () => {
    try {
      const res = await dashboardService.obtenerResumen()
      setResumen(res.data)
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Error cargando dashboard'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loading />

  const estadisticas = [
    {
      label: 'Pendientes',
      valor: resumen?.resumen?.pendientes || 0,
      icon: ShoppingCart,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'En Preparación',
      valor: resumen?.resumen?.en_preparacion || 0,
      icon: ChefHat,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      label: 'Listos',
      valor: resumen?.resumen?.listos || 0,
      icon: Package,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'En Camino',
      valor: resumen?.resumen?.en_camino || 0,
      icon: Truck,
      color: 'bg-green-100 text-green-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">📊 Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen general de hoy</p>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} />}

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {estadisticas.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold">{stat.label}</p>
                    <p className="text-4xl font-bold mt-2">{stat.valor}</p>
                  </div>
                  <div className={`${stat.color} p-4 rounded-lg`}>
                    <Icon size={32} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* VENTAS */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">💰 Ventas del Día</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2">
            <div>
              <p className="text-gray-600 text-sm">Total Ventas</p>
              <p className="text-4xl font-bold text-green-600 mt-2">
                ${(resumen?.ventas_hoy?.total || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Pedidos Completados</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {resumen?.ventas_hoy?.cantidad_pedidos || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ÚLTIMOS PEDIDOS */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">🛵 Últimos Pedidos</h2>
        </div>
        <div className="card-body">
          {resumen?.ultimos_pedidos && resumen.ultimos_pedidos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-3">Pedido</th>
                    <th className="text-left py-3 px-3">Cliente</th>
                    <th className="text-left py-3 px-3">Total</th>
                    <th className="text-left py-3 px-3">Estado</th>
                    <th className="text-left py-3 px-3">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.ultimos_pedidos.map(pedido => (
                    <tr key={pedido.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 font-semibold">#{pedido.numero_pedido}</td>
                      <td className="py-3 px-3">{pedido.cliente?.nombre}</td>
                      <td className="py-3 px-3">${pedido.total.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {pedido.estado}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {new Date(pedido.created_at).toLocaleTimeString('es-CO')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No hay pedidos aún</p>
          )}
        </div>
      </div>
    </div>
  )
}