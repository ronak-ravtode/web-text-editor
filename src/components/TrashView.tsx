import { useEditorStore } from '../store/editorStore'

export default function TrashView() {
  const { documents, restoreDocument, showToast } = useEditorStore()

  const deletedDocs = documents.filter(d => d.deleted)

  const handleRestore = (id: string, title: string) => {
    restoreDocument(id)
    showToast(`"${title}" restored`, 'success')
  }

  const handlePermanentDelete = (id: string, title: string) => {
    const store = useEditorStore.getState()
    const updatedDocs = store.documents.filter(d => d.id !== id)
    localStorage.setItem('proeditor-documents', JSON.stringify(updatedDocs))
    useEditorStore.setState({ documents: updatedDocs })
    showToast(`"${title}" permanently deleted`, 'info')
  }

  const formatLastSaved = (timestamp: number) => {
    const diff = Date.now() - timestamp
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">Trash</h2>
            <p className="text-sm text-on-surface-variant mt-1">
              {deletedDocs.length} document{deletedDocs.length !== 1 ? 's' : ''} in trash
            </p>
          </div>
          {deletedDocs.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Permanently delete all documents in trash?')) {
                  const store = useEditorStore.getState()
                  const remaining = store.documents.filter(d => !d.deleted)
                  localStorage.setItem('proeditor-documents', JSON.stringify(remaining))
                  useEditorStore.setState({ documents: remaining })
                  showToast('Trash emptied', 'info')
                }
              }}
              className="flex items-center gap-2 px-4 py-2 border border-error/30 text-error rounded-lg text-sm font-medium hover:bg-error/5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">delete_forever</span>
              Empty Trash
            </button>
          )}
        </div>

        {/* Deleted documents */}
        {deletedDocs.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant/20 block mb-4">delete_sweep</span>
            <p className="text-on-surface-variant font-medium">Trash is empty</p>
            <p className="text-sm text-on-surface-variant/60 mt-1">Deleted documents will appear here</p>
          </div>
        ) : (
          <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl overflow-hidden shadow-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/30 text-left">
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Document</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Words</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Deleted</th>
                  <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedDocs.map(doc => (
                  <tr key={doc.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant/50">
                          <span className="material-symbols-outlined text-[16px]">description</span>
                        </div>
                        <span className="text-sm text-on-surface-variant">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-on-surface-variant">{doc.wordCount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-xs text-on-surface-variant">{formatLastSaved(doc.lastSaved)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleRestore(doc.id, doc.title)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/10 rounded-md transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">restore</span>
                          Restore
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Permanently delete "${doc.title}"?`)) {
                              handlePermanentDelete(doc.id, doc.title)
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-error hover:bg-error/10 rounded-md transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete_forever</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
