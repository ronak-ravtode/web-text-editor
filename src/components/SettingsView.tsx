import { useState } from 'react'
import { useEditorStore } from '../store/editorStore'

export default function SettingsView() {
  const { showToast } = useEditorStore()
  const [settings, setSettings] = useState({
    autosave: true,
    spellcheck: true,
    darkMode: false,
    compactMode: false,
    fontSize: 15,
    lineSpacing: 1.8,
    autoExport: false,
    notifications: true,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof settings] }))
    showToast('Setting updated', 'success')
  }

  const sections = [
    {
      title: 'Editor',
      icon: 'edit',
      items: [
        { key: 'autosave' as const, label: 'Autosave', description: 'Automatically save changes every 300ms' },
        { key: 'spellcheck' as const, label: 'Spell Check', description: 'Enable browser spell checking' },
        { key: 'compactMode' as const, label: 'Compact Mode', description: 'Reduce spacing for more content density' },
      ],
    },
    {
      title: 'Appearance',
      icon: 'palette',
      items: [
        { key: 'darkMode' as const, label: 'Dark Mode', description: 'Switch to dark theme (coming soon)' },
        { key: 'notifications' as const, label: 'Notifications', description: 'Show toast notifications for actions' },
      ],
    },
    {
      title: 'Export',
      icon: 'download',
      items: [
        { key: 'autoExport' as const, label: 'Auto-export on Publish', description: 'Download DOCX automatically when publishing' },
      ],
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
      <div className="max-w-[700px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-on-surface">Settings</h2>
          <p className="text-sm text-on-surface-variant mt-1">Customize your editor experience</p>
        </div>

        {/* Settings sections */}
        <div className="space-y-6">
          {sections.map(section => (
            <div key={section.title} className="bg-surface-elevated border border-outline-variant/40 rounded-xl overflow-hidden shadow-card">
              <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">{section.icon}</span>
                <h3 className="text-sm font-semibold text-on-surface">{section.title}</h3>
              </div>
              <div className="divide-y divide-outline-variant/20">
                {section.items.map(item => (
                  <div key={item.key} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{item.label}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{item.description}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                        settings[item.key] ? 'bg-secondary' : 'bg-outline-variant/60'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Font size slider */}
          <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-on-surface">Editor Font Size</p>
                <p className="text-xs text-on-surface-variant">Adjust the editor text size</p>
              </div>
              <span className="text-sm font-mono text-secondary font-semibold">{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={24}
              value={settings.fontSize}
              onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
              className="w-full h-1.5 bg-outline-variant/40 rounded-full appearance-none cursor-pointer accent-secondary"
            />
          </div>

          {/* Keyboard shortcuts */}
          <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl overflow-hidden shadow-card">
            <div className="px-5 py-4 border-b border-outline-variant/30 flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">keyboard</span>
              <h3 className="text-sm font-semibold text-on-surface">Keyboard Shortcuts</h3>
            </div>
            <div className="divide-y divide-outline-variant/20">
              {[
                { keys: 'Ctrl + B', action: 'Bold' },
                { keys: 'Ctrl + I', action: 'Italic' },
                { keys: 'Ctrl + U', action: 'Underline' },
                { keys: 'Ctrl + Z', action: 'Undo' },
                { keys: 'Ctrl + Shift + Z', action: 'Redo' },
                { keys: 'Ctrl + S', action: 'Save Draft' },
              ].map(shortcut => (
                <div key={shortcut.keys} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-sm text-on-surface">{shortcut.action}</span>
                  <kbd className="px-2 py-1 bg-surface-container-low border border-outline-variant/40 rounded text-xs font-mono text-on-surface-variant">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
