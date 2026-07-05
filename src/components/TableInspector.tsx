import { useEffect, useState } from 'react'
import { type Editor } from '@tiptap/react'

interface TableInspectorProps {
  editor: Editor | null
}

export default function TableInspector({ editor }: TableInspectorProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosedByUser, setIsClosedByUser] = useState(false)
  const [striped, setStriped] = useState(false)
  const [noVerticalBorders, setNoVerticalBorders] = useState(false)

  // Listen to editor selection state to check if inside a table
  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      const insideTable = editor.isActive('table')
      setIsVisible(insideTable)
      if (!insideTable) {
        setIsClosedByUser(false) // reset close state when we exit table
      } else {
        // Read current table classes to synchronize checkboxes
        const currentClass = editor.getAttributes('table').class || ''
        setStriped(currentClass.includes('table-striped'))
        setNoVerticalBorders(currentClass.includes('table-no-vertical-borders'))
      }
    }

    editor.on('selectionUpdate', handleSelectionUpdate)
    editor.on('transaction', handleSelectionUpdate)

    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate)
      editor.off('transaction', handleSelectionUpdate)
    }
  }, [editor])

  if (!editor || !isVisible || isClosedByUser) return null

  const handleToggleStriped = (checked: boolean) => {
    setStriped(checked)
    updateTableClasses(checked, noVerticalBorders)
  }

  const handleToggleNoVerticalBorders = (checked: boolean) => {
    setNoVerticalBorders(checked)
    updateTableClasses(striped, checked)
  }

  const updateTableClasses = (isStriped: boolean, isNoVertical: boolean) => {
    const classes = ['tiptap-table']
    if (isStriped) classes.push('table-striped')
    if (isNoVertical) classes.push('table-no-vertical-borders')
    editor.chain().focus().updateAttributes('table', { class: classes.join(' ') }).run()
  }

  const handleClearFormatting = () => {
    setStriped(false)
    setNoVerticalBorders(false)
    editor.chain().focus().updateAttributes('table', { class: 'tiptap-table' }).run()
  }

  return (
    <div 
      className="fixed right-8 top-1/2 -translate-y-1/2 w-64 frosted-glass border border-outline-variant rounded-xl page-shadow z-50 p-4 transition-all duration-300 translate-x-0 text-left"
      id="table-controls"
    >
      <div className="flex items-center justify-between mb-4">
        <h5 className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
          Table Inspector
        </h5>
        <button 
          onClick={() => setIsClosedByUser(true)}
          className="text-on-surface-variant hover:text-primary cursor-pointer flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Layout Actions */}
        <div className="space-y-2">
          <p className="font-label-md text-label-md font-semibold text-on-surface">Layout Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => editor.chain().focus().mergeCells().run()}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors group cursor-pointer text-center"
              title="Merge selected cells"
            >
              <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">
                merge_type
              </span>
              <span className="text-[10px] font-semibold text-on-surface">Merge Cells</span>
            </button>

            <button 
              onClick={() => editor.chain().focus().splitCell().run()}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors group cursor-pointer text-center"
              title="Split selected cell"
            >
              <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">
                call_split
              </span>
              <span className="text-[10px] font-semibold text-on-surface">Split Cells</span>
            </button>

            <button 
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors group cursor-pointer text-center"
              title="Add column to the right"
            >
              <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">
                add_column_right
              </span>
              <span className="text-[10px] font-semibold text-on-surface">Add Column Right</span>
            </button>

            <button 
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors group cursor-pointer text-center"
              title="Add column to the left"
            >
              <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">
                add_column_left
              </span>
              <span className="text-[10px] font-semibold text-on-surface">Add Column Left</span>
            </button>

            <button 
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors group cursor-pointer text-center"
              title="Add row below"
            >
              <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">
                add_row_below
              </span>
              <span className="text-[10px] font-semibold text-on-surface">Add Row Below</span>
            </button>

            <button 
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="flex flex-col items-center gap-1 p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors group cursor-pointer text-center"
              title="Add row above"
            >
              <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">
                add_row_above
              </span>
              <span className="text-[10px] font-semibold text-on-surface">Add Row Above</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-outline-variant" />

        {/* Styling Options */}
        <div className="space-y-2">
          <p className="font-label-md text-label-md font-semibold text-on-surface">Styling</p>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={striped}
                onChange={(e) => handleToggleStriped(e.target.checked)}
                className="rounded border-outline-variant text-secondary focus:ring-secondary cursor-pointer"
              />
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Striped Rows</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={!noVerticalBorders}
                onChange={(e) => handleToggleNoVerticalBorders(!e.target.checked)}
                className="rounded border-outline-variant text-secondary focus:ring-secondary cursor-pointer"
              />
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">Vertical Borders</span>
            </label>
          </div>
        </div>

        <button 
          onClick={handleClearFormatting}
          className="w-full bg-surface-container-highest text-primary py-2 rounded font-label-sm text-label-sm hover:opacity-80 transition-opacity cursor-pointer font-semibold shadow-sm border border-outline-variant/30"
        >
          Clear Table Formatting
        </button>
      </div>
    </div>
  )
}
