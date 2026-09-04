import api from './api'

export const pedidosService = {
  crear: (data) => api.post('/pedidos', data),
  obtenerPorNumero: (numeroPedido) => api.get(`/pedidos/${numeroPedido}`),
  obtenerTodos: (estado) => {
    const url = '/pedidos/admin/lista'
    return estado ? api.get(`${url}?estado=${estado}`) : api.get(url)
  },
  obtenerPorId: (id) => api.get(`/pedidos/admin/${id}`),
  cambiarEstado: (id, data) => api.patch(`/pedidos/admin/${id}/estado`, data),
  rechazar: (id, data) => api.post(`/pedidos/admin/${id}/rechazar`, data),
  confirmarPagoEfectivo: (id) =>
    api.post(`/pedidos/admin/${id}/confirmar-pago-efectivo`),
}