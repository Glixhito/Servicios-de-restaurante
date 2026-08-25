import api from './api'

export const categoriasService = {
  obtenerParaCliente: () => api.get('/categorias/cliente'),
  obtenerTodas: () => api.get('/categorias/admin'),
  obtenerPorId: (id) => api.get(`/categorias/${id}`),
  crear: (data) => api.post('/categorias', data),
  actualizar: (id, data) => api.put(`/categorias/${id}`, data),
  desactivar: (id) => api.put(`/categorias/${id}/desactivar`),
  eliminar: (id) => api.delete(`/categorias/${id}`),
}