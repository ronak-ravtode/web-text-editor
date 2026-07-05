import { type Editor, EditorContent } from '@tiptap/react'

interface EditorCanvasProps {
  editor: Editor | null
}

export default function EditorCanvas({ editor }: EditorCanvasProps) {
  return (
    <div className="w-full flex flex-col items-center gap-8 pb-24">
      <div className="bg-surface-container-lowest page-shadow w-[816px] h-[1056px] rounded-sm relative overflow-hidden flex-shrink-0">
        <div className="px-6 py-8">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
