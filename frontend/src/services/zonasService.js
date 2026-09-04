import api from './api'

export const zonasService = {
  obtenerActivas: () => api.get('/zonas'),
  obtenerTodas: () => api.get('/zonas/admin'),
  obtenerPorId: (id) => api.get(`/zonas/${id}`),
  crear: (data) => api.post('/zonas', data),
  actualizar: (id, data) => api.put(`/zonas/${id}`, data),
  desactivar: (id) => api.delete(`/zonas/${id}`),
}