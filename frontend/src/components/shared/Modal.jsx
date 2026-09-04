import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
      <div className={`bg-[#1a1209] border border-[#3a2a18] rounded-3xl shadow-2xl p-6 ${sizes[size]} w-full mx-4 animate-fade-in`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-serif font-bold text-[#f5ead8]">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-[#9c8a6e] hover:text-[#e8621a] transition-colors duration-200"
            title="Cerrar"
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}