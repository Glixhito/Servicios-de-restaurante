export function generarNumeroAleatorio(): number {
  return Math.floor(Math.random() * 1000000);
}

export function formatearFecha(fecha: Date): string {
  return fecha.toLocaleDateString('es-CO');
}

export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validarTelefono(telefono: string): boolean {
  const regex = /^\d{10}$/;
  return regex.test(telefono.replace(/\D/g, ''));
}

export function calcularSubtotal(cantidad: number, precio: number): number {
  return cantidad * precio;
}