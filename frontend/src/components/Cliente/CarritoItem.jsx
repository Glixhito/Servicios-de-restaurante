import { Trash2, Plus, Minus } from 'lucide-react'

export default function CarritoItem({ item, onActualizarCantidad, onEliminar }) {
  return (
    <div className="card-body border-b flex justify-between items-center">
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{item.nombre}</h3>
        <p className="text-gray-600">${item.precio.toLocaleString()}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => onActualizarCantidad(item.id, item.cantidad - 1)}
            className="p-2 hover:bg-gray-100"
          >
            <Minus size={16} />
          </button>
          <span className="px-4 py-2 font-semibold">{item.cantidad}</span>
          <button
            onClick={() => onActualizarCantidad(item.id, item.cantidad + 1)}
            className="p-2 hover:bg-gray-100"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          onClick={() => onEliminar(item.id)}
          className="text-red-600 hover:text-red-800 p-2"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  )
}