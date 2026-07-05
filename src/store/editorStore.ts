import { create } from 'zustand'
import { templates } from '../templates/templateData'

export interface DocumentItem {
  id: string
  title: string
  content: string
  wordCount: number
  charCount: number
  lastSaved: number
  folder?: string
  shared?: boolean
  deleted?: boolean
}

export interface TaskItem {
  id: string
  text: string
  completed: boolean
  dueDate: string
  column: 'todo' | 'in-progress' | 'done'
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  color: string
  type: 'meeting' | 'deadline' | 'reminder' | 'event'
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

type ActiveView =
  | 'dashboard'
  | 'editor'
  | 'cms'
  | 'calendar'
  | 'reporting'
  | 'tasks'
  | 'folders'
  | 'shared'
  | 'trash'
  | 'settings'
  | 'account'

interface EditorStore {
  activeView: ActiveView
  activeDocumentId: string | null
  documents: DocumentItem[]
  tasks: TaskItem[]
  events: CalendarEvent[]
  toasts: Toast[]
  sidebarOpen: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Actions
  setActiveView: (view: ActiveView) => void
  setActiveDocumentId: (id: string | null) => void
  createDocument: (title: string, content?: string) => string
  updateDocument: (id: string, updates: Partial<DocumentItem>) => void
  deleteDocument: (id: string) => void
  restoreDocument: (id: string) => void
  toggleTask: (id: string) => void
  addTask: (text: string) => void
  moveTask: (id: string, column: TaskItem['column']) => void
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void
  removeEvent: (id: string) => void
  toggleSidebar: () => void
  showToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

const STORAGE_DOCS_KEY = 'proeditor-documents'
const STORAGE_TASKS_KEY = 'proeditor-tasks'
const STORAGE_EVENTS_KEY = 'proeditor-events'
const STORAGE_ACTIVE_VIEW_KEY = 'proeditor-active-view'
const STORAGE_ACTIVE_DOC_KEY = 'proeditor-active-doc-id'

const estimateCounts = (htmlContent: string) => {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  const text = tempDiv.textContent || tempDiv.innerText || ''
  const words = text.trim().split(/\s+/).filter(Boolean)
  return {
    wordCount: words.length,
    charCount: text.length,
  }
}

const getInitialDocuments = (): DocumentItem[] => {
  const stored = localStorage.getItem(STORAGE_DOCS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // ignore
    }
  }

  const defaultDocs: DocumentItem[] = [
    {
      id: 'doc-q4-report',
      title: 'Q4 Strategy Report.docx',
      content: templates.find(t => t.id === 'report')?.content || '<h1>Q4 Strategy Report</h1>',
      wordCount: 0,
      charCount: 0,
      lastSaved: Date.now() - 2 * 60 * 60 * 1000,
      folder: 'Reports',
    },
    {
      id: 'doc-project-phoenix',
      title: 'Project Phoenix Draft',
      content: templates.find(t => t.id === 'resume')?.content || '<h1>Project Phoenix Draft</h1>',
      wordCount: 0,
      charCount: 0,
      lastSaved: Date.now() - 24 * 60 * 60 * 1000,
      folder: 'Projects',
    },
    {
      id: 'doc-design-sync',
      title: 'Meeting Notes - Design Sync',
      content: `<h1>Meeting Notes - Design Sync</h1>
<p style="color: #666; font-size: 13px;">Date: July 2, 2026 · Attendees: Alex, Sarah, Editor</p>
<hr>
<h2>Discussion Topics</h2>
<ul>
<li><strong>Typography & Visual Rhythm:</strong> Aligning graphics with the 12-column grid layout.</li>
<li><strong>Table Inspector:</strong> Add layout controls like merge/split cells and border toggles.</li>
<li><strong>AI Assistance:</strong> Introduce auto-writer options for draft enhancements.</li>
</ul>`,
      wordCount: 0,
      charCount: 0,
      lastSaved: Date.now() - 3 * 24 * 60 * 60 * 1000,
      folder: 'Meeting Notes',
      shared: true,
    },
  ]

  defaultDocs.forEach(doc => {
    const counts = estimateCounts(doc.content)
    doc.wordCount = counts.wordCount
    doc.charCount = counts.charCount
  })

  localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(defaultDocs))
  return defaultDocs
}

const getInitialTasks = (): TaskItem[] => {
  const stored = localStorage.getItem(STORAGE_TASKS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // ignore
    }
  }

  const defaultTasks: TaskItem[] = [
    { id: 'task-1', text: 'Review Marketing copy', completed: false, dueDate: 'Due tomorrow', column: 'todo' },
    { id: 'task-2', text: 'Draft announcement', completed: true, dueDate: 'Completed', column: 'done' },
    { id: 'task-3', text: 'Update release notes', completed: false, dueDate: 'Due in 3 days', column: 'todo' },
    { id: 'task-4', text: 'Design system audit', completed: false, dueDate: 'Due in 5 days', column: 'in-progress' },
    { id: 'task-5', text: 'API documentation review', completed: false, dueDate: 'Due next week', column: 'in-progress' },
  ]

  localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(defaultTasks))
  return defaultTasks
}

