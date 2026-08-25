import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { productosService } from '../../services/productosService'
import { categoriasService } from '../../services/categoriasService'
import { useCarritoStore } from '../../store/carritoStore'
import Loading from '../../components/shared/Loading'
import { ShoppingBag, Flame, Plus, Minus, X, ChevronRight } from 'lucide-react'

// Conexión en tiempo real con el backend (puerto 4000)
const socket = io('http://localhost:4000')

export default function MenuPage() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [categoriaActual, setCategoriaActual] = useState('todos')
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalQty, setModalQty] = useState(1)

  const { agregarProducto, obtenerCantidadTotal, obtenerSubtotal } = useCarritoStore()

  useEffect(() => {
    cargarDatos()

    // ESCUCHAR CAMBIOS EN TIEMPO REAL DESDE EL ADMIN
    socket.on('menu_actualizado', () => {
      console.log('⚡ ¡Actualización detectada en el menú!')
      cargarDatos() // Refresca los platos y categorías automáticamente
    })

    // Limpiar el evento al desmontar el componente
    return () => {
      socket.off('menu_actualizado')
    }
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [catRes, prodRes] = await Promise.all([
        categoriasService.obtenerParaCliente(),
        productosService.obtenerMenu(),
      ])
      setCategorias(catRes.data)
      setProductos(prodRes.data)
    } catch (error) {
      console.error('Error cargando menú:', error)
    } finally {
      setLoading(false)
    }
  }

  const productosFiltrados = categoriaActual === 'todos'
    ? productos
    : productos.filter(p => p.categoria_id === categoriaActual)

  const openDetail = (item) => {
    setSelectedItem(item)
    setModalQty(1)
  }

  const closeDetail = () => {
    setSelectedItem(null)
    setModalQty(1)
  }

  const addFromModal = () => {
    if (selectedItem) {
      agregarProducto(selectedItem, modalQty)
      closeDetail()
    }
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-[#1a1209] text-[#f5ead8] font-sans relative pb-28">
      
      {/* HEADER ADAPTATIVO */}
      <div className="sticky top-0 z-30 bg-[#1a1209]/95 backdrop-blur border-b border-[#3a2a18] px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div>
          <span className="text-xs text-[#f0a030] uppercase tracking-widest font-bold">Asadero Parrilla</span>
          <h1 className="text-2xl font-serif text-[#f5ead8]">Punto de Encuentro</h1>
        </div>
        <a href="/carrito" className="relative bg-[#231a0d] border border-[#3a2a18] p-3 rounded-full text-[#f0a030] hover:bg-[#2e2010] transition flex items-center gap-2">
          <ShoppingBag size={20} />
          <span className="hidden md:inline text-xs font-bold">Carrito</span>
          {obtenerCantidadTotal() > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#e8621a] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {obtenerCantidadTotal()}
            </span>
          )}
        </a>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* HERO BANNER ADAPTATIVO */}
        <div className="relative rounded-3xl overflow-hidden border border-[#3a2a18] bg-[#231a0d] h-56 md:h-72 shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=600&fit=crop&auto=format" 
            alt="Parrilla" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1209] via-transparent to-transparent flex flex-col justify-end p-6 md:p-10">
            <span className="bg-[#e8621a] text-white text-xs font-bold px-3 py-1 rounded-full w-fit uppercase tracking-wider mb-2 flex items-center gap-1.5 shadow">
              <Flame size={14} /> Fuego en Vivo
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-[#f5ead8] font-extrabold">Cortes al Carbón</h2>
            <p className="text-sm md:text-base text-[#9c8a6e] mt-1">El verdadero sabor artesanal en tu mesa.</p>
          </div>
        </div>

        {/* TABS DE CATEGORÍAS */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setCategoriaActual('todos')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition border shadow-sm ${
              categoriaActual === 'todos'
                ? 'bg-[#e8621a] text-white border-[#e8621a]'
                : 'bg-[#231a0d] text-[#9c8a6e] border-[#3a2a18] hover:text-[#f5ead8]'
            }`}
          >
            Todo el Menú
          </button>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActual(cat.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition border shadow-sm ${
                categoriaActual === cat.id
                  ? 'bg-[#e8621a] text-white border-[#e8621a]'
                  : 'bg-[#231a0d] text-[#9c8a6e] border-[#3a2a18] hover:text-[#f5ead8]'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        {/* CUADRÍCULA ADAPTATIVA DE PLATOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map(producto => (
            <div 
              key={producto.id}
              onClick={() => openDetail(producto)}
              className="bg-[#231a0d] border border-[#3a2a18] rounded-3xl overflow-hidden cursor-pointer hover:border-[#e8621a]/60 transition group flex flex-col justify-between shadow-lg"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={producto.imagen_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&h=500&fit=crop&auto=format"}
                  alt={producto.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <span className="absolute top-3 right-3 bg-[#1a1209]/95 text-[#f0a030] font-bold text-xs px-3 py-1.5 rounded-full border border-[#3a2a18] shadow">
                  ${producto.precio.toLocaleString()}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#f5ead8] group-hover:text-[#e8621a] transition">{producto.nombre}</h3>
                  <p className="text-xs text-[#9c8a6e] line-clamp-2 mt-1 leading-relaxed">{producto.descripcion || 'Especialidad de la casa al carbón.'}</p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-[#3a2a18]">
                  <span className="font-bold text-base text-[#f0a030]">${producto.precio.toLocaleString()}</span>
                  <span className="bg-[#2e2010] text-[#f5ead8] p-2 rounded-xl text-xs group-hover:bg-[#e8621a] transition flex items-center gap-1 font-semibold">
                    <Plus size={16} /> Agregar
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BARRA FLOTANTE INFERIOR DEL CARRITO */}
      {obtenerCantidadTotal() > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto z-40">
          <a href="/carrito" className="bg-[#e8621a] text-white p-4 rounded-2xl shadow-2xl flex justify-between items-center border border-orange-500 hover:bg-orange-600 transition">
            <div className="flex items-center gap-3">
              <span className="bg-orange-700 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                {obtenerCantidadTotal()}
              </span>
              <span className="font-serif font-bold text-sm">Ver Carrito</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">${obtenerSubtotal().toLocaleString()}</span>
              <ChevronRight size={18} />
            </div>
          </a>
        </div>
      )}

      {/* MODAL DE DETALLE DEL PLATO */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#231a0d] border border-[#3a2a18] w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative animate-fadeIn">
            <button onClick={closeDetail} className="absolute top-4 right-4 bg-[#2e2010] p-2.5 rounded-full text-[#9c8a6e] hover:text-white transition">
              <X size={20} />
            </button>

            <img
              src={selectedItem.imagen_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=700&h=500&fit=crop&auto=format"}
              alt={selectedItem.nombre}
              className="w-full h-56 md:h-64 rounded-2xl object-cover border border-[#3a2a18]"
            />

            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-[#f5ead8]">{selectedItem.nombre}</h2>
              <p className="text-xs md:text-sm text-[#9c8a6e] leading-relaxed mt-2">{selectedItem.descripcion || 'Preparado al carbón con los mejores cortes y sazón artesanal.'}</p>
            </div>

            <div className="flex justify-between items-center border-t border-b border-[#3a2a18] py-4">
              <span className="text-xs text-[#9c8a6e]">Precio unitario</span>
              <span className="text-xl font-bold text-[#f0a030]">${selectedItem.precio.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-[#f5ead8]">Cantidad</span>
              <div className="flex items-center gap-4 bg-[#1a1209] border border-[#3a2a18] px-4 py-2 rounded-xl">
                <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} className="text-[#9c8a6e] hover:text-white">
                  <Minus size={18} />
                </button>
                <span className="font-bold text-base w-6 text-center">{modalQty}</span>
                <button onClick={() => setModalQty(modalQty + 1)} className="text-[#9c8a6e] hover:text-white">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={addFromModal}
              className="w-full bg-[#e8621a] hover:bg-orange-600 text-white font-serif font-bold py-4 rounded-2xl shadow-xl transition flex justify-between px-6 text-base"
            >
              <span>Agregar al Pedido</span>
              <span>${(selectedItem.precio * modalQty).toLocaleString()}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}