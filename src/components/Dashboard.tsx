import { useEditorStore } from '../store/editorStore'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const { 
    documents, 
    setActiveDocumentId, 
    setActiveView,
    deleteDocument,
    searchQuery 
  } = useEditorStore()

  // Filter documents by search query
  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenDoc = (id: string) => {
    setActiveDocumentId(id)
    setActiveView('editor')
  }

  const handleCreateNew = () => {
    const store = useEditorStore.getState()
    const id = store.createDocument('Untitled Document', '<h1>Untitled Document</h1>')
    setActiveDocumentId(id)
    setActiveView('editor')
  }

  // Calculate stats
  const totalWords = documents.reduce((sum, doc) => sum + doc.wordCount, 0)
  // Base daily word count + total count in current session docs
  const wordsWrittenToday = 2481 + totalWords

  const formatLastSaved = (timestamp: number) => {
    const diff = Date.now() - timestamp
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main Scrollable Canvas */}
      <section className="flex-1 overflow-y-auto no-scrollbar p-10 bg-surface-bright">
        <div className="max-w-canvas-max-width mx-auto">
          {/* Welcome Header */}
          <header className="mb-10">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
              Welcome back, Editor.
            </h2>
            <p className="text-on-surface-variant font-body-md">
              Pick up where you left off or start something new.
            </p>
          </header>

          {/* Stats Overview (Bento Style) */}
          <div className="grid grid-cols-12 gap-4 mb-10">
            {/* Chart Bento Box */}
            <div className="col-span-8 p-6 bg-surface-container-lowest border border-outline-variant rounded-xl editor-canvas-shadow flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">
                  Writing Productivity
                </h3>
                <span className="text-secondary font-semibold text-label-md">
                  +12% this week
                </span>
              </div>
              
              {/* Productivity Chart */}
              <div className="flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { day: 'Mon', words: 1240 },
                    { day: 'Tue', words: 2100 },
                    { day: 'Wed', words: 800 },
                    { day: 'Thu', words: 3200 },
                    { day: 'Fri', words: 1800 },
                    { day: 'Sat', words: 2650 },
                    { day: 'Sun', words: 1900 },
                  ]} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" strokeOpacity={0.3} vertical={false} />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--color-outline)', fontFamily: 'monospace' }}
                      style={{ textTransform: 'uppercase' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'var(--color-outline)', fontFamily: 'monospace' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--color-surface-elevated)',
                        border: '1px solid var(--color-outline-variant)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      labelStyle={{ color: 'var(--color-on-surface)', fontWeight: 600 }}
                      itemStyle={{ color: 'var(--color-on-surface-variant)' }}
                      formatter={(value) => [`${Number(value).toLocaleString()} words`, 'Written']}
                    />
                    <Area
                      type="monotone"
                      dataKey="words"
                      stroke="var(--color-secondary)"
                      strokeWidth={2.5}
                      fill="url(#colorWords)"
                      dot={{ r: 4, fill: 'white', stroke: 'var(--color-secondary)', strokeWidth: 2.5 }}
                      activeDot={{ r: 6, fill: 'var(--color-secondary)', stroke: 'white', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Words Written Bento Box */}
            <div className="col-span-4 p-6 bg-primary text-on-primary rounded-xl flex flex-col justify-between">
              <span className="material-symbols-outlined text-display-lg opacity-50 text-left">
                auto_awesome
              </span>
              <div>
                <p className="text-[32px] font-bold leading-none text-left">
                  {wordsWrittenToday.toLocaleString()}
                </p>
                <p className="text-label-sm opacity-80 uppercase tracking-widest mt-2 text-left">
                  Words Written Today
                </p>
              </div>
            </div>
          </div>

          {/* Recent Documents Grid Header */}
          <div className="flex justify-between items-end mb-6">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Recent Documents
            </h3>
            <button 
              onClick={handleCreateNew}
              className="text-secondary font-label-md hover:underline cursor-pointer"
            >
              Create New
            </button>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-on-surface-variant font-mono">
                No documents found matching "{searchQuery}"
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div key={doc.id} className="group relative">
                  {/* Delete document button (hidden until hover) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
                        deleteDocument(doc.id)
                      }
                    }}
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 bg-white/90 p-1.5 rounded-full border border-outline-variant text-error hover:bg-error hover:text-white transition-all shadow-sm cursor-pointer"
                    title="Delete document"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>

                  <div 
                    onClick={() => handleOpenDoc(doc.id)}
                    className="aspect-[3/4] bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden editor-canvas-shadow group-hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    <div className="p-4 h-full flex flex-col">
                      {/* Thumbnail / content visual preview */}
                      <div className="w-full flex-1 bg-white rounded border border-outline-variant/30 overflow-hidden relative">
                        <div className="p-3 text-[11px] leading-[1.6] text-on-surface font-body overflow-hidden h-full">
                          {doc.content.replace(/<[^>]*>/g, '').trim().substring(0, 200) || 'Empty document'}
                        </div>
                      </div>
                      
                      {/* Stat Lines */}
                      <div className="pt-3 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] text-outline font-mono">
                          <span>{doc.wordCount} words</span>
                          <span>{doc.charCount} chars</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary rounded-full" 
                            style={{ width: `${Math.min(100, (doc.wordCount / 500) * 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-left">
                    <h4 
                      onClick={() => handleOpenDoc(doc.id)}
                      className="font-label-md text-on-surface group-hover:text-secondary transition-colors cursor-pointer font-semibold truncate"
                    >
                      {doc.title}
                    </h4>
                    <p className="text-label-sm text-on-surface-variant mt-0.5">
                      Edited {formatLastSaved(doc.lastSaved)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
