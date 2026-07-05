import { useEditorStore } from '../store/editorStore'

export default function FoldersView() {
  const { documents, setActiveDocumentId, setActiveView, showToast } = useEditorStore()

  const activeDocs = documents.filter(d => !d.deleted)
  const folders = [...new Set(activeDocs.map(d => d.folder).filter(Boolean))]

  const folderData = folders.map(name => ({
    name,
    count: activeDocs.filter(d => d.folder === name).length,
    words: activeDocs.filter(d => d.folder === name).reduce((s, d) => s + d.wordCount, 0),
  }))

  const handleOpenFolder = (folderName: string | undefined) => {
    const doc = activeDocs.find(d => d.folder === folderName)
    if (doc) {
      setActiveDocumentId(doc.id)
      setActiveView('editor')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">Folders</h2>
            <p className="text-sm text-on-surface-variant mt-1">Organize your documents by category</p>
          </div>
          <button
            onClick={() => showToast('Create a document and assign it to a folder', 'info')}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant/60 text-on-surface rounded-lg text-sm font-medium hover:bg-surface-container-low transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">create_new_folder</span>
            New Folder
          </button>
        </div>

        {/* Folder grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folderData.map(folder => (
            <div
              key={folder.name}
              onClick={() => handleOpenFolder(folder.name)}
              className="bg-surface-elevated border border-outline-variant/40 rounded-xl p-5 cursor-pointer hover:shadow-elevated hover:border-secondary/20 hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <span className="material-symbols-outlined text-[24px] text-secondary">folder</span>
              </div>
              <h4 className="font-semibold text-on-surface text-sm group-hover:text-secondary transition-colors">{folder.name}</h4>
              <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
                <span>{folder.count} docs</span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span>{folder.words.toLocaleString()} words</span>
              </div>
            </div>
          ))}

          {/* Uncategorized */}
          {activeDocs.filter(d => !d.folder).length > 0 && (
            <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl p-5 cursor-pointer hover:shadow-elevated hover:border-warning/20 hover:-translate-y-0.5 transition-all duration-200 group">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4 group-hover:bg-warning/20 transition-colors">
                <span className="material-symbols-outlined text-[24px] text-warning">folder_off</span>
              </div>
              <h4 className="font-semibold text-on-surface text-sm group-hover:text-warning transition-colors">Uncategorized</h4>
              <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
                <span>{activeDocs.filter(d => !d.folder).length} docs</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
