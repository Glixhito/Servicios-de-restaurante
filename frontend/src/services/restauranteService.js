import api from './api'

export const restauranteService = {
  obtenerTodos: () => api.get('/restaurante'),
  obtenerPorId: (id) => api.get(`/restaurante/${id}`),
  actualizar: (id, data) => api.put(`/restaurante/${id}`, data),
  pausarRecepcion: (id) => api.put(`/restaurante/${id}/pausar-recepcion`),
}