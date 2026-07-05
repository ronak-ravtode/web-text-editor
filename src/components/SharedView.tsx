import { useEditorStore } from '../store/editorStore'

const COLLABORATORS = [
  { name: 'Alex Thompson', avatar: 'AT', color: 'from-blue-500 to-blue-600' },
  { name: 'Sarah Lee', avatar: 'SL', color: 'from-purple-500 to-purple-600' },
  { name: 'James Chen', avatar: 'JC', color: 'from-emerald-500 to-emerald-600' },
]

export default function SharedView() {
  const { documents, setActiveDocumentId, setActiveView, showToast } = useEditorStore()

  const sharedDocs = documents.filter(d => !d.deleted && d.shared)

  const handleOpenDoc = (id: string) => {
    setActiveDocumentId(id)
    setActiveView('editor')
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
            <h2 className="font-display text-2xl font-bold text-on-surface">Shared with Me</h2>
            <p className="text-sm text-on-surface-variant mt-1">Documents shared by your team</p>
          </div>
          <button
            onClick={() => showToast('Share link copied to clipboard', 'success')}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant/60 text-on-surface rounded-lg text-sm font-medium hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            Get Share Link
          </button>
        </div>

        {/* Collaborators */}
        <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl p-5 mb-8 shadow-card">
          <h3 className="text-sm font-semibold text-on-surface mb-4">Active Collaborators</h3>
          <div className="flex gap-4">
            {COLLABORATORS.map((collab, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${collab.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                  {collab.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium text-on-surface">{collab.name}</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    <span className="text-[10px] text-on-surface-variant">Online</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shared documents */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sharedDocs.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 block mb-3">group</span>
              <p className="text-sm text-on-surface-variant">No shared documents yet</p>
            </div>
          ) : (
            sharedDocs.map(doc => (
              <div
                key={doc.id}
                onClick={() => handleOpenDoc(doc.id)}
                className="bg-surface-elevated border border-outline-variant/40 rounded-xl p-4 cursor-pointer hover:shadow-elevated hover:border-secondary/20 transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px] text-secondary">description</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-on-surface truncate group-hover:text-secondary transition-colors">{doc.title}</h4>
                    <p className="text-[11px] text-on-surface-variant">Edited {formatLastSaved(doc.lastSaved)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {COLLABORATORS.slice(0, 2).map((c, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${c.color} border-2 border-surface-elevated flex items-center justify-center text-white text-[8px] font-bold`}>
                        {c.avatar}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-mono">{doc.wordCount} words</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
