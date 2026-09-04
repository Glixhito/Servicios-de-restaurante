import api from './api'

export const dashboardService = {
  obtenerResumen: () => api.get('/dashboard'),
}