"use client"

import { useState, useEffect, useRef } from "react"
import CollaboratorInput from "./CollaboratorInput" // Assuming this component exists and is styled
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

export default function TaskForm({ onSubmit, onCancel, task, users = [], currentUser, onAttachmentUpdate }) {
  // State for core task data
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("not_started")
  const [dueDate, setDueDate] = useState("")
  const [collaborators, setCollaborators] = useState([])
  const [updateMessage, setUpdateMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for attachment management
  const [linkUrl, setLinkUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [deletingAttachmentId, setDeletingAttachmentId] = useState(null)
  const [attachmentError, setAttachmentError] = useState("")
  const fileInputRef = useRef(null)

  // Populate form when component mounts or task data changes
  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setStatus(task.status || "not_started")
      setDueDate(task.due_date || "")
      // Filter out the creator from collaborators if they are implicitly added
      const existingCollaborators = task.collaborators
        .filter((c) => c.id !== task.user?.id) // Ensure task.user exists
        .map((c) => ({ user_id: c.id, name: c.name, permission: c.permission }))
      setCollaborators(existingCollaborators)
    } else {
      // Reset for 'Create' mode
      setTitle("")
      setDescription("")
      setStatus("not_started")
      setDueDate("")
      setCollaborators([])
    }
    setUpdateMessage("") // Clear update message on task change
  }, [task])

  // Handler for submitting core task data
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const taskData = {
      title,
      description,
      status,
      due_date: dueDate,
      collaborators: collaborators.map((c) => ({ user_id: c.user_id, permission: c.permission })),
      update_message: updateMessage,
    }
    try {
      await onSubmit(taskData)
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Instant Logic for Attachments ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setAttachmentError("")
    setIsUploading(true)
    try {
      await uploadAttachment(task.id, file)
      onAttachmentUpdate() // Callback to refresh task data in parent
    } catch (err) {
      setAttachmentError("Gagal mengunggah file. Pastikan ukuran tidak melebihi 5MB.")
      console.error("Gagal mengunggah file:", err)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // Reset input file
      }
    }
  }

  const handleAddLink = async () => {
    // Removed 'e' parameter as it's not a form submit
    if (!linkUrl.trim()) {
      setAttachmentError("URL tidak boleh kosong.")
      return
    }

    setAttachmentError("")
    setIsAddingLink(true)
    try {
      await addLinkAttachment(task.id, linkUrl)
      setLinkUrl("")
      onAttachmentUpdate() // Callback to refresh task data in parent
    } catch (err) {
      setAttachmentError("Gagal menambah link. Pastikan URL valid.")
      console.error("Gagal menambah link:", err)
    } finally {
      setIsAddingLink(false)
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus lampiran ini?")) {
      setAttachmentError("")
      setDeletingAttachmentId(attachmentId)
      try {
        await deleteAttachment(attachmentId)
        onAttachmentUpdate() // Callback to refresh task data in parent
      } catch (err) {
        setAttachmentError("Gagal menghapus lampiran.")
        console.error("Gagal menghapus lampiran:", err)
      } finally {
        setDeletingAttachmentId(null)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Form Section */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-800 mb-2">
          Judul Tugas
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
          placeholder="Masukkan judul tugas..."
          required
        />
      </div>

      <div>
        <label htmlFor="collaborators" className="block text-sm font-medium text-gray-800 mb-2">
          Kolaborator
        </label>
        <CollaboratorInput
          allUsers={users}
          collaborators={collaborators}
          setCollaborators={setCollaborators}
          currentUser={currentUser}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-2">
          Deskripsi
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
          placeholder="Tambahkan deskripsi tugas..."
          rows="4"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-800 mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 bg-white text-sm appearance-none cursor-pointer"
          >
            <option value="not_started">Belum Dimulai</option>
            <option value="in_progress">Dikerjakan</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-800 mb-2">
            Jatuh Tempo
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {task && (
        <div>
          <label htmlFor="updateMessage" className="block text-sm font-medium text-gray-800 mb-2">
            Catatan Pembaruan (Opsional)
          </label>
          <textarea
            id="updateMessage"
            value={updateMessage}
            onChange={(e) => setUpdateMessage(e.target.value)}
            placeholder="Tambahkan catatan untuk menjelaskan perubahan Anda..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
            rows="2"
          ></textarea>
        </div>
      )}

      {/* Attachment Section (Only appears in edit mode) */}
      {task && (
        <>
          <hr className="my-6 border-t border-gray-100" />
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-lg">Lampiran</h3>

            {attachmentError && <p className="text-sm text-red-600 mt-2">{attachmentError}</p>}

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {task.attachments?.length > 0 ? (
                task.attachments.map((att) => (
                  <AttachmentItem
                    key={att.id}
                    attachment={att}
                    onDelete={handleDeleteAttachment}
                    isDeleting={deletingAttachmentId === att.id}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500 py-2">Belum ada lampiran.</p>
              )}
            </div>

            {/* Changed from <form> to <div> */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow flex gap-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Tempel link di sini..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                />
                <button
                  type="button" // Ensure type is "button" to prevent accidental form submission
                  onClick={handleAddLink} // Directly call the handler
                  disabled={isAddingLink}
                  className="px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 text-sm font-medium transition-colors duration-200 flex-shrink-0"
                >
                  {isAddingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambah"}
                </button>
              </div>

              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
                className="px-4 py-2.5 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 flex items-center justify-center disabled:opacity-50 text-sm font-medium transition-colors duration-200 flex-shrink-0"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4 mr-2" />
                )}
                Unggah File
              </button>
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </button>
      </div>
    </form>
  )
}
