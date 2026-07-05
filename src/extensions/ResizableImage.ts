import { Image as TiptapImage } from '@tiptap/extension-image'
import { ReactNodeViewRenderer } from '@tiptap/react'
import ResizableImageComponent from '../components/ResizableImageComponent'

export const ResizableImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('class'),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.class) return {}
          return { class: attributes.class }
        },
      },
      width: {
        default: '100%',
        renderHTML: (attributes: Record<string, any>) => ({
          width: attributes.width,
          style: `width: ${attributes.width}; max-width: 100%; height: auto;`,
        }),
        parseHTML: (element: HTMLElement) => element.style.width || element.getAttribute('width') || '100%',
      },
      height: {
        default: 'auto',
        renderHTML: (attributes: Record<string, any>) => {
          // Don't render height="auto" as it's invalid HTML
          if (!attributes.height || attributes.height === 'auto') return {}
          return { height: attributes.height }
        },
        parseHTML: (element: HTMLElement) => element.getAttribute('height') || 'auto',
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent)
  },
})
