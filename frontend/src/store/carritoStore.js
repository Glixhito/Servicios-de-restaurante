import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCarritoStore = create(
  persist(
    (set, get) => ({
      items: [],

      agregarProducto: (producto, cantidad = 1) => {
        const items = get().items
        const existe = items.find(item => item.id === producto.id)

        if (existe) {
          existe.cantidad += cantidad
        } else {
          items.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen_url: producto.imagen_url,
            cantidad,
          })
        }

        set({ items: [...items] })
      },

      actualizarCantidad: (productoId, cantidad) => {
        const items = get().items
        const item = items.find(i => i.id === productoId)
        if (item) {
          item.cantidad = Math.max(1, cantidad)
          set({ items: [...items] })
        }
      },

      removerProducto: (productoId) => {
        const items = get().items.filter(item => item.id !== productoId)
        set({ items })
      },

      limpiarCarrito: () => {
        set({ items: [] })
      },

      obtenerSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
      },

      obtenerCantidadTotal: () => {
        return get().items.reduce((sum, item) => sum + item.cantidad, 0)
      },
    }),
    {
      name: 'carrito-storage',
    }
  )
)