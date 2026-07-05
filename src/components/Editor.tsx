import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { ResizableImage } from '../extensions/ResizableImage'
import { PageBreak } from '../extensions/PageBreak'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { Link } from '@tiptap/extension-link'
import Toolbar from './Toolbar'
import { useEditorStore } from '../store/editorStore'

export default function Editor() {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const { updateDocument, activeDocumentId } = useEditorStore()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        horizontalRule: false,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'tiptap-table',
        },
      }),
      TableRow,
      TableCell,
      TableHeader,
      ResizableImage.configure({
        allowBase64: true,
      }),
      PageBreak,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing something extraordinary...',
      }),
      TextStyle,
      Color,
      HorizontalRule,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter(Boolean)
      if (activeDocumentId) {
        updateDocument(activeDocumentId, {
          wordCount: words.length,
          charCount: text.length,
          content: editor.getHTML(),
        })
      }
    },
  })

  useEffect(() => {
    if (!editor) return

    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const src = e.target?.result as string
              editor.chain().focus().setImage({ src }).run()
            }
            reader.readAsDataURL(file)
          }
          return
        }
      }
    }

    const handleDrop = (event: DragEvent) => {
      const files = event.dataTransfer?.files
      if (!files) return

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          event.preventDefault()
          const reader = new FileReader()
          reader.onload = (e) => {
            const src = e.target?.result as string
            editor.chain().focus().setImage({ src }).run()
          }
          reader.readAsDataURL(file)
        }
      }
    }

    const el = editorContainerRef.current
    if (el) {
      el.addEventListener('paste', handlePaste)
      el.addEventListener('drop', handleDrop as EventListener)
    }

    return () => {
      if (el) {
        el.removeEventListener('paste', handlePaste)
        el.removeEventListener('drop', handleDrop as EventListener)
      }
    }
  }, [editor])

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      <Toolbar editor={editor} />
      <div
        ref={editorContainerRef}
        className="flex-1 overflow-y-auto bg-ink-800"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(184, 134, 11, 0.03) 0%, transparent 50%)',
        }}
      >
        <div className="py-8 px-4">
          <div className="a4-page mx-auto">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  )
}
