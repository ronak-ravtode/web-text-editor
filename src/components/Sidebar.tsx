import { useEditorStore } from '../store/editorStore'

export default function Sidebar() {
  const { activeView, setActiveView, createDocument, setActiveDocumentId } = useEditorStore()

  const handleNewDocument = () => {
    const id = createDocument('Untitled Document', '<h1>Untitled Document</h1>')
    setActiveDocumentId(id)
    setActiveView('editor')
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', view: 'dashboard' as const },
    { id: 'cms', label: 'CMS', icon: 'inventory_2', view: 'cms' as const },
    { id: 'documents', label: 'Documents', icon: 'description', view: 'editor' as const },
    { id: 'calendar', label: 'Calendar', icon: 'calendar_today', view: 'calendar' as const },
    { id: 'reporting', label: 'Reporting', icon: 'analytics', view: 'reporting' as const },
    { id: 'tasks', label: 'Tasks', icon: 'assignment', view: 'tasks' as const },
    { id: 'trash', label: 'Trash', icon: 'delete', view: 'trash' as const },
  ]

  const handleNavItemClick = (item: typeof navItems[number]) => {
    setActiveView(item.view)
    if (item.view === 'editor') {
      const store = useEditorStore.getState()
      if (!store.activeDocumentId && store.documents.length > 0) {
        store.setActiveDocumentId(store.documents[0].id)
      } else if (store.documents.length === 0) {
        handleNewDocument()
      }
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] border-r border-outline-variant bg-surface-elevated flex flex-col z-50 transition-all duration-300">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-outline-variant/50">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-on-primary shadow-sm">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            edit_square
          </span>
        </div>
        <div>
          <h1 className="font-display text-base font-bold text-on-surface leading-tight tracking-tight">
            ProEditor
          </h1>
          <p className="text-on-surface-variant text-[9px] uppercase tracking-[0.15em] font-semibold">
            Writing Workspace
          </p>
        </div>
      </div>

      {/* New Document Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={handleNewDocument}
          className="w-full bg-primary text-on-primary py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Document
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeView === item.view
          return (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer text-left text-sm ${
                isActive
                  ? 'sidebar-nav-active font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer Navigation */}
      <footer className="mt-auto border-t border-outline-variant/50 px-3 py-3 flex flex-col gap-0.5">
        <button
          onClick={() => setActiveView('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer text-left text-sm ${
            activeView === 'settings'
              ? 'sidebar-nav-active font-semibold'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Settings</span>
        </button>
      </footer>
    </aside>
  )
}