const getInitialEvents = (): CalendarEvent[] => {
  const stored = localStorage.getItem(STORAGE_EVENTS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // ignore
    }
  }

  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const defaultEvents: CalendarEvent[] = [
    { id: 'evt-1', title: 'Sprint Planning', date: fmt(today), time: '10:00', color: '#3b82f6', type: 'meeting' },
    { id: 'evt-2', title: 'Design Review', date: fmt(new Date(today.getTime() + 86400000)), time: '14:00', color: '#8b5cf6', type: 'meeting' },
    { id: 'evt-3', title: 'Q4 Report Deadline', date: fmt(new Date(today.getTime() + 2 * 86400000)), time: '17:00', color: '#ef4444', type: 'deadline' },
    { id: 'evt-4', title: 'Team Standup', date: fmt(today), time: '09:00', color: '#22c55e', type: 'reminder' },
    { id: 'evt-5', title: 'Client Demo', date: fmt(new Date(today.getTime() + 3 * 86400000)), time: '11:00', color: '#f59e0b', type: 'event' },
  ]

  localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(defaultEvents))
  return defaultEvents
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  activeView: (localStorage.getItem(STORAGE_ACTIVE_VIEW_KEY) as ActiveView) || 'dashboard',
  activeDocumentId: localStorage.getItem(STORAGE_ACTIVE_DOC_KEY) || null,
  documents: getInitialDocuments(),
  tasks: getInitialTasks(),
  events: getInitialEvents(),
  toasts: [],
  sidebarOpen: true,
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  setActiveView: (view) => {
    localStorage.setItem(STORAGE_ACTIVE_VIEW_KEY, view)
    set({ activeView: view })
  },

  setActiveDocumentId: (id) => {
    if (id) {
      localStorage.setItem(STORAGE_ACTIVE_DOC_KEY, id)
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_DOC_KEY)
    }
    set({ activeDocumentId: id })
  },

  createDocument: (title, content = '') => {
    const id = `doc-${Date.now()}`
    const counts = estimateCounts(content)
    const newDoc: DocumentItem = {
      id,
      title,
      content,
      wordCount: counts.wordCount,
      charCount: counts.charCount,
      lastSaved: Date.now(),
    }

    const newDocs = [newDoc, ...get().documents]
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(newDocs))
    localStorage.setItem(STORAGE_ACTIVE_DOC_KEY, id)

    set({
      documents: newDocs,
      activeDocumentId: id,
      activeView: 'editor',
    })

    return id
  },

  updateDocument: (id, updates) => {
    const updatedDocs = get().documents.map((doc) => {
      if (doc.id === id) {
        const merged = { ...doc, ...updates, lastSaved: Date.now() }
        if (updates.content !== undefined) {
          const counts = estimateCounts(updates.content)
          merged.wordCount = counts.wordCount
          merged.charCount = counts.charCount
        }
        return merged
      }
      return doc
    })

    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updatedDocs))
    set({ documents: updatedDocs })
  },

  deleteDocument: (id) => {
    const updatedDocs = get().documents.map(doc =>
      doc.id === id ? { ...doc, deleted: true } : doc
    )
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updatedDocs))

    const activeDocId = get().activeDocumentId
    if (activeDocId === id) {
      const nextDoc = updatedDocs.find(d => !d.deleted)
      const nextActiveId = nextDoc?.id || null
      if (nextActiveId) {
        localStorage.setItem(STORAGE_ACTIVE_DOC_KEY, nextActiveId)
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_DOC_KEY)
      }
      set({ documents: updatedDocs, activeDocumentId: nextActiveId })
    } else {
      set({ documents: updatedDocs })
    }
  },

  restoreDocument: (id) => {
    const updatedDocs = get().documents.map(doc =>
      doc.id === id ? { ...doc, deleted: false } : doc
    )
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updatedDocs))
    set({ documents: updatedDocs })
  },

  toggleTask: (id) => {
    const updatedTasks = get().tasks.map((task) => {
      if (task.id === id) {
        const nextCompleted = !task.completed
        return {
          ...task,
          completed: nextCompleted,
          column: nextCompleted ? 'done' as const : 'todo' as const,
          dueDate: nextCompleted ? 'Completed' : 'Due soon',
        }
      }
      return task
    })
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(updatedTasks))
    set({ tasks: updatedTasks })
  },

  addTask: (text) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text,
      completed: false,
      dueDate: 'Due soon',
      column: 'todo',
    }
    const updatedTasks = [...get().tasks, newTask]
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(updatedTasks))
    set({ tasks: updatedTasks })
  },

  moveTask: (id, column) => {
    const updatedTasks = get().tasks.map(task =>
      task.id === id
        ? { ...task, column, completed: column === 'done' }
        : task
    )
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(updatedTasks))
    set({ tasks: updatedTasks })
  },

  addEvent: (event) => {
    const newEvent: CalendarEvent = { ...event, id: `evt-${Date.now()}` }
    const updated = [...get().events, newEvent]
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(updated))
    set({ events: updated })
  },

  removeEvent: (id) => {
    const updated = get().events.filter(e => e.id !== id)
    localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(updated))
    set({ events: updated })
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  showToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}`
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      get().removeToast(id)
    }, 3000)
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }))
  },
}))
