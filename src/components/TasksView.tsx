import { useState } from 'react'
import { useEditorStore } from '../store/editorStore'
import type { TaskItem } from '../store/editorStore'

const COLUMNS: { id: TaskItem['column']; label: string; icon: string; color: string }[] = [
  { id: 'todo', label: 'To Do', icon: 'radio_button_unchecked', color: 'text-on-surface-variant' },
  { id: 'in-progress', label: 'In Progress', icon: 'pending', color: 'text-secondary' },
  { id: 'done', label: 'Done', icon: 'check_circle', color: 'text-success' },
]

export default function TasksView() {
  const { tasks, toggleTask, moveTask, showToast } = useEditorStore()
  const [newTaskText, setNewTaskText] = useState('')
  const [activeColumn, setActiveColumn] = useState<TaskItem['column']>('todo')
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskText.trim()) return
    const store = useEditorStore.getState()
    const id = `task-${Date.now()}`
    // Add directly with the correct column
    const newTask = { id, text: newTaskText.trim(), completed: activeColumn === 'done', dueDate: activeColumn === 'done' ? 'Completed' : 'Due soon', column: activeColumn }
    const updatedTasks = [...store.tasks, newTask]
    localStorage.setItem('proeditor-tasks', JSON.stringify(updatedTasks))
    useEditorStore.setState({ tasks: updatedTasks })
    setNewTaskText('')
    showToast('Task added', 'success')
  }

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (column: TaskItem['column']) => {
    if (draggedTask) {
      moveTask(draggedTask, column)
      setDraggedTask(null)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">Tasks</h2>
            <p className="text-sm text-on-surface-variant mt-1">Organize your work with a kanban board</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-on-surface-variant">
              {tasks.filter(t => t.completed).length}/{tasks.length} completed
            </span>
          </div>
        </div>

        {/* Quick add */}
        <form onSubmit={handleAddTask} className="mb-6 flex items-center gap-3">
          <select
            value={activeColumn}
            onChange={(e) => setActiveColumn(e.target.value as TaskItem['column'])}
            className="px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface-elevated text-sm outline-none focus:ring-2 focus:ring-secondary/20 text-on-surface cursor-pointer"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 rounded-lg border border-outline-variant/60 bg-surface-elevated text-sm outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 text-on-surface placeholder:text-on-surface-variant/50"
          />
          <button
            type="submit"
            disabled={!newTaskText.trim()}
            className="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Add Task
          </button>
        </form>

        {/* Kanban columns */}
        <div className="grid grid-cols-3 gap-4">
          {COLUMNS.map(col => {
            const columnTasks = tasks.filter(t => t.column === col.id)
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(col.id)}
                className="bg-surface-container-low/50 rounded-xl border border-outline-variant/30 overflow-hidden"
              >
                {/* Column header */}
                <div className="px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[18px] ${col.color}`}>{col.icon}</span>
                    <h4 className="text-sm font-semibold text-on-surface">{col.label}</h4>
                  </div>
                  <span className="text-xs font-mono text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-md">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Tasks */}
                <div className="p-3 space-y-2 min-h-[200px]">
                  {columnTasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-on-surface-variant/50">
                      Drop tasks here
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className={`bg-surface-elevated border border-outline-variant/40 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-card transition-all group ${
                          task.completed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              task.completed
                                ? 'bg-success border-success text-white'
                                : 'border-outline-variant hover:border-secondary'
                            }`}
                          >
                            {task.completed && (
                              <span className="material-symbols-outlined text-[10px]">check</span>
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${task.completed ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
                              {task.text}
                            </p>
                            <p className="text-[11px] text-on-surface-variant/70 mt-1">{task.dueDate}</p>
                          </div>
                          {col.id !== 'done' && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                              {COLUMNS.filter(c => c.id !== col.id).map(target => (
                                <button
                                  key={target.id}
                                  onClick={() => { moveTask(task.id, target.id); showToast(`Moved to ${target.label}`, 'info') }}
                                  className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                                  title={`Move to ${target.label}`}
                                >
                                  <span className="material-symbols-outlined text-[12px]">
                                    {target.id === 'todo' ? 'radio_button_unchecked' : target.id === 'in-progress' ? 'pending' : 'check_circle'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
