import { useState, useEffect } from 'react'
import { zonasService } from '../../services/zonasService'
import Loading from '../../components/shared/Loading'
import Alert from '../../components/shared/Alert'
import Modal from '../../components/shared/Modal'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function ZonasPage() {
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    tarifa: '',
  })

  useEffect(() => {
    cargarZonas()
  }, [])

  const cargarZonas = async () => {
    try {
      setLoading(true)
      const res = await zonasService.obtenerTodas()
      setZonas(res.data)
    } catch (error) {
      setAlert({ type: 'error', message: 'Error cargando zonas' })
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (zona = null) => {
    if (zona) {
      setEditando(zona)
      setFormData({
        nombre: zona.nombre,
        tarifa: zona.tarifa,
      })
    } else {
      setEditando(null)
      setFormData({ nombre: '', tarifa: '' })
    }
    setModalOpen(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      if (editando) {
        await zonasService.actualizar(editando.id, formData)
        setAlert({ type: 'success', message: 'Zona actualizada' })
      } else {
        await zonasService.crear(formData)
        setAlert({ type: 'success', message: 'Zona creada' })
      }
      cargarZonas()
      setModalOpen(false)
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al guardar' })
    }
  }

  const eliminar = async (id) => {
    if (confirm('¿Estás seguro?')) {
      try {
        await zonasService.desactivar(id)
        setAlert({ type: 'success', message: 'Zona desactivada' })
        cargarZonas()
      } catch (error) {
        setAlert({ type: 'error', message: 'Error al eliminar' })
      }
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📍 Gestión de Zonas</h1>
        <button
          onClick={() => abrirModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Zona
        </button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* TABLA */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-left py-3 px-4">Zona</th>
                <th className="text-left py-3 px-4">Tarifa</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {zonas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-600">
                    No hay zonas
                  </td>
                </tr>
              ) : (
                zonas.map(zona => (
                  <tr key={zona.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{zona.nombre}</td>
                    <td className="py-3 px-4">${zona.tarifa.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        zona.activa
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {zona.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => abrirModal(zona)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => eliminar(zona.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Zona' : 'Nueva Zona'}
      >
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nombre de la Zona *</label>
            <input
              type="text"
              required
              placeholder="Ej: Centro, El Prado"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Tarifa de Domicilio *</label>
            <input
              type="number"
              step="1000"
              required
              placeholder="Ej: 5000"
              value={formData.tarifa}
              onChange={(e) => setFormData({ ...formData, tarifa: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              {editando ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary flex-1"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}