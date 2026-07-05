import React, { useRef, useState } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react'

export default function ResizableImageComponent({ node, updateAttributes, deleteNode, selected }: any) {
  const imageRef = useRef<HTMLImageElement>(null)
  const [resizing, setResizing] = useState(false)
  const [showControls, setShowControls] = useState(false)

  const handleMouseDown = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault()
    setResizing(true)

    const startX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const startWidth = imageRef.current?.getBoundingClientRect().width || 300
    const parentWidth = imageRef.current?.parentElement?.getBoundingClientRect().width || 600

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX
      const diffX = currentX - startX
      let newWidth = startWidth + diffX
      
      if (newWidth < 50) newWidth = 50
      if (newWidth > parentWidth) newWidth = parentWidth

      const pct = (newWidth / parentWidth) * 100
      updateAttributes({ width: `${pct.toFixed(1)}%` })
    }

    const handleMouseUp = () => {
      setResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleMouseMove)
      document.removeEventListener('touchend', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('touchmove', handleMouseMove, { passive: false })
    document.addEventListener('touchend', handleMouseUp)
  }

  const alignmentClass = node.attrs.class || ''
  const isAlignLeft = alignmentClass.includes('align-left')
  const isAlignRight = alignmentClass.includes('align-right')
  const isAlignCenter = alignmentClass.includes('align-center')

  const setAlignment = (alignment: string) => {
    const classes = alignment ? `align-${alignment}` : ''
    updateAttributes({ class: classes })
  }

  return (
    <NodeViewWrapper
      className={`image-resizer-wrapper ${alignmentClass}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {(selected || showControls) && (
        <div className="image-controls">
          <button
            className={`image-control-btn ${!isAlignLeft && !isAlignRight && !isAlignCenter ? 'active' : ''}`}
            onClick={() => setAlignment('')}
            title="Inline"
          >
            Inline
          </button>
          <button
            className={`image-control-btn ${isAlignLeft ? 'active' : ''}`}
            onClick={() => setAlignment('left')}
            title="Align Left"
          >
            <AlignLeft size={12} />
          </button>
          <button
            className={`image-control-btn ${isAlignCenter ? 'active' : ''}`}
            onClick={() => setAlignment('center')}
            title="Align Center"
          >
            <AlignCenter size={12} />
          </button>
          <button
            className={`image-control-btn ${isAlignRight ? 'active' : ''}`}
            onClick={() => setAlignment('right')}
            title="Align Right"
          >
            <AlignRight size={12} />
          </button>
          <div className="image-control-divider" />
          <button
            className="image-control-btn delete"
            onClick={() => deleteNode()}
            title="Delete Image"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
      <img
        ref={imageRef}
        src={node.attrs.src}
        alt={node.attrs.alt}
        style={{
          width: node.attrs.width || '100%',
          height: 'auto',
          display: 'block',
        }}
        className={selected ? 'outline-2 outline-accent outline' : ''}
      />
      {selected && (
        <div
          className={`resize-handle ${resizing ? 'active' : ''}`}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        />
      )}
    </NodeViewWrapper>
  )
}
