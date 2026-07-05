import { useState, useEffect } from 'react'
import { type Editor } from '@tiptap/react'

interface WordCountProps {
  editor: Editor | null
}

export default function WordCount({ editor }: WordCountProps) {
  const [stats, setStats] = useState({ words: 0, chars: 0, lines: 0 })

  useEffect(() => {
    if (!editor) return

    const updateStats = () => {
      const text = editor.state.doc.textContent
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      const chars = text.length
      const lines = editor.state.doc.content.size > 0
        ? editor.state.doc.textContent.split('\n').length
        : 0
      setStats({ words, chars, lines })
    }

    updateStats()
    editor.on('update', updateStats)
    return () => { editor.off('update', updateStats) }
  }, [editor])

  if (!editor) return null

  const { from, to } = editor.state.selection
  const selectedChars = from !== to ? to - from : 0

  return (
    <div className="no-print bg-surface-elevated border-t border-outline-variant/40 px-6 py-1.5 flex items-center justify-between text-[11px] text-on-surface-variant/70 font-mono shrink-0">
      <div className="flex items-center gap-4">
        <span>{stats.words.toLocaleString()} words</span>
        <span>{stats.chars.toLocaleString()} characters</span>
        {selectedChars > 0 && (
          <span className="text-secondary font-semibold">{selectedChars} selected</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span>UTF-8</span>
        <span>Position {from}</span>
      </div>
    </div>
  )
}
