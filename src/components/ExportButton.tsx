import { saveAs } from 'file-saver'
import { type Editor } from '@tiptap/react'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TableRow,
  TableCell,
  Table,
  WidthType,
  BorderStyle,
  ExternalHyperlink,
  VerticalAlign,
  PageBreak,
  ImageRun,
  TextWrappingType,
  TextWrappingSide,
  Header,
  Footer,
  PageNumber,
} from 'docx'
import {
  FileDown,
} from 'lucide-react'
import { Button } from './ui/button'

interface ExportButtonProps {
  editor: Editor | null
}

function getAlignment(el: HTMLElement): (typeof AlignmentType)[keyof typeof AlignmentType] {
  const align = el.getAttribute('align') || el.style.textAlign
  if (align === 'center') return AlignmentType.CENTER
  if (align === 'right') return AlignmentType.RIGHT
  if (align === 'justify') return AlignmentType.JUSTIFIED
  
  // Check class attribute for image alignment
  const className = el.className || ''
  if (className.includes('align-center')) return AlignmentType.CENTER
  if (className.includes('align-right')) return AlignmentType.RIGHT
  
  return AlignmentType.LEFT
}

function getCellProperties(td: HTMLElement, useComputedStyles = false) {
  const properties: any = {}
  const computed = useComputedStyles ? window.getComputedStyle(td) : null
  
  // 1. Padding / Margins - use computed styles if available
  let top = 160
  let bottom = 160
  let left = 240
  let right = 240
  
  if (td.style.padding) {
    const parts = td.style.padding.trim().split(/\s+/)
    if (parts.length === 1) {
      const val = parseInt(parts[0]) * 20
      if (!isNaN(val)) {
        top = bottom = left = right = val
      }
    } else if (parts.length === 2) {
      const vVal = parseInt(parts[0]) * 20
      const hVal = parseInt(parts[1]) * 20
      if (!isNaN(vVal)) top = bottom = vVal
      if (!isNaN(hVal)) left = right = hVal
    } else if (parts.length === 4) {
      const tVal = parseInt(parts[0]) * 20
      const rVal = parseInt(parts[1]) * 20
      const bVal = parseInt(parts[2]) * 20
      const lVal = parseInt(parts[3]) * 20
      if (!isNaN(tVal)) top = tVal
      if (!isNaN(rVal)) right = rVal
      if (!isNaN(bVal)) bottom = bVal
      if (!isNaN(lVal)) left = lVal
    }
  } else if (computed) {
    const pt = parseInt(computed.paddingTop) * 20 || 160
    const pb = parseInt(computed.paddingBottom) * 20 || 160
    const pl = parseInt(computed.paddingLeft) * 20 || 240
    const pr = parseInt(computed.paddingRight) * 20 || 240
    top = pt; bottom = pb; left = pl; right = pr
  }
  properties.margins = { top, bottom, left, right }
  
  // 2. Shading / Background Color - use computed styles for accurate colors
  let fill: string | undefined
  
  if (td.style.backgroundColor) {
    const bg = td.style.backgroundColor.trim()
    if (bg.startsWith('#')) {
      fill = bg.substring(1)
    } else {
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0')
        const g = parseInt(match[2]).toString(16).padStart(2, '0')
        const b = parseInt(match[3]).toString(16).padStart(2, '0')
        fill = `${r}${g}${b}`
      }
    }
  } else if (computed) {
    const bg = computed.backgroundColor
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0')
        const g = parseInt(match[2]).toString(16).padStart(2, '0')
        const b = parseInt(match[3]).toString(16).padStart(2, '0')
        fill = `${r}${g}${b}`
      }
    }
  }
  
  if (td.tagName === 'TH' && !fill) {
    fill = 'F8FAFC'
  }
  
  if (fill) {
    properties.shading = { fill }
  }
  
  // 3. Borders - use computed styles for accurate border detection
  const defaultBorder = { style: BorderStyle.SINGLE as any, size: 4, color: 'B0B0C4' }
  const noBorder = { style: BorderStyle.NONE as any, size: 0, color: 'auto' }
  
  let topBorder = defaultBorder
  let bottomBorder = defaultBorder
  let leftBorder = defaultBorder
  let rightBorder = defaultBorder
  
  const tdBorder = td.style.border
  const tdStyleStr = td.getAttribute('style') || ''
  const trStyleStr = (td.parentElement as HTMLElement)?.getAttribute('style') || ''
  
  // Check for explicit border:none in inline styles
  const hasExplicitNoBorder = tdBorder === 'none' || 
    tdStyleStr.includes('border: none') || 
    tdStyleStr.includes('border: 0px') || 
    tdStyleStr.includes('border:none') ||
    tdStyleStr.includes('border:0')
  
  if (hasExplicitNoBorder) {
    topBorder = bottomBorder = leftBorder = rightBorder = noBorder
  } else {
    // Check computed border styles
    if (computed) {
      const borderTop = computed.borderTopStyle
      const borderBottom = computed.borderBottomStyle
      const borderLeft = computed.borderLeftStyle
      const borderRight = computed.borderRightStyle
      
      if (borderTop === 'none' || borderTop === 'hidden') {
        topBorder = noBorder
      }
      if (borderBottom === 'none' || borderBottom === 'hidden') {
        bottomBorder = noBorder
      }
      if (borderLeft === 'none' || borderLeft === 'hidden') {
        leftBorder = noBorder
      }
      if (borderRight === 'none' || borderRight === 'hidden') {
        rightBorder = noBorder
      }
      
      // Extract border color from computed styles
      const borderBottomColor = computed.borderBottomColor
      const borderTopColor = computed.borderTopColor
      if (borderBottomColor && borderBottom !== 'none') {
        const colorMatch = borderBottomColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (colorMatch) {
          const r = parseInt(colorMatch[1]).toString(16).padStart(2, '0')
          const g = parseInt(colorMatch[2]).toString(16).padStart(2, '0')
          const b = parseInt(colorMatch[3]).toString(16).padStart(2, '0')
          bottomBorder = { ...bottomBorder, color: `${r}${g}${b}` }
        }
      }
      if (borderTopColor && borderTop !== 'none') {
        const colorMatch = borderTopColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
        if (colorMatch) {
          const r = parseInt(colorMatch[1]).toString(16).padStart(2, '0')
          const g = parseInt(colorMatch[2]).toString(16).padStart(2, '0')
          const b = parseInt(colorMatch[3]).toString(16).padStart(2, '0')
          topBorder = { ...topBorder, color: `${r}${g}${b}` }
        }
      }
    }
    
    // Also check inline style overrides
    if (tdStyleStr.includes('border-bottom: none') || trStyleStr.includes('border-bottom: none')) {
      bottomBorder = noBorder
    } else if (tdStyleStr.includes('border-bottom') || trStyleStr.includes('border-bottom')) {
      bottomBorder = { style: BorderStyle.SINGLE as any, size: 4, color: 'E0E0E0' }
      if (trStyleStr.includes('border-bottom: 2px solid') || tdStyleStr.includes('border-bottom: 2px solid')) {
        bottomBorder.size = 8
        bottomBorder.color = '1A1A2E'
      }
    }
    
    if (tdStyleStr.includes('border-top: none')) {
      topBorder = noBorder
    }
    if (tdStyleStr.includes('border-left: none')) {
      leftBorder = noBorder
    }
    if (tdStyleStr.includes('border-right: none')) {
      rightBorder = noBorder
    }
  }
  
  properties.borders = {
    top: topBorder,
    bottom: bottomBorder,
    left: leftBorder,
    right: rightBorder,
  }
  
  // 4. Vertical Alignment
  let verticalAlign: any = VerticalAlign.TOP
  if (td.style.verticalAlign === 'middle' || (computed && computed.verticalAlign === 'middle')) {
    verticalAlign = VerticalAlign.CENTER
  } else if (td.style.verticalAlign === 'bottom' || (computed && computed.verticalAlign === 'bottom')) {
    verticalAlign = VerticalAlign.BOTTOM
  }
  properties.verticalAlign = verticalAlign
  
  return properties
}

