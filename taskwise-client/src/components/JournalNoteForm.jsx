"use client"

import { useEffect, useReducer } from "react" // <-- Impor useReducer
// Impor dari TipTap
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
// Impor ikon-ikon
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Minus,
  Strikethrough,
  Indent,
  Outdent,
  Undo, // <-- Ikon baru
  Redo, // <-- Ikon baru
} from "lucide-react"

// Komponen Toolbar yang sudah diperbarui dengan ikon dan lebih banyak fitur
const MenuBar = ({ editor }) => {
  if (!editor) {
    return null
  }

  // Definisikan tombol-tombol toolbar dalam sebuah array agar lebih rapi
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
      icon: Outdent,
      action: () => editor.chain().focus().liftListItem('listItem').run(),
      isDisabled: !editor.can().liftListItem('listItem'),
      title: "Outdent",
    },
    {
      icon: Indent,
      action: () => editor.chain().focus().sinkListItem('listItem').run(),
      isDisabled: !editor.can().sinkListItem('listItem'),
      title: "Indent",
    },
    {
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
      title: "Blockquote",
    },
    {
      icon: Minus,
      action: () => editor.chain().focus().setHorizontalRule().run(),
      isActive: false,
      title: "Horizontal Rule",
    },
    // Tombol Undo dan Redo ditambahkan di sini
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
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 p-2 rounded-t-lg">
      {menuItems.map((item, index) => (
        <button
          key={index}
          type="button"
          onClick={item.action}
          className={`p-2 rounded transition-colors ${
            item.isActive ? "bg-gray-300 text-gray-900" : "hover:bg-gray-200 text-gray-600"
          } ${item.isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          title={item.title}
          disabled={item.isDisabled}
        >
          <item.icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  )
}

export default function JournalNoteForm({ isOpen, onClose, onSubmit, initialNote }) {
  // Reducer untuk memaksa pembaruan UI toolbar
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Konfigurasi untuk membuat 'Enter' di dalam list lebih intuitif
        listItem: {
          HTMLAttributes: {
            class: 'leading-normal', // Atur line-height
          },
        },
      }),
    ],
    content: "", // Konten akan di-set melalui useEffect
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none p-4 focus:outline-none',
      },
    },
    // Panggil forceUpdate setiap kali seleksi atau transaksi berubah (untuk undo/redo)
    onTransaction: () => {
      forceUpdate()
    },
    onSelectionUpdate: () => {
      forceUpdate()
    },
  })

  useEffect(() => {
    if (!editor || !isOpen) {
      return
    }
    
    const newContent = initialNote?.content || ""
    if (editor.getHTML() !== newContent) {
      editor.commands.setContent(newContent, false)
    }
  }, [isOpen, initialNote, editor])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editor) return

    await onSubmit({ content: editor.getHTML() })
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {initialNote ? "Edit Catatan" : "Catatan Baru"}
            </h3>
            
            <div className="border border-gray-300 rounded-lg">
              <MenuBar editor={editor} />
              <EditorContent editor={editor} className="min-h-[250px] max-h-[50vh] overflow-y-auto" />
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Simpan
            </button>
          </div>
        </form>
      </div>
      
      {/* CSS untuk merapatkan spasi pada list */}
      <style jsx global>{`
        .prose li {
          margin-top: 0.25em;
          margin-bottom: 0.25em;
        }
        .prose li > p {
          margin-top: 0;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  )
}
