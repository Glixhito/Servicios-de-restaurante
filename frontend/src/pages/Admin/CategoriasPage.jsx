import { useState, useEffect } from 'react'
import { categoriasService } from '../../services/categoriasService'
import Loading from '../../components/shared/Loading'
import Alert from '../../components/shared/Alert'
import Modal from '../../components/shared/Modal'
import { Edit, Trash2, Plus } from 'lucide-react'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    orden: 0,
  })

  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    try {
      setLoading(true)
      const res = await categoriasService.obtenerTodas()
      setCategorias(res.data)
    } catch (error) {
      setAlert({ type: 'error', message: 'Error cargando categorías' })
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (categoria = null) => {
    if (categoria) {
      setEditando(categoria)
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        orden: categoria.orden,
      })
    } else {
      setEditando(null)
      setFormData({ nombre: '', descripcion: '', orden: 0 })
    }
    setModalOpen(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      if (editando) {
        await categoriasService.actualizar(editando.id, formData)
        setAlert({ type: 'success', message: 'Categoría actualizada' })
      } else {
        await categoriasService.crear(formData)
        setAlert({ type: 'success', message: 'Categoría creada' })
      }
      cargarCategorias()
      setModalOpen(false)
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al guardar' })
    }
  }

  const eliminar = async (id) => {
    if (confirm('¿Estás seguro?')) {
      try {
        await categoriasService.eliminar(id)
        setAlert({ type: 'success', message: 'Categoría eliminada' })
        cargarCategorias()
      } catch (error) {
        setAlert({ type: 'error', message: 'Error al eliminar' })
      }
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📂 Gestión de Categorías</h1>
        <button
          onClick={() => abrirModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Categoría
        </button>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.map(cat => (
          <div key={cat.id} className="card">
            <div className="card-body">
              <h3 className="text-lg font-bold mb-2">{cat.nombre}</h3>
              {cat.descripcion && (
                <p className="text-gray-600 text-sm mb-4">{cat.descripcion}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => abrirModal(cat)}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Editar
                </button>
                <button
                  onClick={() => eliminar(cat.id)}
                  className="btn btn-danger flex-1 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editando ? 'Editar Categoría' : 'Nueva Categoría'}
      >
        <form onSubmit={guardar} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Nombre *</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="input"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Orden</label>
            <input
              type="number"
              value={formData.orden}
              onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
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