function getHeadingLevel(tag: string): (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined {
  switch (tag) {
    case 'H1': return HeadingLevel.HEADING_1
    case 'H2': return HeadingLevel.HEADING_2
    case 'H3': return HeadingLevel.HEADING_3
    case 'H4': return HeadingLevel.HEADING_4
    case 'H5': return HeadingLevel.HEADING_5
    case 'H6': return HeadingLevel.HEADING_6
    default: return undefined
  }
}

function getColumnWidths(tableEl: HTMLElement): number[] {
  let maxCols = 0
  const rows = tableEl.querySelectorAll('tr')
  rows.forEach(tr => {
    const cells = tr.querySelectorAll('td, th')
    if (cells.length > maxCols) {
      maxCols = cells.length
    }
  })
  
  if (maxCols === 0) return []
  
  // Try to read actual rendered widths from the DOM
  try {
    const firstRow = tableEl.querySelector('tr')
    if (firstRow) {
      const cells = firstRow.querySelectorAll('td, th')
      if (cells.length > 0) {
        const totalRect = tableEl.getBoundingClientRect()
        if (totalRect.width > 0) {
          const widths: number[] = []
          cells.forEach(cell => {
            const cellRect = (cell as HTMLElement).getBoundingClientRect()
            widths.push((cellRect.width / totalRect.width) * 100)
          })
          
          // Normalize to ensure total is 100%
          const total = widths.reduce((a, b) => a + b, 0)
          if (total > 0) {
            return widths.map(w => (w / total) * 100)
          }
        }
      }
    }
  } catch {
    // Fall through to default widths
  }
  
  // Fallback: default equal widths
  const widths: number[] = new Array(maxCols).fill(100 / maxCols)
  
  if (maxCols === 4) {
    const firstHeader = tableEl.querySelector('th')?.textContent?.toLowerCase() || ''
    if (firstHeader.includes('desc') || firstHeader.includes('item')) {
      widths[0] = 45
      widths[1] = 12
      widths[2] = 18
      widths[3] = 25
    }
  } else if (maxCols === 2) {
    widths[0] = 50
    widths[1] = 50
  }
  
  return widths
}

function rgbToHex(rgb: string): string | undefined {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0')
    const g = parseInt(match[2]).toString(16).padStart(2, '0')
    const b = parseInt(match[3]).toString(16).padStart(2, '0')
    return `${r}${g}${b}`
  }
  return undefined
}

