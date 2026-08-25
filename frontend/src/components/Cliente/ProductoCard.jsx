import { ShoppingCart } from 'lucide-react'

export default function ProductoCard({ producto, onAgregar }) {
  const imagenPorDefecto = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"

  return (
    <div className="card overflow-hidden flex flex-col justify-between border border-gray-100 group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        <img
          src={producto.imagen_url || imagenPorDefecto}
          alt={producto.nombre}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow">
          ${producto.precio.toLocaleString()}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-bold text-lg mb-1 text-gray-800 group-hover:text-red-600 transition">
            {producto.nombre}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {producto.descripcion || 'Delicioso plato preparado con ingredientes frescos.'}
          </p>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <span className="text-xl font-extrabold text-red-600">
            ${producto.precio.toLocaleString()}
          </span>
          <button
            onClick={onAgregar}
            disabled={!producto.disponible}
            className="btn btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <ShoppingCart size={18} />
            Agregar
          </button>
        </div>
        {!producto.disponible && (
          <p className="text-red-500 text-xs font-semibold mt-2 text-center bg-red-50 py-1 rounded">
            No disponible temporalmente
          </p>
        )}
      </div>
    </div>
  )
}