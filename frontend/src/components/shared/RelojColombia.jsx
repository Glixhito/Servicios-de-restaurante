import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function RelojColombia() {
  const [horaActual, setHoraActual] = useState('');

  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date();
      const horaFormateada = ahora.toLocaleTimeString('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setHoraActual(horaFormateada);
    };

    actualizarReloj(); // Ejecutar de inmediato al cargar
    const intervalo = setInterval(actualizarReloj, 1000); // Actualizar cada segundo

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="flex items-center gap-2.5 bg-[#1a1209] border border-[#3a2a18] px-4 py-2 rounded-xl text-[#f5ead8] shadow-inner text-sm font-mono">
      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
      <Clock size={16} className="text-[#e8621a]" />
      <span className="text-xs text-[#9c8a6e] uppercase tracking-wider font-sans font-semibold">Colombia:</span>
      <strong className="text-[#f0a030]">{horaActual}</strong>
    </div>
  );
}