function getFormatting(el: HTMLElement) {
  let bold = false
  let italic = false
  let underline = false
  let strike = false
  let code = false
  let color: string | undefined
  let fontSize: number | undefined

  let parent: HTMLElement | null = el
  while (parent) {
    const tag = parent.tagName
    if (tag === 'B' || tag === 'STRONG') bold = true
    if (tag === 'I' || tag === 'EM') italic = true
    if (tag === 'U') underline = true
    if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL') strike = true
    if (tag === 'CODE') code = true

    const style = parent.style
    if (style.color) {
      // Convert rgb() to hex if needed
      if (style.color.startsWith('rgb')) {
        color = rgbToHex(style.color)
      } else if (style.color.startsWith('#')) {
        color = style.color.substring(1)
      } else {
        color = style.color
      }
    } else if (!color) {
      // Use computed style to get the actual rendered color
      try {
        const computed = window.getComputedStyle(parent)
        const computedColor = computed.color
        if (computedColor) {
          color = rgbToHex(computedColor)
        }
      } catch {
        // Ignore errors from getComputedStyle
      }
    }
    
    if (style.fontSize) {
      const pt = parseInt(style.fontSize)
      if (!isNaN(pt)) fontSize = pt
    } else if (!fontSize) {
      try {
        const computed = window.getComputedStyle(parent)
        const computedSize = computed.fontSize
        if (computedSize) {
          const pt = parseInt(computedSize)
          if (!isNaN(pt)) fontSize = pt
        }
      } catch {
        // Ignore errors from getComputedStyle
      }
    }

    parent = parent.parentElement
  }

  return { bold, italic, underline, strike, code, color, fontSize }
}

function createImageRun(el: HTMLElement): ImageRun | null {
  const src = el.getAttribute('src') || ''
  if (!src.startsWith('data:')) return null
  
  const parts = src.split(',')
  if (parts.length < 2) return null
  const base64Str = parts[1]
  
  // Try to get actual rendered dimensions from the DOM
  // (the measurement container is attached to DOM when this runs)
  let width = 0
  let height = 0
  
  try {
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      width = Math.round(rect.width)
      height = Math.round(rect.height)
    }
  } catch {
    // Fall through to attribute-based calculation
  }
  
  // Fallback: calculate from attributes
  if (width < 10 || height < 10) {
    width = 300
    height = 200
    
    const wStyle = el.style.width || el.getAttribute('width')
    if (wStyle) {
      if (wStyle.endsWith('%')) {
        const pct = parseFloat(wStyle)
        if (!isNaN(pct)) {
          // Use actual A4 content width: 210mm - 2*56px padding ≈ 681px at 96dpi
          const CONTENT_WIDTH_PX = 681
          width = Math.round((CONTENT_WIDTH_PX * pct) / 100)
        }
      } else {
        const px = parseFloat(wStyle)
        if (!isNaN(px)) width = Math.round(px)
      }
    }
    
    const hStyle = el.style.height || el.getAttribute('height')
    if (hStyle && hStyle !== 'auto') {
      const px = parseFloat(hStyle)
      if (!isNaN(px)) height = Math.round(px)
    } else {
      height = Math.round((width * 3) / 4)
    }
  }
  
  // Ensure minimum dimensions
  if (width < 10) width = 100
  if (height < 10) height = 100
  
  let type: 'png' | 'jpg' | 'gif' = 'png'
  const mimeMatch = src.match(/data:image\/([a-zA-Z+]+);base64/)
  if (mimeMatch) {
    const mime = mimeMatch[1].toLowerCase()
    if (mime === 'jpg' || mime === 'jpeg') type = 'jpg'
    else if (mime === 'gif') type = 'gif'
    else if (mime === 'webp') type = 'png'
  }
  
  try {
    const binaryString = window.atob(base64Str)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    // Check alignment from class attribute (on img or parent wrapper)
    const imgClass = el.className || ''
    const wrapperClass = el.parentElement?.className || ''
    const allClasses = `${imgClass} ${wrapperClass}`
    const isLeft = allClasses.includes('align-left')
    const isRight = allClasses.includes('align-right')
    
    let floating: any = undefined
    if (isLeft) {
      floating = {
        horizontalPosition: {
          relative: 'column' as any,
          align: 'left' as any,
        },
        verticalPosition: {
          relative: 'paragraph' as any,
          offset: 0,
        },
        wrap: {
          type: TextWrappingType.SQUARE,
          side: TextWrappingSide.BOTH_SIDES,
        },
      }
    } else if (isRight) {
      floating = {
        horizontalPosition: {
          relative: 'column' as any,
          align: 'right' as any,
        },
        verticalPosition: {
          relative: 'paragraph' as any,
          offset: 0,
        },
        wrap: {
          type: TextWrappingType.SQUARE,
          side: TextWrappingSide.BOTH_SIDES,
        },
      }
    }
    
    return new ImageRun({
      data: bytes.buffer,
      transformation: {
        width,
        height,
      },
      type,
      floating,
    })
  } catch (e) {
    console.error('Failed to create ImageRun:', e)
    return null
  }
}

