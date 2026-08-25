import { Outlet } from 'react-router-dom'

export default function ClienteLayout() {
  return (
    <div className="bg-[#1a1209] min-h-screen text-[#f5ead8] font-sans selection:bg-[#e8621a] selection:text-white">
      {/* Contenedor principal que abarca toda la experiencia del asadero */}
      <main className="w-full min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}