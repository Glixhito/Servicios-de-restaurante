import api from './api'

export const productosService = {
  obtenerMenu: () => api.get('/productos/menu'),
  obtenerPorCategoria: (categoriaId) =>
    api.get(`/productos/categoria/${categoriaId}`),
  obtenerTodos: () => api.get('/productos/admin'),
  obtenerPorId: (id) => api.get(`/productos/${id}`),
  crear: (data) => api.post('/productos', data),
  actualizar: (id, data) => api.put(`/productos/${id}`, data),
  toggleDisponibilidad: (id) => api.put(`/productos/${id}/disponibilidad`),
  eliminar: (id) => api.delete(`/productos/${id}`),
}