async function preloadImages(html: string): Promise<string> {
  const div = document.createElement('div')
  div.innerHTML = html
  const imgs = div.querySelectorAll('img')
  
  const promises = Array.from(imgs).map(async (img) => {
    const src = img.getAttribute('src') || ''
    if (src && !src.startsWith('data:')) {
      try {
        const res = await fetch(src)
        const blob = await res.blob()
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        img.setAttribute('src', base64)
      } catch (e) {
        console.error('Failed to pre-fetch image:', src, e)
      }
    }
  })
  
  await Promise.all(promises)
  return div.innerHTML
}

function parseInline(node: ChildNode, inheritedFormatting?: Partial<ReturnType<typeof getFormatting>>): (TextRun | ExternalHyperlink | ImageRun)[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || ''
    if (!text) return []
    const formatting = inheritedFormatting || {}
    return [new TextRun({
      text,
      bold: formatting.bold,
      italics: formatting.italic,
      underline: formatting.underline ? {} : undefined,
      strike: formatting.strike,
      font: formatting.code ? 'JetBrains Mono' : undefined,
      size: formatting.fontSize ? formatting.fontSize * 2 : undefined,
      color: formatting.color,
    })]
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement
    const tag = el.tagName

    if (tag === 'BR') {
      return [new TextRun({ text: '', break: 1 })]
    }

    if (tag === 'A') {
      const href = el.getAttribute('href') || ''
      const innerItems = parseInlineChildren(el, inheritedFormatting)
      return [new ExternalHyperlink({
        children: innerItems.filter((x): x is TextRun => x instanceof TextRun),
        link: href,
      })]
    }

    if (tag === 'IMG') {
      const run = createImageRun(el)
      return run ? [run] : []
    }

    const ownFormatting = getFormatting(el)
    const mergedFormatting: ReturnType<typeof getFormatting> = {
      bold: ownFormatting.bold || (inheritedFormatting?.bold ?? false),
      italic: ownFormatting.italic || (inheritedFormatting?.italic ?? false),
      underline: ownFormatting.underline || (inheritedFormatting?.underline ?? false),
      strike: ownFormatting.strike || (inheritedFormatting?.strike ?? false),
      code: ownFormatting.code || (inheritedFormatting?.code ?? false),
      color: ownFormatting.color || inheritedFormatting?.color,
      fontSize: ownFormatting.fontSize || inheritedFormatting?.fontSize,
    }

    const items: (TextRun | ExternalHyperlink | ImageRun)[] = []
    el.childNodes.forEach(child => {
      items.push(...parseInline(child, mergedFormatting))
    })
    return items
  }

  return []
}

function parseInlineChildren(el: HTMLElement, inheritedFormatting?: Partial<ReturnType<typeof getFormatting>>): (TextRun | ExternalHyperlink | ImageRun)[] {
  const ownFormatting = getFormatting(el)
  const mergedFormatting: ReturnType<typeof getFormatting> = {
    bold: ownFormatting.bold || (inheritedFormatting?.bold ?? false),
    italic: ownFormatting.italic || (inheritedFormatting?.italic ?? false),
    underline: ownFormatting.underline || (inheritedFormatting?.underline ?? false),
    strike: ownFormatting.strike || (inheritedFormatting?.strike ?? false),
    code: ownFormatting.code || (inheritedFormatting?.code ?? false),
    color: ownFormatting.color || inheritedFormatting?.color,
    fontSize: ownFormatting.fontSize || inheritedFormatting?.fontSize,
  }

  const items: (TextRun | ExternalHyperlink | ImageRun)[] = []
  el.childNodes.forEach(child => {
    items.push(...parseInline(child, mergedFormatting))
  })
  return items
}

