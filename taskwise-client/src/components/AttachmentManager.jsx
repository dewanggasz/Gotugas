"use client"

import { useState, useRef } from "react"
import { uploadAttachment, addLinkAttachment, deleteAttachment } from "../services/api"
import { Paperclip, Link, Trash2, Loader2, ImageIcon, FileIcon } from "lucide-react"

// Helper component for each attachment item
const AttachmentItem = ({ attachment, onDelete, isDeleting }) => {
  const getIcon = () => {
    if (attachment.type === "image") return <ImageIcon className="w-4 h-4 text-purple-600" />
    if (attachment.type === "link") return <Link className="w-4 h-4 text-blue-600" />
    return <FileIcon className="w-4 h-4 text-gray-600" />
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0">{getIcon()}</div>
        <a
          href={attachment.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-800 hover:underline truncate font-medium"
          title={attachment.original_name}
        >
          {attachment.original_name}
        </a>
      </div>
      <button
        type="button"
        onClick={() => onDelete(attachment.id)}
        disabled={isDeleting}
        className="text-red-500 hover:text-red-700 p-1 rounded-md flex-shrink-0 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Hapus Lampiran"
      >
        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function AttachmentManager({ task, onUpdate }) {
  const [linkUrl, setLinkUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [deletingAttachmentId, setDeletingAttachmentId] = useState(null)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setError("")
    setIsUploading(true)
    try {
      await uploadAttachment(task.id, file)
      onUpdate() // Callback to refresh task data in parent
    } catch (err) {
      setError("Gagal mengunggah file. Pastikan ukuran tidak melebihi 5MB.")
      console.error("Gagal mengunggah file:", err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Reset input file
      }
    }
  }

  const handleAddLink = async (e) => {
    e.preventDefault()
    if (!linkUrl.trim()) {
      setError("URL tidak boleh kosong.")
      return
    }

    setError("")
    setIsAddingLink(true)
    try {
      await addLinkAttachment(task.id, linkUrl)
      setLinkUrl("")
      onUpdate() // Callback to refresh task data in parent
    } catch (err) {
      setError("Gagal menambah link. Pastikan URL valid.")
      console.error("Gagal menambah link:", err)
    } finally {
      setIsAddingLink(false)
    }
  }

  const handleDelete = async (attachmentId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus lampiran ini?")) {
      setError("")
      setDeletingAttachmentId(attachmentId)
      try {
        await deleteAttachment(attachmentId)
        onUpdate() // Callback to refresh task data in parent
      } catch (err) {
        setError("Gagal menghapus lampiran.")
        console.error("Gagal menghapus lampiran:", err)
      } finally {
        setDeletingAttachmentId(null)
      }
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-800 text-lg">Lampiran</h3>

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {task.attachments?.length > 0 ? (
          task.attachments.map((att) => (
            <AttachmentItem
              key={att.id}
              attachment={att}
              onDelete={handleDelete}
              isDeleting={deletingAttachmentId === att.id}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500 py-2">Belum ada lampiran.</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleAddLink} className="flex-grow flex gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Tempel link di sini..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
          />
          <button
            type="submit"
            disabled={isAddingLink}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition-colors duration-200 flex-shrink-0"
          >
            {isAddingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambah"}
          </button>
        </form>

        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          disabled={isUploading}
          className="px-4 py-2.5 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 flex items-center justify-center disabled:opacity-50 text-sm font-medium transition-colors duration-200 flex-shrink-0"
        >
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Paperclip className="w-4 h-4 mr-2" />}
          Unggah File
        </button>
      </div>
    </div>
  )
}
