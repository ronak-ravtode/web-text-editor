import { useEditorStore } from '../store/editorStore'

export default function CMSView() {
  const { documents, setActiveDocumentId, setActiveView, deleteDocument, searchQuery, showToast } = useEditorStore()

  const activeDocs = documents.filter(d => !d.deleted)
  const filteredDocs = activeDocs.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenDoc = (id: string) => {
    setActiveDocumentId(id)
    setActiveView('editor')
  }

  const handleDuplicate = (id: string) => {
    const doc = documents.find(d => d.id === id)
    if (doc) {
      const store = useEditorStore.getState()
      store.createDocument(`${doc.title} (Copy)`, doc.content)
      showToast('Document duplicated', 'success')
    }
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
            <h2 className="font-display text-2xl font-bold text-on-surface">Content Management</h2>
            <p className="text-sm text-on-surface-variant mt-1">Manage and organize all your documents</p>
          </div>
          <button
            onClick={() => {
              const store = useEditorStore.getState()
              store.createDocument('New Page', '<h1>New Page</h1>')
              showToast('New page created', 'success')
            }}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary/90 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Page
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Documents', value: activeDocs.length, icon: 'description', color: 'bg-secondary/10 text-secondary' },
            { label: 'Shared Documents', value: activeDocs.filter(d => d.shared).length, icon: 'group', color: 'bg-success/10 text-success' },
            { label: 'Total Words', value: activeDocs.reduce((s, d) => s + d.wordCount, 0).toLocaleString(), icon: 'text_fields', color: 'bg-warning/10 text-warning' },
            { label: 'Folders', value: new Set(activeDocs.map(d => d.folder).filter(Boolean)).size, icon: 'folder', color: 'bg-accent/10 text-accent' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-elevated border border-outline-variant/40 rounded-xl p-4 flex items-center gap-4 shadow-card">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xl font-bold text-on-surface">{stat.value}</p>
                <p className="text-xs text-on-surface-variant">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Documents table */}
        <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl overflow-hidden shadow-card">
          <div className="px-5 py-4 border-b border-outline-variant/40 flex items-center justify-between">
            <h3 className="font-semibold text-on-surface text-sm">All Documents</h3>
            <span className="text-xs text-on-surface-variant">{filteredDocs.length} documents</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30 text-left">
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Document</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Folder</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Words</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Last Saved</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-b border-outline-variant/20 hover:bg-surface-container-low/50 transition-colors cursor-pointer group"
                  onClick={() => handleOpenDoc(doc.id)}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-[16px]">description</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-on-surface group-hover:text-secondary transition-colors">{doc.title}</p>
                        {doc.shared && (
                          <span className="text-[10px] text-success font-medium">Shared</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md">{doc.folder || 'Uncategorized'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-on-surface-variant">{doc.wordCount.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-xs text-on-surface-variant">{formatLastSaved(doc.lastSaved)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDuplicate(doc.id) }}
                        className="p-1.5 rounded-md hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                        title="Duplicate"
                      >
                        <span className="material-symbols-outlined text-[16px]">content_copy</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenDoc(doc.id) }}
                        className="p-1.5 rounded-md hover:bg-secondary/10 text-secondary transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteDocument(doc.id)
                          showToast('Document moved to trash', 'info')
                        }}
                        className="p-1.5 rounded-md hover:bg-error/10 text-error transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-on-surface-variant text-sm">
                    No documents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
