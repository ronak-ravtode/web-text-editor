import { useState, useEffect, useCallback } from 'react'
import { type Editor } from '@tiptap/react'

interface FindReplaceProps {
  editor: Editor | null
}

export default function FindReplace({ editor }: FindReplaceProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'find' | 'replace'>('find')
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatch, setCurrentMatch] = useState(0)

  const findMatches = useCallback(() => {
    if (!editor || !searchQuery) {
      setMatchCount(0)
      setCurrentMatch(0)
      return
    }
    const text = editor.state.doc.textContent
    const query = searchQuery.toLowerCase()
    let count = 0
    let idx = -1
    while ((idx = text.indexOf(query, idx + 1)) !== -1) {
      count++
    }
    setMatchCount(count)
    if (count > 0 && currentMatch === 0) setCurrentMatch(1)
    if (count === 0) setCurrentMatch(0)
  }, [editor, searchQuery, currentMatch])

  useEffect(() => {
    findMatches()
  }, [findMatches])

  useEffect(() => {
    if (!editor) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setIsOpen(true)
        setMode('find')
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setIsOpen(true)
        setMode('replace')
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editor, isOpen])

  const handleFindNext = () => {
    if (!editor || !searchQuery) return
    const { doc, selection } = editor.state
    const query = searchQuery.toLowerCase()
    const text = doc.textContent
    const from = selection.to
    const idx = text.toLowerCase().indexOf(query, from)

    if (idx !== -1) {
      // Calculate the actual position in the document
      let pos = 0
      let found = false
      doc.descendants((node, nodePos) => {
        if (found) return false
        if (node.isText) {
          const nodeText = node.text?.toLowerCase() || ''
          const localIdx = nodeText.indexOf(query, idx - pos)
          if (localIdx !== -1) {
            editor.chain().focus().setTextSelection(nodePos + localIdx).run()
            found = true
            return false
          }
          pos += (node.text?.length || 0)
        }
      })
      setCurrentMatch(prev => prev < matchCount ? prev + 1 : 1)
    } else {
      // Wrap around
      let pos = 0
      let found = false
      doc.descendants((node, nodePos) => {
        if (found) return false
        if (node.isText) {
          const nodeText = node.text?.toLowerCase() || ''
          const localIdx = nodeText.indexOf(query)
          if (localIdx !== -1) {
            editor.chain().focus().setTextSelection(nodePos + localIdx).run()
            found = true
            return false
          }
          pos += (node.text?.length || 0)
        }
      })
      setCurrentMatch(1)
    }
  }

  const handleFindPrev = () => {
    if (!editor || !searchQuery) return
    const { doc, selection } = editor.state
    const query = searchQuery.toLowerCase()
    const text = doc.textContent
    const from = selection.from - 1

    // Search backwards
    const substring = text.substring(0, from).toLowerCase()
    const idx = substring.lastIndexOf(query)

    if (idx !== -1) {
      let pos = 0
      let found = false
      doc.descendants((node, nodePos) => {
        if (found) return false
        if (node.isText) {
          const nodeText = node.text?.toLowerCase() || ''
          const endCheck = idx - pos
          if (endCheck >= 0 && endCheck < nodeText.length) {
            const localIdx = nodeText.indexOf(query, endCheck)
            if (localIdx !== -1 && nodePos + localIdx < from) {
              editor.chain().focus().setTextSelection(nodePos + localIdx).run()
              found = true
              return false
            }
          }
          pos += (node.text?.length || 0)
        }
      })
      setCurrentMatch(prev => prev > 1 ? prev - 1 : matchCount)
    }
  }

  const handleReplace = () => {
    if (!editor || !searchQuery) return
    const { selection } = editor.state
    const selectedText = editor.state.doc.textBetween(selection.from, selection.to)
    if (selectedText.toLowerCase() === searchQuery.toLowerCase()) {
      editor.chain().focus().deleteSelection().insertContent(replaceText).run()
    }
    handleFindNext()
  }

  const handleReplaceAll = () => {
    if (!editor || !searchQuery) return
    const html = editor.getHTML()
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    const newHtml = html.replace(regex, replaceText)
    editor.commands.setContent(newHtml)
    setMatchCount(0)
    setCurrentMatch(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-20 right-8 z-[60] animate-fade-in">
      <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl shadow-panel w-[380px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode('find')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${mode === 'find' ? 'bg-secondary/10 text-secondary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              Find
            </button>
            <button
              onClick={() => setMode('replace')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${mode === 'replace' ? 'bg-secondary/10 text-secondary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              Replace
            </button>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-surface-container-low text-on-surface-variant transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Find input */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant pointer-events-none">
                <span className="material-symbols-outlined text-[16px]">search</span>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentMatch(0) }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleFindNext() }}
                className="w-full pl-9 pr-16 py-2 rounded-lg border border-outline-variant/60 bg-surface text-sm outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 text-on-surface"
                placeholder="Find in document..."
                autoFocus
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-[10px] text-on-surface-variant font-mono">
                {searchQuery ? `${currentMatch}/${matchCount}` : '0/0'}
              </span>
            </div>
            <button onClick={handleFindPrev} disabled={!searchQuery} className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors cursor-pointer disabled:opacity-30">
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
            </button>
            <button onClick={handleFindNext} disabled={!searchQuery} className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors cursor-pointer disabled:opacity-30">
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
            </button>
          </div>

          {/* Replace input */}
          {mode === 'replace' && (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant pointer-events-none">
                    <span className="material-symbols-outlined text-[16px]">find_replace</span>
                  </span>
                  <input
                    type="text"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-outline-variant/60 bg-surface text-sm outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 text-on-surface"
                    placeholder="Replace with..."
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleReplace} disabled={!searchQuery || matchCount === 0} className="flex-1 px-3 py-1.5 text-xs font-semibold text-on-surface-variant border border-outline-variant/60 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-30">
                  Replace
                </button>
                <button onClick={handleReplaceAll} disabled={!searchQuery || matchCount === 0} className="flex-1 px-3 py-1.5 text-xs font-semibold text-secondary border border-secondary/30 rounded-lg hover:bg-secondary/5 transition-colors cursor-pointer disabled:opacity-30">
                  Replace All
                </button>
              </div>
            </>
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="px-4 py-2 border-t border-outline-variant/30 flex items-center gap-4 text-[10px] text-on-surface-variant/60 font-mono">
          <span>Ctrl+F Find</span>
          <span>Ctrl+H Replace</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  )
}
