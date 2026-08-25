import { ShoppingCart } from 'lucide-react'

export default function ProductoCard({ producto, onAgregar }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
      {producto.imagen_url && (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{producto.nombre}</h3>
        <p className="text-gray-600 text-sm mb-4">{producto.descripcion}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-red-600">
            ${producto.precio.toLocaleString()}
          </span>
          <button
            onClick={onAgregar}
            disabled={!producto.disponible}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
        {!producto.disponible && (
          <p className="text-red-600 text-sm mt-2">No disponible</p>
        )}
      </div>
    </div>
  )
}