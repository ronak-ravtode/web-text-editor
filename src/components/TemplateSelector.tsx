import { useState, useRef, useEffect } from 'react'
import { type Editor } from '@tiptap/react'
import {
  FileText,
  Briefcase,
  Receipt,
  ChevronDown,
  LayoutTemplate,
} from 'lucide-react'
import { templates, type Template } from '../templates/templateData'
import { Button } from './ui/button'

interface TemplateSelectorProps {
  editor: Editor | null
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Briefcase,
  Receipt,
  FileText,
}

export default function TemplateSelector({ editor }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadTemplate = (template: Template) => {
    if (editor) {
      const currentContent = editor.getHTML().trim()
      const hasContent = currentContent && currentContent !== '<p></p>' && currentContent !== ''
      if (hasContent) {
        const confirmed = window.confirm('This will replace your current content. Continue?')
        if (!confirmed) return
      }
      editor.commands.setContent(template.content)
      setActiveTemplate(template.id)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant={activeTemplate ? "accent" : "outline"}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="font-mono text-xs font-bold gap-1.5"
      >
        <LayoutTemplate size={13} />
        <span>Templates</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-150">
          <div className="p-2">
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant px-2.5 py-2 font-mono font-bold">
              Choose a template
            </p>
            <div className="space-y-1">
              {templates.map((template) => {
                const Icon = iconMap[template.icon] || FileText
                const isActive = activeTemplate === template.id
                return (
                  <button
                    key={template.id}
                    onClick={() => loadTemplate(template)}
                    className={`
                      w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left
                      transition-all duration-100 cursor-pointer border
                      ${isActive
                        ? 'bg-secondary/10 border-secondary/20'
                        : 'hover:bg-surface-container-low border-transparent'
                      }
                    `}
                  >
                    <div className={`
                      mt-0.5 p-1.5 rounded-md
                      ${isActive ? 'bg-secondary/20 text-secondary' : 'bg-surface-container-low text-on-surface-variant'}
                    `}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${isActive ? 'text-secondary' : 'text-on-surface'}`}>
                        {template.name}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">{template.description}</p>
                    </div>
                    {isActive && (
                      <span className="text-[9px] uppercase tracking-wider text-secondary font-mono font-bold mt-1">
                        Active
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
