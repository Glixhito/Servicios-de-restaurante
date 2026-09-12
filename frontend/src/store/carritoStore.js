import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCarritoStore = create(
  persist(
    (set, get) => ({
      items: [],

      // 🚀 ACTUALIZADO: Recibe adiciones como tercer parámetro
      agregarProducto: (producto, porcionSeleccionada = null, adiciones = [], cantidad = 1) => {
        set(state => {
          const porcionId = porcionSeleccionada?.id || null;
          
          // 🛡️ Extracción limpia y segura de valores
          const gramosVal = porcionSeleccionada?.gramos ? Number(porcionSeleccionada.gramos) : null;
          const precioBase = porcionSeleccionada?.precio ? Number(porcionSeleccionada.precio) : Number(producto?.precio) || 0;
          
          // 🧀 Calcular el precio extra de las adiciones
          const adicionesSeguras = Array.isArray(adiciones) ? adiciones : [];
          const precioAdiciones = adicionesSeguras.reduce((sum, ad) => sum + (Number(ad.precio) || 0), 0);
          
          const precioFinalUnitario = precioBase + precioAdiciones;
          
          // 🆔 Crear un string con los IDs de las adiciones para diferenciarlas
          const idsAdiciones = adicionesSeguras.length > 0 
            ? adicionesSeguras.map(a => a.id).sort().join('-') 
            : 'sin-adiciones';

          // ID único para el carrito (Plato + Porción + Adiciones)
          const cartItemId = porcionId 
            ? `${producto.id}-${porcionId}-${idsAdiciones}` 
            : `${producto.id}-${idsAdiciones}`;

          const itemsActuales = Array.isArray(state.items) ? state.items : [];
          const index = itemsActuales.findIndex(item => (item.cartItemId || item.id) === cartItemId);

          if (index > -1) {
            // Si es exactamente el mismo plato con los mismos toppings, sumamos la cantidad
            const nuevosItems = [...itemsActuales];
            nuevosItems[index].cantidad += Number(cantidad) || 1;
            return { items: nuevosItems };
          } else {
            // Si es nuevo (o tiene toppings diferentes), lo agregamos como item nuevo
            const nuevoItem = {
              cartItemId,
              id: cartItemId, // Mantenemos id por compatibilidad
              producto_id: producto.id,
              producto_porcion_id: porcionId,
              nombre: producto.nombre || 'Plato',
              imagen_url: producto.imagen_url || '',
              precio: precioFinalUnitario, // Precio total unitario (Plato + Toppings)
              gramos: gramosVal,
              adiciones: adicionesSeguras, // 👈 Guardamos las adiciones para mostrarlas en CarritoPage
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