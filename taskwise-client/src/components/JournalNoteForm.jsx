"use client"

import { useState, useEffect, useReducer, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Strikethrough,
  Undo,
  Redo,
  X,
  Save,
  Sparkles,
  Heart,
  Feather,
  BookOpen,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

const MenuBar = ({ editor }) => {
  if (!editor) return null

  const menuItems = [
    {
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
      title: "Bold",
    },
    {
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
      title: "Italic",
    },
    {
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
      title: "Strikethrough",
    },
    {
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
      title: "Heading 1",
    },
    {
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
      title: "Heading 2",
    },
    {
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
      title: "Bullet List",
    },
    {
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
      title: "Numbered List",
    },
    {
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
      title: "Quote",
    },
    {
      icon: ChevronRight,
      action: () => editor.chain().focus().sinkListItem("listItem").run(),
      isDisabled: !editor.can().sinkListItem("listItem"),
      title: "Indent",
    },
    {
      icon: ChevronLeft,
      action: () => editor.chain().focus().liftListItem("listItem").run(),
      isDisabled: !editor.can().liftListItem("listItem"),
      title: "Outdent",
    },
    {
      icon: Undo,
      action: () => editor.chain().focus().undo().run(),
      isDisabled: !editor.can().undo(),
      title: "Undo",
    },
    {
      icon: Redo,
      action: () => editor.chain().focus().redo().run(),
      isDisabled: !editor.can().redo(),
      title: "Redo",
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-blue-100 bg-blue-50/50 p-2.5">
      {menuItems.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={item.action}
          className={`p-2 rounded-lg transition-all duration-200 ${
            item.isActive ? "bg-blue-600 text-white shadow-md" : "hover:bg-blue-100 text-gray-600 hover:text-blue-700"
          } ${item.isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          title={item.title}
          disabled={item.isDisabled}
        >
          <item.icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}

const ColorPicker = ({ selectedColor, onSelectColor }) => {
  const colors = [
    {
      name: "default",
      bg: "bg-white",
      border: "border-gray-300",
      ring: "ring-gray-400",
    },
    { name: "red", bg: "bg-red-100", border: "border-red-300", ring: "ring-red-400" },
    {
      name: "blue",
      bg: "bg-blue-100",
      border: "border-blue-300",
      ring: "ring-blue-400",
    },
    {
      name: "green",
      bg: "bg-green-100",
      border: "border-green-300",
      ring: "ring-green-400",
    },
    {
      name: "yellow",
      bg: "bg-yellow-100",
      border: "border-yellow-300",
      ring: "ring-yellow-400",
    },
    {
      name: "purple",
      bg: "bg-purple-100",
      border: "border-purple-300",
      ring: "ring-purple-400",
    },
  ]

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-500" />
        Warna Catatan
      </label>
      <div className="flex items-center gap-2">
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => onSelectColor(color.name)}
            className={`w-7 h-7 rounded-full ${color.bg} border-2 ${color.border} ${
              selectedColor === color.name ? `ring-2 ${color.ring} ring-offset-2 shadow-md` : "hover:scale-105"
            } transition-all duration-200`}
          />
        ))}
      </div>
    </div>
  )
}

const WritingStats = ({ content, title }) => {
  const wordCount = content
    ? content
        .replace(/<[^>]*>/g, "")
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    : 0
  const charCount = content ? content.replace(/<[^>]*>/g, "").length : 0

  return (
    <div className="flex items-center gap-4 text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
      <div className="flex items-center gap-1">
        <BookOpen className="w-3 h-3" />
        <span>{wordCount} kata</span>
      </div>
      <div className="flex items-center gap-1">
        <Feather className="w-3 h-3" />
        <span>{charCount} karakter</span>
      </div>
      {wordCount > 50 && (
        <div className="flex items-center gap-1 text-blue-600">
          <Heart className="w-3 h-3" />
          <span>Bagus!</span>
        </div>
      )}
    </div>
  )
}

export default function JournalNoteForm({ isOpen, onClose, onSubmit, initialNote }) {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)
  const isMounted = useRef(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [title, setTitle] = useState("")
  const [selectedColor, setSelectedColor] = useState("default")

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
      },
    },
    onTransaction: () => {
      if (editor && isMounted.current) {
        forceUpdate()
      }
    },
    onSelectionUpdate: () => {
      if (editor && isMounted.current) {
        forceUpdate()
      }
    },
  })

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!editor || !isOpen) return
    setTitle(initialNote?.title || "")
    setSelectedColor(initialNote?.color || "default")
    const newContent = initialNote?.content || ""
    if (editor.getHTML() !== newContent) {
      editor.commands.setContent(newContent, false)
    }
  }, [isOpen, initialNote, editor])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editor) return

    if (!title.trim()) {
      alert("Judul tidak boleh kosong.")
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        title: title,
        color: selectedColor,
        content: editor.getHTML(),
      })

      await new Promise((resolve) => setTimeout(resolve, 600))
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-gray-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0 bg-blue-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">{initialNote ? "Edit Catatan" : "Catatan Baru"}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
            {/* Title Input */}
            <div>
              <label
                htmlFor="note-title"
                className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-blue-500" />
                Judul Catatan
              </label>
              <input
                id="note-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Apa yang ingin kamu ceritakan hari ini?"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all duration-200 placeholder-gray-400"
                required
              />
            </div>

            {/* Color Picker */}
            <ColorPicker selectedColor={selectedColor} onSelectColor={setSelectedColor} />

            {/* Writing Stats */}
            <WritingStats content={editor?.getHTML()} title={title} />

            {/* Editor */}
            <div className="flex-1 min-h-0">
              <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                <Feather className="w-4 h-4 text-blue-500" />
                Isi Catatan
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden h-full flex flex-col bg-white shadow-inner">
                <MenuBar editor={editor} />
                <div className="flex-1 overflow-y-auto">
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="text-xs text-gray-500 italic">
              "Setiap kata yang kamu tulis adalah langkah menuju diri yang lebih baik"
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed ${
                  isSubmitting ? "animate-pulse" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .ProseMirror {
          white-space: pre-wrap;
          min-height: 180px;
          padding: 1rem;
          color: #374151;
          line-height: 1.6;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror::before {
          content: "Mulai menulis ceritamu di sini...";
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
          position: absolute;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .ProseMirror:empty::before {
          opacity: 1;
        }
        
        .ProseMirror h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.25rem 0 0.75rem 0;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.5rem;
        }
        
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: #374151;
        }
        
        .ProseMirror ul, 
        .ProseMirror ol {
          padding-left: 1.25rem;
          margin: 0.5rem 0;
        }
        
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        .ProseMirror li > p {
          margin: 0;
        }
        
        .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          background: #eff6ff;
          padding: 0.75rem 1rem;
          margin: 0.75rem 0;
          font-style: italic;
          color: #6b7280;
          border-radius: 0 0.375rem 0.375rem 0;
        }
        
        .ProseMirror hr {
          border: none;
          height: 1px;
          background: #e5e7eb;
          margin: 1.5rem 0;
        }
        
        .ProseMirror strong {
          font-weight: 600;
          color: #1f2937;
        }
        
        .ProseMirror em {
          font-style: italic;
          color: #3b82f6;
        }
        
        .ProseMirror s {
          text-decoration: line-through;
          opacity: 0.7;
        }
        
        .ProseMirror p {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  )
}
