import { Node } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType,
    }
  }
}

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  selectable: true,
  draggable: true,
  
  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: (node) => {
          if (typeof node === 'string') return false
          const htmlNode = node as HTMLElement
          return htmlNode.classList.contains('page-break-marker') ? null : false
        },
      },
      {
        tag: 'page-break',
      }
    ]
  },

  renderHTML() {
    return ['div', { class: 'page-break-marker' }]
  },

  addCommands() {
    return {
      setPageBreak: () => ({ commands }) => {
        return commands.insertContent({ type: this.name })
      },
    }
  },
})
