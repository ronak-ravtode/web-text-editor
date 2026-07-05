import { useEditorStore } from '../store/editorStore'

export default function AccountView() {
  const { showToast, documents } = useEditorStore()
  const activeDocs = documents.filter(d => !d.deleted)
  const totalWords = activeDocs.reduce((s, d) => s + d.wordCount, 0)

  return (
    <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
      <div className="max-w-[700px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-on-surface">Account</h2>
          <p className="text-sm text-on-surface-variant mt-1">Manage your profile and preferences</p>
        </div>

        {/* Profile card */}
        <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl overflow-hidden shadow-card mb-6">
          <div className="bg-gradient-to-r from-secondary/10 to-accent/10 px-6 py-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-accent-dark flex items-center justify-center text-white text-xl font-bold shadow-lg">
                PE
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-on-surface">ProEditor User</h3>
                <p className="text-sm text-on-surface-variant mt-0.5">user@proeditor.app</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider rounded-md">Pro Plan</span>
                  <span className="text-[10px] text-on-surface-variant">Since Jan 2024</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-outline-variant/30">
            {[
              { label: 'Documents', value: activeDocs.length },
              { label: 'Words Written', value: totalWords.toLocaleString() },
              { label: 'Days Active', value: '47' },
            ].map(stat => (
              <div key={stat.label} className="px-5 py-4 text-center">
                <p className="text-xl font-bold text-on-surface">{stat.value}</p>
                <p className="text-[11px] text-on-surface-variant mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account settings */}
        <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl overflow-hidden shadow-card mb-6">
          <div className="px-5 py-4 border-b border-outline-variant/30">
            <h3 className="text-sm font-semibold text-on-surface">Account Settings</h3>
          </div>
          <div className="divide-y divide-outline-variant/20">
            {[
              { label: 'Display Name', value: 'ProEditor User', icon: 'person' },
              { label: 'Email', value: 'user@proeditor.app', icon: 'email' },
              { label: 'Language', value: 'English (US)', icon: 'language' },
              { label: 'Timezone', value: 'UTC-5 (Eastern)', icon: 'schedule' },
            ].map(item => (
              <div key={item.label} className="px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-on-surface">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{item.value}</p>
                  </div>
                </div>
                <button
                  onClick={() => showToast('Edit functionality coming soon', 'info')}
                  className="text-xs font-medium text-secondary hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-surface-elevated border border-error/20 rounded-xl overflow-hidden shadow-card">
          <div className="px-5 py-4 border-b border-error/10">
            <h3 className="text-sm font-semibold text-error">Danger Zone</h3>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-on-surface">Delete Account</p>
              <p className="text-xs text-on-surface-variant">Permanently delete your account and all data</p>
            </div>
            <button
              onClick={() => showToast('This is a demo — account deletion is disabled', 'info')}
              className="px-4 py-2 border border-error/30 text-error text-sm font-medium rounded-lg hover:bg-error/5 transition-colors cursor-pointer"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
