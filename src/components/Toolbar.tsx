import { useCallback, useState, useRef, useEffect } from 'react'
import { type Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Minus,
  Undo2,
  Redo2,
  ImagePlus,
  Table,
  Pilcrow,
  Palette,
  Merge,
  Split,
  Trash2,
  Plus,
  Link as LinkIcon,
  Scissors,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  RemoveFormatting,
  Search,
} from 'lucide-react'

interface ToolbarProps {
  editor: Editor | null
  onUploadImage?: () => void
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150 ease-out ${
        isActive
          ? 'bg-secondary text-white shadow-[0_1px_4px_rgba(0,88,190,0.3)]'
          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-outline-variant mx-1" />
}

const FONT_SIZES = ['12', '13', '14', '15', '16', '18', '20', '24', '28', '32', '36', '48']

export default function Toolbar({ editor, onUploadImage }: ToolbarProps) {
  const [showTableMenu, setShowTableMenu] = useState(false)
  const [showImageMenu, setShowImageMenu] = useState(false)
  const [showColorMenu, setShowColorMenu] = useState(false)
  const [showHighlightMenu, setShowHighlightMenu] = useState(false)
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlignment, setImageAlignment] = useState<string | undefined>(undefined)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  const tableMenuRef = useRef<HTMLDivElement>(null)
  const imageMenuRef = useRef<HTMLDivElement>(null)
  const colorMenuRef = useRef<HTMLDivElement>(null)
  const highlightMenuRef = useRef<HTMLDivElement>(null)
  const fontSizeMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (showTableMenu && tableMenuRef.current && !tableMenuRef.current.contains(target)) setShowTableMenu(false)
      if (showImageMenu && imageMenuRef.current && !imageMenuRef.current.contains(target)) setShowImageMenu(false)
      if (showColorMenu && colorMenuRef.current && !colorMenuRef.current.contains(target)) setShowColorMenu(false)
      if (showHighlightMenu && highlightMenuRef.current && !highlightMenuRef.current.contains(target)) setShowHighlightMenu(false)
      if (showFontSizeMenu && fontSizeMenuRef.current && !fontSizeMenuRef.current.contains(target)) setShowFontSizeMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showTableMenu, showImageMenu, showColorMenu, showHighlightMenu, showFontSizeMenu])

  const openImageModal = (alignment?: string) => {
    setImageUrl('')
    setImageAlignment(alignment)
    setShowImageModal(true)
    setShowImageMenu(false)
  }

  const handleInsertImage = () => {
    if (!imageUrl.trim() || !editor) return
    const url = imageUrl.trim()
    // Validate URL protocol for security
    const lowerUrl = url.toLowerCase()
    if (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://') && !lowerUrl.startsWith('data:')) {
      return
    }
    const attrs: { src: string; class?: string } = { src: url }
    if (imageAlignment) attrs.class = `align-${imageAlignment}`
    editor.chain().focus().setImage(attrs).run()
    setShowImageModal(false)
    setImageUrl('')
  }

  const openLinkModal = () => {
    if (!editor) return
    const prev = editor.getAttributes('link').href || ''
    setLinkUrl(prev)
    setShowLinkModal(true)
  }

  const handleSetLink = () => {
    if (!editor) return
    if (linkUrl.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      const url = linkUrl.trim()
      // Validate URL protocol for security - block javascript: and data: URLs
      const lowerUrl = url.toLowerCase()
      if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:text/html')) {
        return
      }
      // Ensure URL has a protocol
      const finalUrl = (!lowerUrl.startsWith('http://') && !lowerUrl.startsWith('https://') && !lowerUrl.startsWith('mailto:'))
        ? `https://${url}` : url
      editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run()
    }
    setShowLinkModal(false)
    setLinkUrl('')
  }

  const insertTable = useCallback(
    (rows: number, cols: number) => {
      const validRows = Math.max(1, Math.min(50, Math.floor(rows)))
      const validCols = Math.max(1, Math.min(50, Math.floor(cols)))
      if (!isNaN(validRows) && !isNaN(validCols) && validRows > 0 && validCols > 0) {
        editor?.chain().focus().insertTable({ rows: validRows, cols: validCols, withHeaderRow: true }).run()
      }
      setShowTableMenu(false)
    },
    [editor]
  )

  const closeAllMenus = () => {
    setShowTableMenu(false)
    setShowImageMenu(false)
    setShowColorMenu(false)
    setShowHighlightMenu(false)
    setShowFontSizeMenu(false)
  }

  if (!editor) return null

  const currentFontSize = editor.getAttributes('textStyle').fontSize || '15'

  return (
    <>
    <div className="no-print bg-surface-elevated border-b border-outline-variant/40 px-6 py-2 flex items-center justify-between shadow-sm w-full shrink-0">
      <div className="flex items-center flex-wrap gap-0.5">
        {/* History */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
          <Undo2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Shift+Z)">
          <Redo2 size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Find */}
        <ToolbarButton onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true }))} title="Find (Ctrl+F)">
          <Search size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Font Size */}
        <div className="relative" ref={fontSizeMenuRef}>
          <button
            onClick={() => { closeAllMenus(); setShowFontSizeMenu(!showFontSizeMenu) }}
            className="flex items-center gap-1 h-8 px-2 rounded-md text-xs font-mono text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/40"
            title="Font Size"
          >
            {currentFontSize}px
            <span className="material-symbols-outlined text-[12px]">expand_more</span>
          </button>
          {showFontSizeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg p-1.5 z-50 w-20 max-h-60 overflow-y-auto">
              {FONT_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => { editor.chain().focus().setFontSize(size + 'px').run(); setShowFontSizeMenu(false) }}
                  className={`w-full text-left px-2.5 py-1 rounded text-xs cursor-pointer transition-colors ${
                    currentFontSize === size ? 'bg-secondary/10 text-secondary font-semibold' : 'text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <ToolbarDivider />

        {/* Text Type */}
        <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph') && !editor.isActive('heading')} title="Normal text">
          <Pilcrow size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} isActive={editor.isActive('heading', { level: 4 })} title="Heading 4">
          <span className="text-[11px] font-bold leading-none">H4</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} isActive={editor.isActive('heading', { level: 5 })} title="Heading 5">
          <span className="text-[11px] font-bold leading-none">H5</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} isActive={editor.isActive('heading', { level: 6 })} title="Heading 6">
          <span className="text-[11px] font-bold leading-none">H6</span>
        </ToolbarButton>

        <ToolbarDivider />

        {/* Formatting */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline (Ctrl+U)">
          <Underline size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} title="Superscript">
          <SuperscriptIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} title="Subscript">
          <SubscriptIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={openLinkModal} isActive={editor.isActive('link')} title="Insert Link">
          <LinkIcon size={15} />
        </ToolbarButton>

        {/* Text Color */}
        <div className="relative" ref={colorMenuRef}>
          <ToolbarButton onClick={() => { closeAllMenus(); setShowColorMenu(!showColorMenu) }} isActive={showColorMenu} title="Text Color">
            <Palette size={15} />
          </ToolbarButton>
          {showColorMenu && (
            <div className="absolute top-full left-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg p-3 z-50 w-64">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-2 font-mono font-bold">Text Color</p>
              <div className="grid grid-cols-8 gap-1 mb-2">
                {[
                  '#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#d9d9d9','#efefef','#f3f3f3','#ffffff',
                  '#980000','#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff','#9900ff','#ff00ff',
                  '#e6b8af','#f4cccc','#fce5cd','#d9ead3','#d0e0e3','#c9daf8','#cfe2f3','#d9d2e9','#ead1dc','#dd7e6b',
                  '#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#a4c2f4','#9fc5e8','#b4a7d6','#d5a6bd','#cc4125',
                  '#e06666','#f6b26b','#ffd966','#93c47d','#76a5af','#6d9eeb','#6fa8dc','#8e7cc3','#c27ba0','#a61c00',
                  '#cc0000','#e69138','#f1c232','#6aa84f','#45818e','#3c78d8','#3d85c6','#674ea7','#a64d79','#85200c',
                  '#990000','#b45f06','#bf9000','#38761d','#134f5c','#1155cc','#0b5394','#351c75','#741b47','#5b0f00',
                  '#660000','#783f04','#7f6000','#274e13','#0c343d','#1c4587','#073763','#20124d','#4c1130','#3b0807',
                ].map((color) => (
                  <button key={color} className="w-6 h-6 rounded border border-outline-variant/50 cursor-pointer hover:scale-110 transition-transform shadow-sm" style={{ backgroundColor: color }} onClick={() => { editor.chain().focus().setColor(color).run(); setShowColorMenu(false) }} title={color} />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/40">
                <input type="color" id="customColor" className="w-6 h-6 rounded cursor-pointer border-0 p-0" onChange={(e) => { editor.chain().focus().setColor(e.target.value).run(); setShowColorMenu(false) }} />
                <label htmlFor="customColor" className="text-[11px] text-on-surface-variant cursor-pointer">Custom color...</label>
              </div>
              <button className="mt-2 text-[11px] text-secondary hover:underline font-mono cursor-pointer font-semibold" onClick={() => { editor.chain().focus().unsetColor().run(); setShowColorMenu(false) }}>
                Reset color
              </button>
            </div>
          )}
        </div>

        {/* Highlight Color */}
        <div className="relative" ref={highlightMenuRef}>
          <ToolbarButton onClick={() => { closeAllMenus(); setShowHighlightMenu(!showHighlightMenu) }} isActive={showHighlightMenu || editor.isActive('highlight')} title="Highlight">
            <Highlighter size={15} />
          </ToolbarButton>
          {showHighlightMenu && (
            <div className="absolute top-full left-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg p-3 z-50 w-64">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-2 font-mono font-bold">Highlight Color</p>
              <div className="grid grid-cols-8 gap-1 mb-2">
                {[
                  '#fef08a','#fde047','#facc15','#a3e635','#86efac','#6ee7b7','#5eead4','#67e8f9',
                  '#7dd3fc','#93c5fd','#a5b4fc','#c4b5fd','#d8b4fe','#f0abfc','#f9a8d4','#fda4af',
                  '#fca5a5','#fdba74','#fed7aa','#fef9c3','#ecfccb','#cffafe','#e0f2fe','#ede9fe',
                  '#fce7f3','#fff1f2','#ffedd5','#fefce8','#f0fdf4','#ecfeff','#f8fafc','#faf5ff',
                  '#ffffff','#f3f4f6','#d1d5db','#9ca3af','#6b7280','#374151','#1f2937','#111827',
                ].map((color) => (
                  <button key={color} className="w-6 h-6 rounded border border-outline-variant/50 cursor-pointer hover:scale-110 transition-transform shadow-sm" style={{ backgroundColor: color }} onClick={() => { editor.chain().focus().toggleHighlight({ color }).run(); setShowHighlightMenu(false) }} title={color} />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/40">
                <input type="color" id="customHighlight" className="w-6 h-6 rounded cursor-pointer border-0 p-0" onChange={(e) => { editor.chain().focus().toggleHighlight({ color: e.target.value }).run(); setShowHighlightMenu(false) }} />
                <label htmlFor="customHighlight" className="text-[11px] text-on-surface-variant cursor-pointer">Custom color...</label>
              </div>
              <button className="mt-2 text-[11px] text-secondary hover:underline font-mono cursor-pointer font-semibold" onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightMenu(false) }}>
                Remove highlight
              </button>
            </div>
          )}
        </div>

        {/* Clear Formatting */}
        <ToolbarButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
          <RemoveFormatting size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left">
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center">
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right">
          <AlignRight size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <AlignJustify size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbered List">
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Blockquote">
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <Minus size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setPageBreak().run()} title="Page Break">
          <Scissors size={15} />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Image */}
        <div className="relative" ref={imageMenuRef}>
          <ToolbarButton onClick={() => { closeAllMenus(); setShowImageMenu(!showImageMenu) }} isActive={showImageMenu} title="Insert Image">
            <ImagePlus size={15} />
          </ToolbarButton>
          {showImageMenu && (
            <div className="absolute top-full left-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg p-2 z-50 w-44">
              <button className="w-full text-left px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-low rounded cursor-pointer transition-colors" onClick={() => { onUploadImage?.(); setShowImageMenu(false) }}>
                Upload image
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-low rounded cursor-pointer transition-colors" onClick={() => openImageModal()}>
                Insert from URL
              </button>
              <div className="h-px bg-outline-variant my-1" />
              <button className="w-full text-left px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container-low rounded cursor-pointer transition-colors" onClick={() => openImageModal('left')}>
                Align left (wrap text)
              </button>
              <button className="w-full text-left px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container-low rounded cursor-pointer transition-colors" onClick={() => openImageModal('right')}>
                Align right (wrap text)
              </button>
              <button className="w-full text-left px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container-low rounded cursor-pointer transition-colors" onClick={() => openImageModal('center')}>
                Align center
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="relative" ref={tableMenuRef}>
          <ToolbarButton onClick={() => { closeAllMenus(); if (editor.isActive('table')) { setShowTableMenu(!showTableMenu) } else { insertTable(3, 3) } }} isActive={editor.isActive('table')} title="Insert Table">
            <Table size={15} />
          </ToolbarButton>
          {showTableMenu && editor.isActive('table') && (
            <div className="absolute top-full left-0 mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg p-2 z-50 w-52">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1 px-2 font-mono font-bold">Table Operations</p>
              <button className="w-full text-left px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-low rounded flex items-center gap-2 cursor-pointer transition-colors" onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false) }}>
                <Plus size={13} /> Add column right
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-low rounded flex items-center gap-2 cursor-pointer transition-colors" onClick={() => { editor.chain().focus().addColumnBefore().run(); setShowTableMenu(false) }}>
                <Plus size={13} /> Add column left
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-low rounded flex items-center gap-2 cursor-pointer transition-colors" onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false) }}>
                <Plus size={13} /> Add row below
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-low rounded flex items-center gap-2 cursor-pointer transition-colors" onClick={() => { editor.chain().focus().addRowBefore().run(); setShowTableMenu(false) }}>
                <Plus size={13} /> Add row above
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-low rounded flex items-center gap-2 cursor-pointer transition-colors" onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false) }}>
                <Trash2 size={13} /> Delete column
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-low rounded flex items-center gap-2 cursor-pointer transition-colors" onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false) }}>
                <Trash2 size={13} /> Delete row
              </button>
              <div className="h-px bg-outline-variant my-1" />
              <button className="w-full text-left px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-low rounded flex items-center gap-2 cursor-pointer transition-colors" onClick={() => { editor.chain().focus().mergeCells().run(); setShowTableMenu(false) }}>
                <Merge size={13} /> Merge cells
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-on-surface hover:bg-surface-container-low rounded flex items-center gap-2 cursor-pointer transition-colors" onClick={() => { editor.chain().focus().splitCell().run(); setShowTableMenu(false) }}>
                <Split size={13} /> Split cell
              </button>
              <button className="w-full text-left px-3 py-1.5 text-sm text-error hover:bg-error/10 rounded flex items-center gap-2 cursor-pointer transition-colors" onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false) }}>
                <Trash2 size={13} /> Delete table
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Image URL Modal */}
    {showImageModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowImageModal(false)} />
        <div className="relative bg-surface-elevated border border-outline-variant/40 rounded-xl shadow-panel w-[420px] p-6 animate-fade-in">
          <h3 className="font-display text-lg font-bold text-on-surface mb-1">Insert Image</h3>
          <p className="text-xs text-on-surface-variant mb-4">Paste an image URL below</p>
          <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleInsertImage() }} className="w-full px-3 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-sm outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 text-on-surface placeholder:text-on-surface-variant/40" placeholder="https://example.com/image.png" autoFocus />
          {imageUrl && (
            <div className="mt-3 rounded-lg border border-outline-variant/40 overflow-hidden bg-surface-container-low p-2 flex justify-center">
              <img src={imageUrl} alt="Preview" className="max-h-32 max-w-full object-contain rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setShowImageModal(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer font-medium">Cancel</button>
            <button onClick={handleInsertImage} disabled={!imageUrl.trim()} className="px-4 py-2 text-sm bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Insert</button>
          </div>
        </div>
      </div>
    )}

    {/* Link URL Modal */}
    {showLinkModal && (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowLinkModal(false)} />
        <div className="relative bg-surface-elevated border border-outline-variant/40 rounded-xl shadow-panel w-[420px] p-6 animate-fade-in">
          <h3 className="font-display text-lg font-bold text-on-surface mb-1">Insert Link</h3>
          <p className="text-xs text-on-surface-variant mb-4">Enter the URL for the link</p>
          <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSetLink() }} className="w-full px-3 py-2.5 rounded-lg border border-outline-variant/60 bg-surface text-sm outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 text-on-surface placeholder:text-on-surface-variant/40" placeholder="https://example.com" autoFocus />
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setShowLinkModal(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer font-medium">Cancel</button>
            <button onClick={handleSetLink} className="px-4 py-2 text-sm bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-all cursor-pointer">{linkUrl.trim() ? 'Set Link' : 'Remove Link'}</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