function toChildren(items: (TextRun | ExternalHyperlink | ImageRun)[]): (TextRun | ExternalHyperlink | ImageRun)[] {
  return items
}

function parseBlock(
  el: HTMLElement,
  defaultAlignment?: (typeof AlignmentType)[keyof typeof AlignmentType],
  isInTable = false
): (Paragraph | Table)[] {
  const items: (Paragraph | Table)[] = []
  const tag = el.tagName

  const getElementAlignment = () => {
    if (el.style.textAlign) {
      return getAlignment(el)
    }
    return defaultAlignment || getAlignment(el)
  }

  if (tag === 'DIV' && el.classList.contains('page-break-marker')) {
    items.push(new Paragraph({
      children: [new PageBreak()],
    }))
    return items
  }

  if (tag === 'IMG') {
    const run = createImageRun(el)
    if (run) {
      // Auto-center full-width images (they appear centered in the editor by filling the page)
      let alignment = getAlignment(el)
      const imgWidth = el.getBoundingClientRect().width || 0
      const CONTENT_WIDTH_PX = 681
      if (imgWidth > CONTENT_WIDTH_PX * 0.8 && alignment === AlignmentType.LEFT) {
        alignment = AlignmentType.CENTER
      }
      items.push(new Paragraph({
        alignment,
        children: [run],
      }))
    }
    return items
  }

  if (tag === 'TABLE') {
    const rows: TableRow[] = []
    const colWidths = getColumnWidths(el)
    
    // Total printable width of the page in twips (Letter/A4 approx)
    const PRINTABLE_WIDTH_TWIPS = 9000
    
    let widthPercent = 100
    if (el.style.width) {
      const pct = parseInt(el.style.width)
      if (!isNaN(pct)) {
        widthPercent = pct
      }
    }
    
    // Calculate table total width in twips
    const tableWidthTwips = (PRINTABLE_WIDTH_TWIPS * widthPercent) / 100
    // Calculate each column's width in twips
    const columnWidthsInTwips = colWidths.map(pct => (tableWidthTwips * pct) / 100)
    
    // Detect if table has explicit border:none in inline style
    const tableStyleStr = el.getAttribute('style') || ''
    const tableHasExplicitNoBorder = tableStyleStr.includes('border: none') || 
      tableStyleStr.includes('border:none') ||
      tableStyleStr.includes('border: 0')
    
    // Check if any cell has explicit border styles
    let anyCellHasExplicitBorder = false
    let allCellsHaveNoBorder = true
    el.querySelectorAll('td, th').forEach(cell => {
      const cellStyle = (cell as HTMLElement).getAttribute('style') || ''
      const cellBorder = (cell as HTMLElement).style.border
      if (cellBorder && cellBorder !== 'none' && !cellBorder.includes('0px')) {
        anyCellHasExplicitBorder = true
        allCellsHaveNoBorder = false
      }
      if (cellStyle.includes('border-bottom:') || cellStyle.includes('border-top:') || 
          cellStyle.includes('border-left:') || cellStyle.includes('border-right:')) {
        anyCellHasExplicitBorder = true
      }
      if (cellBorder === 'none' || cellStyle.includes('border: none') || cellStyle.includes('border:0')) {
        // This cell explicitly has no border
      } else {
        allCellsHaveNoBorder = false
      }
    })
    
    el.querySelectorAll('tr').forEach(tr => {
      const cells: TableCell[] = []
      const cellElements = tr.querySelectorAll('td, th')
      cellElements.forEach((td, colIdx) => {
        const cellChildren: (Paragraph | Table)[] = []
        const alignment = getAlignment(td as HTMLElement)
        td.childNodes.forEach(child => {
          if (child.nodeType === Node.ELEMENT_NODE) {
            cellChildren.push(...parseBlock(child as HTMLElement, alignment, true))
          } else if (child.nodeType === Node.TEXT_NODE && child.textContent) {
            cellChildren.push(new Paragraph({
              alignment,
              children: [new TextRun({ text: child.textContent })],
              spacing: { before: 0, after: 0, line: 240, lineRule: 'auto' },
            }))
          }
        })
        if (cellChildren.length === 0) {
          cellChildren.push(new Paragraph({ children: [] }))
        }
        
        let cellWidthPercent = colWidths[colIdx] || (100 / cellElements.length)
        const styleWidth = (td as HTMLElement).style.width
        if (styleWidth) {
          const pct = parseInt(styleWidth)
          if (!isNaN(pct)) {
            cellWidthPercent = pct
          }
        }
        
        const colSpanAttr = td.getAttribute('colspan')
        const rowSpanAttr = td.getAttribute('rowspan')
        const columnSpan = colSpanAttr ? parseInt(colSpanAttr) : undefined
        const rowSpan = rowSpanAttr ? parseInt(rowSpanAttr) : undefined

        const cellWidthTwips = (tableWidthTwips * cellWidthPercent) / 100
        const cellProps = getCellProperties(td as HTMLElement, true)
        cells.push(new TableCell({
          children: cellChildren,
          width: { size: cellWidthTwips, type: WidthType.DXA },
          columnSpan,
          rowSpan,
          ...cellProps
        }))
      })
      if (cells.length > 0) {
        rows.push(new TableRow({ children: cells }))
      }
    })
    if (rows.length > 0) {
      let alignment: any = AlignmentType.LEFT
      const margin = el.style.marginLeft || el.style.margin
      const marginRight = el.style.marginRight
      if (margin === 'auto' && marginRight === 'auto') {
        alignment = AlignmentType.CENTER
      } else if (margin === 'auto') {
        alignment = AlignmentType.RIGHT
      }

      // Use cell-level borders when possible, but apply table-level default borders
      // when cells don't have explicit border styles (from CSS classes)
      let tableBorders
      if (tableHasExplicitNoBorder || allCellsHaveNoBorder) {
        // Table or all cells explicitly have no borders
        tableBorders = {
          top: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
          bottom: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
          left: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
          right: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
          insideHorizontal: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
          insideVertical: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
        }
      } else if (anyCellHasExplicitBorder) {
        // Some cells have explicit borders, use cell-level only
        tableBorders = {
          top: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
          bottom: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
          left: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
          right: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
          insideHorizontal: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
          insideVertical: { style: BorderStyle.NONE as any, size: 0, color: 'auto' },
        }
      } else {
        // No explicit border styles - apply default table borders (from CSS)
        const defaultBorderColor = 'B0B0C4'
        tableBorders = {
          top: { style: BorderStyle.SINGLE as any, size: 4, color: defaultBorderColor },
          bottom: { style: BorderStyle.SINGLE as any, size: 4, color: defaultBorderColor },
          left: { style: BorderStyle.SINGLE as any, size: 4, color: defaultBorderColor },
          right: { style: BorderStyle.SINGLE as any, size: 4, color: defaultBorderColor },
          insideHorizontal: { style: BorderStyle.SINGLE as any, size: 4, color: defaultBorderColor },
          insideVertical: { style: BorderStyle.SINGLE as any, size: 4, color: defaultBorderColor },
        }
      }

      items.push(new Table({
        rows,
        width: { size: widthPercent, type: WidthType.PERCENTAGE },
        alignment,
        columnWidths: columnWidthsInTwips,
        borders: tableBorders,
      }))
    }
    return items
  }

  if (tag === 'HR') {
    items.push(new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
      spacing: { after: 200 },
    }))
    return items
  }

  if (tag === 'BR') {
    items.push(new Paragraph({ children: [] }))
    return items
  }

  const headingLevel = getHeadingLevel(tag)
  if (headingLevel !== undefined) {
    const children = toChildren(parseInlineChildren(el))
    items.push(new Paragraph({
      heading: headingLevel,
      alignment: getElementAlignment(),
      children: children.length > 0 ? children : [new TextRun({ text: '' })],
    }))
    return items
  }

  if (tag === 'P' || tag === 'DIV' || tag === 'SPAN') {
    const children = toChildren(parseInlineChildren(el))
    
    // Detect if this paragraph contains a single image with alignment
    let paragraphAlignment = getElementAlignment()
    if (children.length === 1 && children[0] instanceof ImageRun) {
      const imgEl = el.querySelector('img')
      if (imgEl) {
        const imgClass = imgEl.className || ''
        const wrapperClass = imgEl.parentElement?.className || ''
        const allClasses = `${imgClass} ${wrapperClass}`
        if (allClasses.includes('align-center')) {
          paragraphAlignment = AlignmentType.CENTER
        } else if (allClasses.includes('align-right')) {
          paragraphAlignment = AlignmentType.RIGHT
        } else if (allClasses.includes('align-left')) {
          paragraphAlignment = AlignmentType.LEFT
        } else {
          // Auto-center full-width images (they fill the page in the editor)
          const imgWidth = imgEl.getBoundingClientRect().width || 0
          const CONTENT_WIDTH_PX = 681
          if (imgWidth > CONTENT_WIDTH_PX * 0.8) {
            paragraphAlignment = AlignmentType.CENTER
          }
        }
      }
    }
    
    items.push(new Paragraph({
      alignment: paragraphAlignment,
      children: children.length > 0 ? children : [new TextRun({ text: '' })],
      ...(isInTable ? { spacing: { before: 0, after: 0, line: 240, lineRule: 'auto' } } : {}),
    }))
    return items
  }

  if (tag === 'UL' || tag === 'OL') {
    const isOrdered = tag === 'OL'
    const parseListItems = (listEl: HTMLElement, level: number) => {
      listEl.querySelectorAll(':scope > li').forEach((li) => {
        const children = toChildren(parseInlineChildren(li as HTMLElement))
        items.push(new Paragraph({
          numbering: isOrdered ? { reference: 'ordered-list', level } : { reference: 'bullet-list', level },
          children: children.length > 0 ? children : [new TextRun({ text: '' })],
          spacing: { before: 60, after: 60, line: 360, lineRule: 'auto' },
        }))
        // Process nested lists (UL/OL inside this LI)
        const nestedUl = li.querySelector(':scope > ul') as HTMLElement | null
        const nestedOl = li.querySelector(':scope > ol') as HTMLElement | null
        if (nestedUl) parseListItems(nestedUl, level + 1)
        if (nestedOl) parseListItems(nestedOl, level + 1)
      })
    }
    parseListItems(el, 0)
    return items
  }

  if (tag === 'BLOCKQUOTE') {
    const children = toChildren(parseInlineChildren(el))
    items.push(new Paragraph({
      indent: { left: 720 },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: 'B8860B', space: 10 } },
      children: children.length > 0 ? children : [new TextRun({ text: '' })],
      spacing: { before: 120, after: 120, line: 360, lineRule: 'auto' },
    }))
    return items
  }

  if (tag === 'PRE') {
    const text = el.textContent || ''
    items.push(new Paragraph({
      children: [new TextRun({ text, font: 'JetBrains Mono', size: 18 })],
    }))
    return items
  }

  el.childNodes.forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      items.push(...parseBlock(child as HTMLElement, defaultAlignment, isInTable))
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      items.push(new Paragraph({
        alignment: getElementAlignment(),
        children: [new TextRun({ text: child.textContent })],
        ...(isInTable ? { spacing: { before: 0, after: 0, line: 240, lineRule: 'auto' } } : {}),
      }))
    }
  })

  return items
}

