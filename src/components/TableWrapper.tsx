import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react'
import ReactDOM from 'react-dom'
import { GripVertical } from 'lucide-react'

interface TableWrapperProps {
  children: ReactNode
}

export default function TableWrapper({ children }: TableWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null)
  const [tableRect, setTableRect] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const isDragging = useRef(false)
  const isResizing = useRef(false)

  const recalc = useCallback(() => {
    if (!selectedTable) return
    const tr = selectedTable.getBoundingClientRect()
    setTableRect({
      x: tr.left,
      y: tr.top,
      w: tr.width,
      h: tr.height,
    })
  }, [selectedTable])

  useEffect(() => {
    if (!selectedTable) return
    recalc()
    const obs = new ResizeObserver(recalc)
    obs.observe(selectedTable)
    window.addEventListener('scroll', recalc, true)
    window.addEventListener('resize', recalc)
    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', recalc, true)
      window.removeEventListener('resize', recalc)
    }
  }, [selectedTable, recalc])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onMouseDown = (e: MouseEvent) => {
      if (isDragging.current || isResizing.current) return
      const target = e.target as HTMLElement
      if (target.closest('.table-handle')) return

      const table = target.closest('table') as HTMLTableElement | null
      if (table) {
        setSelectedTable(table)
      } else {
        setSelectedTable(null)
      }
    }

    container.addEventListener('mousedown', onMouseDown)
    return () => container.removeEventListener('mousedown', onMouseDown)
  }, [])

  // ─── Drag ───
  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (!selectedTable) return
    e.preventDefault()
    e.stopPropagation()
    isDragging.current = true
    const startX = e.clientX
    const startY = e.clientY
    const origML = parseFloat(selectedTable.style.marginLeft) || 0
    const origMT = parseFloat(selectedTable.style.marginTop) || 0

    const onMove = (ev: MouseEvent) => {
      selectedTable.style.marginLeft = `${origML + (ev.clientX - startX)}px`
      selectedTable.style.marginTop = `${origMT + (ev.clientY - startY)}px`
      recalc()
    }
    const onUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [selectedTable, recalc])

  // ─── Resize factory ───
  const makeResize = (fn: (ev: MouseEvent, s: any) => void) => (e: React.MouseEvent) => {
    if (!selectedTable) return
    e.preventDefault()
    e.stopPropagation()
    isResizing.current = true
    const s = {
      sx: e.clientX, sy: e.clientY,
      sw: selectedTable.getBoundingClientRect().width,
      sh: selectedTable.getBoundingClientRect().height,
      mleft: parseFloat(selectedTable.style.marginLeft) || 0,
      mtop: parseFloat(selectedTable.style.marginTop) || 0,
    }
    const onMove = (ev: MouseEvent) => { fn(ev, s); recalc() }
    const onUp = () => {
      isResizing.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onRight = makeResize((ev, s) => {
    selectedTable!.style.width = `${Math.max(80, s.sw + (ev.clientX - s.sx))}px`
  })
  const onBottom = makeResize((ev, s) => {
    selectedTable!.style.height = `${Math.max(30, s.sh + (ev.clientY - s.sy))}px`
  })
  const onLeft = makeResize((ev, s) => {
    const dx = ev.clientX - s.sx
    selectedTable!.style.width = `${Math.max(80, s.sw - dx)}px`
    selectedTable!.style.marginLeft = `${s.mleft + dx}px`
  })
  const onTop = makeResize((ev, s) => {
    const dy = ev.clientY - s.sy
    selectedTable!.style.height = `${Math.max(30, s.sh - dy)}px`
    selectedTable!.style.marginTop = `${s.mtop + dy}px`
  })
  const onBR = makeResize((ev, s) => {
    selectedTable!.style.width = `${Math.max(80, s.sw + (ev.clientX - s.sx))}px`
    selectedTable!.style.height = `${Math.max(30, s.sh + (ev.clientY - s.sy))}px`
  })
  const onTR = makeResize((ev, s) => {
    const dy = ev.clientY - s.sy
    selectedTable!.style.width = `${Math.max(80, s.sw + (ev.clientX - s.sx))}px`
    selectedTable!.style.height = `${Math.max(30, s.sh - dy)}px`
    selectedTable!.style.marginTop = `${s.mtop + dy}px`
  })
  const onBL = makeResize((ev, s) => {
    const dx = ev.clientX - s.sx
    selectedTable!.style.width = `${Math.max(80, s.sw - dx)}px`
    selectedTable!.style.height = `${Math.max(30, s.sh + (ev.clientY - s.sy))}px`
    selectedTable!.style.marginLeft = `${s.mleft + dx}px`
  })
  const onTL = makeResize((ev, s) => {
    const dx = ev.clientX - s.sx
    const dy = ev.clientY - s.sy
    selectedTable!.style.width = `${Math.max(80, s.sw - dx)}px`
    selectedTable!.style.height = `${Math.max(30, s.sh - dy)}px`
    selectedTable!.style.marginLeft = `${s.mleft + dx}px`
    selectedTable!.style.marginTop = `${s.mtop + dy}px`
  })

  const show = selectedTable && tableRect.w > 0

  return (
    <div ref={containerRef} className="relative">
      {children}
      {show && ReactDOM.createPortal(
        <>
          {/* Blue selection outline */}
          <div className="table-handle table-outline" style={{ position: 'fixed', left: tableRect.x - 1, top: tableRect.y - 1, width: tableRect.w + 2, height: tableRect.h + 2 }} />

          {/* Move handle */}
          <div className="table-handle table-move" style={{ position: 'fixed', left: tableRect.x + tableRect.w / 2 - 12, top: tableRect.y - 32 }} onMouseDown={onDragStart}>
            <GripVertical size={14} />
          </div>

          {/* 4 Corner handles */}
          <div className="table-handle table-corner table-tl" style={{ position: 'fixed', left: tableRect.x - 5, top: tableRect.y - 5 }} onMouseDown={onTL} />
          <div className="table-handle table-corner table-tr" style={{ position: 'fixed', left: tableRect.x + tableRect.w - 5, top: tableRect.y - 5 }} onMouseDown={onTR} />
          <div className="table-handle table-corner table-bl" style={{ position: 'fixed', left: tableRect.x - 5, top: tableRect.y + tableRect.h - 5 }} onMouseDown={onBL} />
          <div className="table-handle table-corner table-br" style={{ position: 'fixed', left: tableRect.x + tableRect.w - 5, top: tableRect.y + tableRect.h - 5 }} onMouseDown={onBR} />

          {/* 4 Edge midpoint handles */}
          <div className="table-handle table-edge table-e-left" style={{ position: 'fixed', left: tableRect.x - 4, top: tableRect.y + tableRect.h / 2 - 4 }} onMouseDown={onLeft} />
          <div className="table-handle table-edge table-e-right" style={{ position: 'fixed', left: tableRect.x + tableRect.w - 4, top: tableRect.y + tableRect.h / 2 - 4 }} onMouseDown={onRight} />
          <div className="table-handle table-edge table-e-top" style={{ position: 'fixed', left: tableRect.x + tableRect.w / 2 - 4, top: tableRect.y - 4 }} onMouseDown={onTop} />
          <div className="table-handle table-edge table-e-bottom" style={{ position: 'fixed', left: tableRect.x + tableRect.w / 2 - 4, top: tableRect.y + tableRect.h - 4 }} onMouseDown={onBottom} />
        </>,
        document.body
      )}
    </div>
  )
}
