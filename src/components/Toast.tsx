import { useEditorStore } from '../store/editorStore'

export default function ToastContainer() {
  const { toasts, removeToast } = useEditorStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? 'check_circle' :
          toast.type === 'error' ? 'error' : 'info'
        const bg =
          toast.type === 'success' ? 'bg-success text-on-success' :
          toast.type === 'error' ? 'bg-error text-on-error' :
          'bg-primary text-on-primary'

        return (
          <div
            key={toast.id}
            className={`toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${bg}`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
            {toast.message}
          </div>
        )
      })}
    </div>
  )
}