async function htmlToDocxChildren(html: string): Promise<(Paragraph | Table)[]> {
  const container = document.createElement('div')
  container.innerHTML = html
  
  // Temporarily add to DOM so getBoundingClientRect() can measure actual widths
  // Apply same CSS as the TipTap editor for accurate measurement
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = '210mm'
  container.style.padding = '48px 56px'
  container.style.fontFamily = '"Literata", Georgia, "Times New Roman", serif'
  container.style.fontSize = '15px'
  container.style.lineHeight = '1.8'
  container.style.color = '#0d0d1a'
  container.style.visibility = 'hidden'
  
  // Apply all styles matching the TipTap editor for accurate computed style reads
  const style = document.createElement('style')
  style.textContent = `
    table { border-collapse: collapse; width: 100%; table-layout: fixed; }
    td, th { border: 1px solid #b0b0c4; padding: 8px 12px; vertical-align: top; min-width: 80px; }
    th { background: #f5f0ea; font-weight: 600; text-align: left; }
    td > p, th > p { margin: 0; }
    h1 { font-family: "DM Serif Display", Georgia, serif; font-size: 2.2em; line-height: 1.2; margin: 0 0 0.6em 0; color: #0d0d1a; }
    h2 { font-family: "DM Serif Display", Georgia, serif; font-size: 1.65em; line-height: 1.3; margin: 1.2em 0 0.5em 0; color: #1a1a2e; }
    h3 { font-family: "DM Serif Display", Georgia, serif; font-size: 1.3em; line-height: 1.4; margin: 1em 0 0.4em 0; color: #252540; }
    h4 { font-family: "DM Serif Display", Georgia, serif; font-size: 1.1em; line-height: 1.4; margin: 0.8em 0 0.3em 0; color: #252540; }
    h5 { font-family: "DM Serif Display", Georgia, serif; font-size: 1em; line-height: 1.5; margin: 0.6em 0 0.25em 0; color: #252540; }
    h6 { font-family: "DM Serif Display", Georgia, serif; font-size: 0.9em; line-height: 1.5; margin: 0.5em 0 0.2em 0; color: #4a4a6a; }
    p { margin: 0 0 0.8em 0; }
    strong { font-weight: 700; color: #0d0d1a; }
    ul, ol { padding-left: 1.5em; margin: 0.5em 0; }
    ul ul { list-style-type: circle; }
    ul ul ul { list-style-type: square; }
    ul ul ul ul { list-style-type: disc; }
    li { margin: 0.25em 0; }
    blockquote { border-left: 3px solid #b8860b; margin: 1em 0; padding: 0.5em 0 0.5em 1.2em; font-style: italic; color: #4a4a6a; }
    hr { border: none; border-top: 1px solid #d0d0de; margin: 2em 0; }
    img { max-width: 100%; height: auto; display: block; }
    img.align-left { float: left; margin: 0.5em 1.2em 0.5em 0; max-width: 45%; }
    img.align-right { float: right; margin: 0.5em 0 0.5em 1.2em; max-width: 45%; }
    img.align-center { display: block; margin: 1em auto; float: none; }
  `
  container.prepend(style)
  
  document.body.appendChild(container)
  
  // Wait for all images to load (base64 images load synchronously, but ensure it)
  const imgs = container.querySelectorAll('img')
  await Promise.all(Array.from(imgs).map(img => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve()
    return new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.onerror = () => resolve()
    })
  }))
  
  const children: (Paragraph | Table)[] = []
  container.childNodes.forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).tagName !== 'STYLE') {
      children.push(...parseBlock(child as HTMLElement))
    } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
      children.push(new Paragraph({
        children: [new TextRun({ text: child.textContent })],
      }))
    }
  })
  
  document.body.removeChild(container)
  return children
}

