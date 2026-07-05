import { useEditorStore } from '../store/editorStore'

export default function ReportingView() {
  const { documents, tasks } = useEditorStore()

  const totalWords = documents.reduce((s, d) => s + d.wordCount, 0)
  const totalChars = documents.reduce((s, d) => s + d.charCount, 0)
  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length

  const chartData = [
    { day: 'Mon', words: 1240 },
    { day: 'Tue', words: 1890 },
    { day: 'Wed', words: 980 },
    { day: 'Thu', words: 2100 },
    { day: 'Fri', words: 1650 },
    { day: 'Sat', words: 820 },
    { day: 'Sun', words: 1100 },
  ]
  const maxWords = Math.max(...chartData.map(d => d.words))

  const recentActivity = [
    { action: 'Created', target: 'Q4 Strategy Report.docx', time: '2 hours ago', icon: 'add_circle', color: 'text-success' },
    { action: 'Edited', target: 'Project Phoenix Draft', time: '5 hours ago', icon: 'edit', color: 'text-secondary' },
    { action: 'Shared', target: 'Meeting Notes - Design Sync', time: '1 day ago', icon: 'share', color: 'text-accent' },
    { action: 'Exported', target: 'Q4 Strategy Report.docx', time: '1 day ago', icon: 'download', color: 'text-warning' },
    { action: 'Created', target: 'Meeting Notes - Design Sync', time: '3 days ago', icon: 'add_circle', color: 'text-success' },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-on-surface">Reporting</h2>
          <p className="text-sm text-on-surface-variant mt-1">Track your writing productivity and activity</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Words', value: totalWords.toLocaleString(), icon: 'text_fields', color: 'from-secondary/10 to-accent/10', iconColor: 'text-secondary' },
            { label: 'Characters', value: totalChars.toLocaleString(), icon: 'text_snippet', color: 'from-success/10 to-success/5', iconColor: 'text-success' },
            { label: 'Documents', value: documents.filter(d => !d.deleted).length.toString(), icon: 'description', color: 'from-warning/10 to-warning/5', iconColor: 'text-warning' },
            { label: 'Task Completion', value: `${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%`, icon: 'task_alt', color: 'from-accent/10 to-secondary/10', iconColor: 'text-accent' },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} border border-outline-variant/30 rounded-xl p-5`}>
              <span className={`material-symbols-outlined text-[24px] ${stat.iconColor}`}>{stat.icon}</span>
              <p className="text-2xl font-bold text-on-surface mt-2">{stat.value}</p>
              <p className="text-xs text-on-surface-variant mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_360px] gap-6">
          {/* Chart */}
          <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-on-surface">Weekly Writing Activity</h3>
              <span className="text-xs text-success font-semibold">+12% this week</span>
            </div>

            <div className="h-48 flex items-end gap-3 px-2">
              {chartData.map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-mono text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.words.toLocaleString()}
                  </div>
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 cursor-pointer hover:opacity-80 ${
                      idx === 3 ? 'bg-secondary' : 'bg-surface-container-high hover:bg-secondary/60'
                    }`}
                    style={{ height: `${(bar.words / maxWords) * 100}%` }}
                    title={`${bar.day}: ${bar.words.toLocaleString()} words`}
                  />
                  <span className="text-[10px] text-on-surface-variant font-mono">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl p-5 shadow-card">
            <h3 className="text-sm font-semibold text-on-surface mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center shrink-0 ${item.color}`}>
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface">
                      <span className="font-medium">{item.action}</span>{' '}
                      <span className="text-on-surface-variant">{item.target}</span>
                    </p>
                    <p className="text-[11px] text-on-surface-variant/70 mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Document Performance */}
        <div className="mt-6 bg-surface-elevated border border-outline-variant/40 rounded-xl overflow-hidden shadow-card">
          <div className="px-5 py-4 border-b border-outline-variant/40">
            <h3 className="text-sm font-semibold text-on-surface">Document Performance</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30 text-left">
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Document</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Words</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Characters</th>
                <th className="px-5 py-3 text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant w-48">Progress</th>
              </tr>
            </thead>
            <tbody>
              {documents.filter(d => !d.deleted).map(doc => (
                <tr key={doc.id} className="border-b border-outline-variant/20 hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-on-surface">{doc.title}</td>
                  <td className="px-5 py-3 text-sm text-on-surface-variant">{doc.wordCount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-on-surface-variant">{doc.charCount.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full transition-all"
                          style={{ width: `${Math.min(100, (doc.wordCount / 1000) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-mono w-8 text-right">
                        {Math.round((doc.wordCount / 1000) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
