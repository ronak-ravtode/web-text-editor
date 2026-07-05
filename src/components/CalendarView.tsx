import { useState, useMemo } from 'react'
import { useEditorStore } from '../store/editorStore'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const EVENT_COLORS = [
  { color: '#3b82f6', label: 'Meeting' },
  { color: '#ef4444', label: 'Deadline' },
  { color: '#22c55e', label: 'Reminder' },
  { color: '#f59e0b', label: 'Event' },
  { color: '#8b5cf6', label: 'Focus' },
]

export default function CalendarView() {
  const { events, addEvent, removeEvent, showToast } = useEditorStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', time: '10:00', color: '#3b82f6', type: 'meeting' as const })

  const today = new Date()
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const calendarDays = useMemo(() => {
    const days: { day: number; currentMonth: boolean; date: string }[] = []
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const m = month === 0 ? 11 : month - 1
      const y = month === 0 ? year - 1 : year
      days.push({ day: d, currentMonth: false, date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ day: d, currentMonth: true, date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
    }
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1
      const y = month === 11 ? year + 1 : year
      days.push({ day: d, currentMonth: false, date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
    }
    return days
  }, [firstDayOfMonth, daysInMonth, daysInPrevMonth, year, month])

  const getEventsForDate = (date: string) => events.filter(e => e.date === date)

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) return
    const date = selectedDate || `${year}-${String(month + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    addEvent({ ...newEvent, date })
    setNewEvent({ title: '', time: '10:00', color: '#3b82f6', type: 'meeting' })
    setShowAddModal(false)
    showToast('Event created', 'success')
  }

  const handleDeleteEvent = (id: string) => {
    removeEvent(id)
    showToast('Event removed', 'info')
  }

  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const todayStr = fmt(today)

  return (
    <div className="flex-1 overflow-y-auto p-8 animate-fade-in">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-on-surface">Calendar</h2>
            <p className="text-sm text-on-surface-variant mt-1">Keep track of your deadlines and meetings</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary/90 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Event
          </button>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6">
          {/* Calendar Grid */}
          <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl overflow-hidden shadow-card">
            {/* Month Navigation */}
            <div className="px-5 py-4 border-b border-outline-variant/40 flex items-center justify-between">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1))}
                className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <h3 className="font-display text-lg font-bold text-on-surface">
                {MONTHS[month]} {year}
              </h3>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1))}
                className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-outline-variant/30">
              {DAYS.map(day => (
                <div key={day} className="py-2 text-center text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((dayInfo, i) => {
                const isToday = dayInfo.date === todayStr
                const isSelected = dayInfo.date === selectedDate
                const dayEvents = getEventsForDate(dayInfo.date)

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDate(dayInfo.date)}
                    className={`min-h-[90px] border-b border-r border-outline-variant/20 p-2 cursor-pointer transition-all hover:bg-surface-container-low/50 ${
                      !dayInfo.currentMonth ? 'opacity-30' : ''
                    } ${isSelected ? 'bg-secondary/5' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday
                        ? 'w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold'
                        : 'text-on-surface'
                    }`}>
                      {dayInfo.day}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map(evt => (
                        <div
                          key={evt.id}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate"
                          style={{ backgroundColor: `${evt.color}18`, color: evt.color }}
                        >
                          {evt.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <p className="text-[10px] text-on-surface-variant">+{dayEvents.length - 3} more</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Side panel: Selected day events */}
          <div className="space-y-4">
            <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl shadow-card p-5">
              <h4 className="text-sm font-semibold text-on-surface mb-1">
                {selectedDate
                  ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                  : 'Today'
                }
              </h4>
              <p className="text-xs text-on-surface-variant mb-4">
                {getEventsForDate(selectedDate || todayStr).length} events
              </p>

              <div className="space-y-2">
                {getEventsForDate(selectedDate || todayStr).length === 0 ? (
                  <p className="text-xs text-on-surface-variant text-center py-6">No events scheduled</p>
                ) : (
                  getEventsForDate(selectedDate || todayStr).map(evt => (
                    <div key={evt.id} className="flex items-start gap-3 p-3 rounded-lg border border-outline-variant/30 group hover:shadow-card transition-all">
                      <div className="w-1 h-full min-h-[32px] rounded-full shrink-0" style={{ backgroundColor: evt.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">{evt.title}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{evt.time}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-error/10 text-error transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming events */}
            <div className="bg-surface-elevated border border-outline-variant/40 rounded-xl shadow-card p-5">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-on-surface-variant mb-3">Upcoming</h4>
              <div className="space-y-2">
                {events
                  .filter(e => e.date >= todayStr)
                  .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                  .slice(0, 5)
                  .map(evt => (
                    <div key={evt.id} className="flex items-center gap-2.5 text-sm">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: evt.color }} />
                      <span className="text-on-surface truncate flex-1">{evt.title}</span>
                      <span className="text-[10px] text-on-surface-variant font-mono">{evt.time}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-surface-elevated border border-outline-variant/40 rounded-xl shadow-panel w-96 p-6 animate-fade-in">
            <h3 className="font-display text-lg font-bold text-on-surface mb-4">New Event</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface text-sm outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 text-on-surface"
                  placeholder="Event title..."
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">Time</label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-outline-variant/60 bg-surface text-sm outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary/40 text-on-surface"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-on-surface-variant block mb-1.5">Color</label>
                <div className="flex gap-2">
                  {EVENT_COLORS.map(c => (
                    <button
                      key={c.color}
                      onClick={() => setNewEvent({ ...newEvent, color: c.color })}
                      className={`w-8 h-8 rounded-lg cursor-pointer transition-all ${newEvent.color === c.color ? 'ring-2 ring-offset-2 ring-secondary scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={!newEvent.title.trim()}
                className="px-4 py-2 text-sm bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
