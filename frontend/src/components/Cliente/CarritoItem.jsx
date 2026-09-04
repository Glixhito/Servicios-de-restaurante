import { Trash2, Plus, Minus, Utensils } from 'lucide-react'

export default function CarritoItem({ item, onActualizarCantidad, onEliminar }) {
  
  // 🛡️ Formateo seguro para evitar errores con precios o decimales
  const formatearPrecio = (precio) => {
    const valorSeguro = Number(precio) || 0;
    const precioRedondeado = Math.round(valorSeguro);
    return new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(precioRedondeado);
  }

  // Identificador único para diferenciar porciones del mismo plato (ej. 280g vs 400g)
  const uniqueId = item.cartItemId || item.id;

  return (
    <div className="bg-[#231a0d] border border-[#3a2a18] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-[#e8621a]/30 shadow-sm">
      
      {/* INFORMACIÓN DEL PRODUCTO */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {item.imagen_url && (
          <img
            src={item.imagen_url}
            alt={item.nombre}
            className="w-16 h-16 rounded-xl object-cover border border-[#3a2a18] shrink-0"
          />
        )}
        <div className="min-w-0">
          <h3 className="font-serif font-bold text-base text-[#f5ead8] leading-tight truncate">{item.nombre}</h3>
          
          {/* 🥩 Mostrar gramaje si el plato es un corte de carne con porción */}
          {item.gramos && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#f0a030] bg-[#f0a030]/10 px-2 py-0.5 rounded-md mt-1 border border-[#f0a030]/20">
              <Utensils size={12} />
              {item.gramos} gramos
            </span>
          )}

          <p className="text-sm font-bold text-[#f0a030] mt-1">
            {formatearPrecio(item.precio * item.cantidad)}
          </p>
        </div>
      </div>

      {/* CONTROLES DE CANTIDAD Y ELIMINAR */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
        <div className="flex items-center bg-[#1a1209] border border-[#3a2a18] rounded-xl overflow-hidden shadow-inner">
          <button
            onClick={() => onActualizarCantidad(uniqueId, item.cantidad - 1)}
            className="p-2.5 text-[#9c8a6e] hover:text-[#e8621a] hover:bg-[#2e2010] transition"
            title="Reducir cantidad"
          >
            <Minus size={16} />
          </button>
          
          <span className="px-4 py-1 text-sm font-bold text-[#f5ead8]">{item.cantidad}</span>
          
          <button
            onClick={() => onActualizarCantidad(uniqueId, item.cantidad + 1)}
            className="p-2.5 text-[#9c8a6e] hover:text-[#e8621a] hover:bg-[#2e2010] transition"
            title="Aumentar cantidad"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={() => onEliminar(uniqueId)}
          className="text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white p-2.5 rounded-xl transition-all border border-red-500/20"
          title="Eliminar producto"
        >
          <Trash2 size={18} />
        </button>
      </div>

    </div>
  )
}