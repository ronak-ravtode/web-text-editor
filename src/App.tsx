import { useCallback, useEffect, useRef } from 'react'
import { useEditor } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { ResizableImage } from './extensions/ResizableImage'
import { PageBreak } from './extensions/PageBreak'
import { Link } from '@tiptap/extension-link'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { Highlight } from '@tiptap/extension-highlight'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { FontFamily } from '@tiptap/extension-font-family'
import { FontSize } from './extensions/FontSize'
import { ListShortcuts } from './extensions/ListShortcuts'

import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import Dashboard from './components/Dashboard'
import CMSView from './components/CMSView'
import CalendarView from './components/CalendarView'
import ReportingView from './components/ReportingView'
import TasksView from './components/TasksView'
import FoldersView from './components/FoldersView'
import SharedView from './components/SharedView'
import TrashView from './components/TrashView'
import SettingsView from './components/SettingsView'
import EditorCanvas from './components/EditorCanvas'
import TableWrapper from './components/TableWrapper'

import FindReplace from './components/FindReplace'
import WordCount from './components/WordCount'
import ToastContainer from './components/Toast'
import { useEditorStore } from './store/editorStore'

export default function App() {
  const {
    activeView,
    activeDocumentId,
    documents,
    updateDocument,
    setActiveDocumentId,
  } = useEditorStore()

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeDoc = documents.find(doc => doc.id === activeDocumentId)

  const editor = useEditor({
    content: activeDoc?.content || '',
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        horizontalRule: false,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: 'tiptap-table' },
      }),
      TableRow,
      TableCell,
      TableHeader,
      ResizableImage.configure({ allowBase64: true }),
      PageBreak,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'tiptap-link' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Placeholder.configure({ placeholder: 'Start writing something extraordinary...' }),
      TextStyle,
      Color,
      HorizontalRule,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      FontFamily,
      FontSize,
      ListShortcuts,
    ],
    editorProps: {
      attributes: { class: 'tiptap' },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (!file) continue
            const reader = new FileReader()
            reader.onloadend = () => {
              editor?.chain().focus().setImage({ src: reader.result as string }).run()
            }
            reader.readAsDataURL(file)
            return true
          }
        }
        // Sanitize pasted HTML to prevent XSS
        const html = event.clipboardData?.getData('text/html')
        if (html) {
          const sanitized = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
            .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
            .replace(/<embed\b[^>]*\/?>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/\son\w+\s*=/gi, ' data-stripped=')
            .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
            .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""')
            .replace(/data:text\/html/gi, 'data:text/plain')
          if (sanitized !== html) {
            event.preventDefault()
            editor?.commands.insertContent(sanitized)
            return true
          }
        }
        return false
      },
      handleDrop: (_view, event) => {
        const items = event.dataTransfer?.items
        if (!items) return false
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (!file) continue
            const reader = new FileReader()
            reader.onloadend = () => {
              editor?.chain().focus().setImage({ src: reader.result as string }).run()
            }
            reader.readAsDataURL(file)
            return true
          }
        }
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const activeDocId = useEditorStore.getState().activeDocumentId
      if (activeDocId) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = setTimeout(() => {
          updateDocument(activeDocId, { content: html })
        }, 300)
      }
    },
  })

  useEffect(() => {
    if (!activeDocumentId && documents.length > 0) {
      setActiveDocumentId(documents[0].id)
    }
  }, [activeDocumentId, documents, setActiveDocumentId])

  useEffect(() => {
    if (editor && activeDoc && editor.getHTML() !== activeDoc.content) {
      editor.commands.setContent(activeDoc.content)
    }
  }, [activeDocumentId, editor])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (editor && editor.getHTML().trim() !== '' && editor.getHTML() !== '<p></p>') {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [editor])

  const handleFileInput = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      // Limit file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert('Image file is too large. Please use an image smaller than 10MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        editor?.chain().focus().setImage({ src: reader.result as string }).run()
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [editor])

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'cms':
        return <CMSView />
      case 'calendar':
        return <CalendarView />
      case 'reporting':
        return <ReportingView />
      case 'tasks':
        return <TasksView />
      case 'folders':
        return <FoldersView />
      case 'shared':
        return <SharedView />
      case 'trash':
        return <TrashView />
      case 'settings':
        return <SettingsView />
      case 'editor':
      default:
        return (
          <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            <Toolbar editor={editor} onUploadImage={handleFileInput} />
            <div className="flex-1 overflow-y-auto overflow-x-hidden bg-surface-container-low p-8 flex justify-center scroll-smooth">
              <TableWrapper>
                <EditorCanvas editor={editor} />
              </TableWrapper>
            </div>
            <WordCount editor={editor} />
            <FindReplace editor={editor} />
          </div>
        )
    }
  }

  return (
    <div className="h-screen w-screen flex bg-surface text-on-surface overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 ml-[260px] relative">
        <Header editor={editor} />
        <div className="flex-1 flex min-h-0 pt-14 overflow-hidden">
          {renderView()}
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}
