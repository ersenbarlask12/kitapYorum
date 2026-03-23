import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
}

const COLORS = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
}

const ICON_COLORS = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-amber-500',
}

let toastIdCounter = 0
let globalSetToasts = null

export function useToast() {
  function toast(message, type = 'success', duration = 4000) {
    if (!globalSetToasts) return
    const id = ++toastIdCounter
    globalSetToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      globalSetToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }

  return {
    showToast: (msg, type) => toast(msg, type),
    success: (msg) => toast(msg, 'success'),
    error: (msg) => toast(msg, 'error'),
    warning: (msg) => toast(msg, 'warning'),
  }
}

export function ToastProvider() {
  const [toasts, setToasts] = useState([])
  globalSetToasts = setToasts

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] ?? CheckCircle
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-up pointer-events-auto ${COLORS[toast.type]}`}
          >
            <Icon className={`flex-shrink-0 mt-0.5 ${ICON_COLORS[toast.type]}`} size={18} />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
