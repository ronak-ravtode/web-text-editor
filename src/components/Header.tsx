import { type Editor } from '@tiptap/react'
import TemplateSelector from './TemplateSelector'
import ExportButton from './ExportButton'
import { useEditorStore } from '../store/editorStore'

interface HeaderProps {
  editor: Editor | null
}

export default function Header({ editor }: HeaderProps) {
  const {
    activeView,
    activeDocumentId,
    documents,
    updateDocument,
    searchQuery,
    setSearchQuery,
  } = useEditorStore()

  const activeDoc = documents.find(doc => doc.id === activeDocumentId)

  return (
    <header
      className="fixed top-0 right-0 left-[260px] h-14 bg-surface-elevated/80 backdrop-blur-xl border-b border-outline-variant/60 flex justify-between items-center z-40 px-6 transition-all"
      style={{ width: 'calc(100% - 260px)' }}
    >
      {/* Left side: Context-aware title or search */}
      <div className="flex items-center gap-6 flex-1 min-w-0">
        {activeView === 'dashboard' ? (
          <div className="relative group shrink-0">
            <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant group-focus-within:text-secondary transition-colors pointer-events-none">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant/60 rounded-lg w-56 focus:w-72 transition-all focus:ring-2 focus:ring-secondary/15 focus:border-secondary/40 outline-none text-sm text-on-surface placeholder:text-on-surface-variant/50"
              placeholder="Search documents..."
            />
          </div>
        ) : activeView === 'editor' ? (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <input
              type="text"
              value={activeDoc?.title || ''}
              onChange={(e) => activeDoc && updateDocument(activeDoc.id, { title: e.target.value })}
              className="font-display text-lg font-bold text-on-surface bg-transparent border-none outline-none focus:ring-0 w-72 truncate hover:bg-surface-container-low rounded px-2 py-1 transition-colors"
              placeholder="Untitled Document"
            />
          </div>
        ) : (
          <h2 className="font-display text-lg font-bold text-on-surface capitalize">{activeView}</h2>
        )}

      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        {activeView === 'editor' && editor && (
          <div className="flex items-center gap-2">
            <TemplateSelector editor={editor} />
            <ExportButton editor={editor} />
          </div>
        )}
      </div>
    </header>
  )
}