export default function ExportButton({ editor }: ExportButtonProps) {
  const exportToDocx = async () => {
    if (!editor) return

    const html = editor.getHTML()
    const title = document.querySelector<HTMLInputElement>('input[placeholder="Untitled"]')?.value || 'Document'

    try {
      const preloadedHtml = await preloadImages(html)
      const children = await htmlToDocxChildren(preloadedHtml)

      const doc = new Document({
        styles: {
          paragraphStyles: [
            {
              id: "Normal",
              name: "Normal",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                font: "Inter",
                size: 22, // 11pt
                color: "0F172A",
              },
              paragraph: {
                spacing: {
                  line: 432, // 1.8x line height
                  after: 180, // 9pt (0.8em)
                },
              },
            },
            {
              id: "Heading1",
              name: "Heading 1",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                font: "Hanken Grotesk",
                size: 44, // 22pt
                bold: true,
                color: "0F172A",
              },
              paragraph: {
                spacing: {
                  before: 0,
                  after: 300, // 15pt
                },
              },
            },
            {
              id: "Heading2",
              name: "Heading 2",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                font: "Hanken Grotesk",
                size: 33, // 16.5pt
                bold: true,
                color: "0F172A",
              },
              paragraph: {
                spacing: {
                  before: 460, // 23pt
                  after: 190, // 9.5pt
                },
              },
            },
            {
              id: "Heading3",
              name: "Heading 3",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                font: "Hanken Grotesk",
                size: 26, // 13pt
                bold: true,
                color: "0F172A",
              },
              paragraph: {
                spacing: {
                  before: 300, // 15pt
                  after: 120, // 6pt
                },
              },
            },
            {
              id: "Heading4",
              name: "Heading 4",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                font: "Hanken Grotesk",
                size: 22, // 11pt
                bold: true,
                color: "0F172A",
              },
              paragraph: {
                spacing: {
                  before: 240, // 12pt
                  after: 100, // 5pt
                },
              },
            },
            {
              id: "Heading5",
              name: "Heading 5",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                font: "Hanken Grotesk",
                size: 20, // 10pt
                bold: true,
                color: "0F172A",
              },
              paragraph: {
                spacing: {
                  before: 200, // 10pt
                  after: 80, // 4pt
                },
              },
            },
            {
              id: "Heading6",
              name: "Heading 6",
              basedOn: "Normal",
              next: "Normal",
              quickFormat: true,
              run: {
                font: "Hanken Grotesk",
                size: 18, // 9pt
                bold: true,
                color: "4A4A6A",
              },
              paragraph: {
                spacing: {
                  before: 160, // 8pt
                  after: 60, // 3pt
                },
              },
            },
          ],
        },
        numbering: {
          config: [
            {
              reference: 'bullet-list',
              levels: [
                { level: 0, format: 'bullet', text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
                { level: 1, format: 'bullet', text: '\u25E6', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
                { level: 2, format: 'bullet', text: '\u25AA', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
              ],
            },
            {
              reference: 'ordered-list',
              levels: [
                { level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
                { level: 1, format: 'lowerLetter', text: '%2)', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
                { level: 2, format: 'lowerRoman', text: '%3.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
              ],
            },
          ],
        },
        features: {
          updateFields: true,
        },
        sections: [{
          properties: {
            page: {
              size: {
                width: 11906,  // A4 width in twips (210mm)
                height: 16838, // A4 height in twips (297mm)
              },
              margin: {
                top: 1440,    // 1 inch
                right: 1440,  // 1 inch
                bottom: 1440, // 1 inch
                left: 1440,   // 1 inch
              },
            },
          },
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({
                      children: [PageNumber.CURRENT],
                      font: "Inter",
                      size: 18, // 9pt
                      color: "64748B",
                    }),
                  ],
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES],
                      font: "Inter",
                      size: 18, // 9pt
                      color: "64748B",
                    }),
                  ],
                }),
              ],
            }),
          },
          children: children.length > 0 ? children : [new Paragraph({ children: [] })],
        }],
        title,
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${title}.docx`)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportToDocx}
      className="font-mono text-xs font-bold gap-1.5"
      title="Export as DOCX"
    >
      <FileDown size={13} />
      <span>Export DOCX</span>
    </Button>
  )
}
