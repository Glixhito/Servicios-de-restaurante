import { MapPin, Navigation, CheckCircle2 } from 'lucide-react'

export default function ZonasPage() {
  return (
    <div className="space-y-6 text-[#f5ead8] animate-fade-in pb-12 max-w-2xl mx-auto">
      
      {/* HEADER */}
      <div className="bg-[#231a0d] border border-[#3a2a18] p-8 rounded-3xl shadow-sm text-center space-y-3">
        <div className="w-16 h-16 bg-[#e8621a]/10 border border-[#e8621a]/30 rounded-2xl flex items-center justify-center mx-auto text-[#e8621a]">
          <MapPin size={34} />
        </div>
        <h1 className="text-3xl font-serif font-bold text-[#f5ead8]">
          Gestión de Domicilios en Casa
        </h1>
        <p className="text-sm text-[#9c8a6e] max-w-md mx-auto">
          El sistema de zonas fijas ha sido desactivado. Ahora los domicilios son flexibles y se gestionan directamente en la entrega.
        </p>
      </div>

      {/* TARJETA INFORMATIVA */}
      <div className="bg-[#231a0d] border border-[#3a2a18] rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
        <h2 className="font-serif font-bold text-base text-[#f0a030] flex items-center gap-2">
          <Navigation size={20} className="text-[#e8621a]" /> ¿Cómo funciona el nuevo modelo?
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3.5 bg-[#1a1209] border border-[#3a2a18] p-4 rounded-2xl">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#f5ead8]">Libertad para el cliente</p>
              <p className="text-xs text-[#9c8a6e] mt-0.5 leading-relaxed">
                El cliente escribe su dirección exacta y referencias en el checkout sin depender de tarifas preestablecidas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 bg-[#1a1209] border border-[#3a2a18] p-4 rounded-2xl">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#f5ead8]">Cobro directo en la puerta</p>
              <p className="text-xs text-[#9c8a6e] mt-0.5 leading-relaxed">
                El repartidor evalúa la distancia o carga al llegar al destino y cobra el valor justo del envío en efectivo al cliente.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 bg-[#1a1209] border border-[#3a2a18] p-4 rounded-2xl">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#f5ead8]">Cuentas claras para el restaurante</p>
              <p className="text-xs text-[#9c8a6e] mt-0.5 leading-relaxed">
                El panel de administración muestra limpiamente el subtotal de los productos, evitando confusiones con tarifas fijas online.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}