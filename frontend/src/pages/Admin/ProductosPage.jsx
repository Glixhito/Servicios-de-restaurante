import { useState, useEffect } from 'react'
import { productosService } from '../../services/productosService'
import { categoriasService } from '../../services/categoriasService'
import Loading from '../../components/shared/Loading'
import Alert from '../../components/shared/Alert'
import Modal from '../../components/shared/Modal'
import { Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react'

export default function ProductosPage() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: '',
    precio: '',
    imagen_url: '',
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [prodRes, catRes] = await Promise.all([
        productosService.obtenerTodos(),
        categoriasService.obtenerTodas(),
      ])
      setProductos(prodRes.data)
      setCategorias(catRes.data)
    } catch (error) {
      setAlert({ type: 'error', message: 'Error cargando datos' })
    } finally {
      setLoading(false)
    }
  }

  const abrirModal = (producto = null) => {
    if (producto) {
      setEditando(producto)
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        categoria_id: producto.categoria_id,
        precio: producto.precio,
        imagen_url: producto.imagen_url,
      })
    } else {
      setEditando(null)
      setFormData({
        nombre: '',
        descripcion: '',
        categoria_id: categorias[0]?.id || '',
        precio: '',
        imagen_url: '',
      })
    }
    setModalOpen(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    try {
      const datosAEnviar = {
        ...formData,
        precio: parseFloat(formData.precio),
      }

      if (editando) {
        await productosService.actualizar(editando.id, datosAEnviar)
        setAlert({ type: 'success', message: 'Producto actualizado' })
      } else {
        await productosService.crear(datosAEnviar)
        setAlert({ type: 'success', message: 'Producto creado' })
      }
      cargarDatos()
      setModalOpen(false)
    } catch (error) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Error' })
    }
  }

  const toggleDisponibilidad = async (id) => {
    try {
      await productosService.toggleDisponibilidad(id)
      setAlert({ type: 'success', message: 'Disponibilidad actualizada' })
      cargarDatos()
    } catch (error) {
      setAlert({ type: 'error', message: 'Error al actualizar' })
    }
  }

  const eliminar = async (id) => {
    if (confirm('¿Estás seguro?')) {
      try {
        await productosService.eliminar(id)
        setAlert({ type: 'success', message: 'Producto eliminado' })
        cargarDatos()
      } catch (error) {
        setAlert({ type: 'error', message: 'Error al eliminar' })
      }
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🍕 Gestión de Productos</h1>
        <button
          onClick={() => abrirModal()}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Producto
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
                <th className="text-left py-3 px-4">Producto</th>
                <th className="text-left py-3 px-4">Categoría</th>
                <th className="text-left py-3 px-4">Precio</th>
                <th className="text-left py-3 px-4">Disponibilidad</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-600">
                    No hay productos
                  </td>
                </tr>
              ) : (
                productos.map(producto => (
                  <tr key={producto.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{producto.nombre}</td>
                    <td className="py-3 px-4">{producto.categoria?.nombre}</td>
                    <td className="py-3 px-4 font-semibold">${producto.precio.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleDisponibilidad(producto.id)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                          producto.disponible
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {producto.disponible ? (
                          <>
                            <Eye size={16} />
                            Disponible
                          </>
                        ) : (
                          <>
                            <EyeOff size={16} />
                            No Disponible
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        onClick={() => abrirModal(producto)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => eliminar(producto.id)}
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
        title={editando ? 'Editar Producto' : 'Nuevo Producto'}
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
            <label className="block text-sm font-semibold mb-2">Categoría *</label>
            <select
              required
              value={formData.categoria_id}
              onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })}
              className="input"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Precio *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.precio}
              onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">URL de Imagen</label>
            <input
              type="url"
              value={formData.imagen_url}
              onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
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