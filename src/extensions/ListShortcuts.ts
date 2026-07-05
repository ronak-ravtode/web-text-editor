import { Extension } from '@tiptap/core'

export const ListShortcuts = Extension.create({
  name: 'listShortcuts',
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (editor.isActive('listItem')) {
          return editor.chain().focus().sinkListItem('listItem').run()
        }
        return false
      },
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('listItem')) {
          return editor.chain().focus().liftListItem('listItem').run()
        }
        return false
      },
    }
  },
})
