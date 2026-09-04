import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCarritoStore = create(
  persist(
    (set, get) => ({
      items: [],

      agregarProducto: (producto, porcionSeleccionada = null, cantidad = 1) => {
        set(state => {
          const porcionId = porcionSeleccionada?.id || null;
          
          // 🛡️ Extracción limpia y segura de valores primitivos (números)
          const gramosVal = porcionSeleccionada?.gramos ? Number(porcionSeleccionada.gramos) : null;
          const precioVal = porcionSeleccionada?.precio ? Number(porcionSeleccionada.precio) : Number(producto?.precio) || 0;
          
          // ID único para diferenciar porciones del mismo plato (ej. 280g vs 400g)
          const cartItemId = porcionId ? `${producto.id}-${porcionId}` : producto.id;
          const itemsActuales = Array.isArray(state.items) ? state.items : [];

          const index = itemsActuales.findIndex(item => (item.cartItemId || item.id) === cartItemId);

          if (index > -1) {
            const nuevosItems = [...itemsActuales];
            nuevosItems[index].cantidad += Number(cantidad) || 1;
            return { items: nuevosItems };
          } else {
            const nuevoItem = {
              cartItemId,
              id: cartItemId, // Mantenemos id por compatibilidad
              producto_id: producto.id,
              producto_porcion_id: porcionId,
              nombre: producto.nombre || 'Plato',
              imagen_url: producto.imagen_url || '',
              precio: precioVal,
              gramos: gramosVal, // 👈 Número limpio, nunca un objeto
              cantidad: Number(cantidad) || 1,
            };
            return { items: [...itemsActuales, nuevoItem] };
          }
        });
      },

      actualizarCantidad: (cartItemId, cantidad) => {
        set(state => {
          const itemsActuales = Array.isArray(state.items) ? state.items : [];
          return {
            items: itemsActuales.map(item => {
              const currentId = item.cartItemId || item.id;
              if (currentId === cartItemId) {
                return { ...item, cantidad: Math.max(1, cantidad) };
              }
              return item;
            })
          };
        });
      },

      removerProducto: (cartItemId) => {
        set(state => {
          const itemsActuales = Array.isArray(state.items) ? state.items : [];
          return {
            items: itemsActuales.filter(item => (item.cartItemId || item.id) !== cartItemId)
          };
        });
      },

      limpiarCarrito: () => {
        set({ items: [] })
      },

      obtenerSubtotal: () => {
        const state = get();
        const itemsActuales = Array.isArray(state.items) ? state.items : [];
        return itemsActuales.reduce((sum, item) => {
          const precio = Number(item?.precio) || 0;
          const cantidad = Number(item?.cantidad) || 0;
          return sum + (precio * cantidad);
        }, 0);
      },

      obtenerCantidadTotal: () => {
        const state = get();
        const itemsActuales = Array.isArray(state.items) ? state.items : [];
        return itemsActuales.reduce((sum, item) => sum + (Number(item?.cantidad) || 0), 0);
      },
    }),
    {
      name: 'carrito-storage',
    }
  )
)