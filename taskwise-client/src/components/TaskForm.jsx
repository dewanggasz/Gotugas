"use client"

import { useState, useEffect, useRef } from "react"
import CollaboratorInput from "./CollaboratorInput"
import { uploadAttachment, addLinkAttachment, deleteAttachment } from "../services/api"
import {
  Paperclip,
  Link,
  Trash2,
  Loader2,
  ImageIcon,
  FileIcon,
  Filter,
  CheckCircle2,
  Circle,
  XCircle,
  PlayCircle,
  Zap, // Impor ikon untuk Prioritas
} from "lucide-react"

// Komponen CustomSelect yang konsisten
const CustomSelect = ({ options, value, onChange, placeholder, icon: Icon, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)

  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleOptionClick = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-slate-50 hover:border-slate-300 group min-h-[40px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-slate-500 group-hover:text-slate-700 transition-colors" />}
          <span className="font-medium text-slate-700 text-sm truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 text-slate-400 transition-all duration-200 group-hover:text-slate-600 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <ul
          className="absolute z-30 w-full bg-white border border-slate-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-auto"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-all duration-150 first:rounded-t-xl last:rounded-b-xl ${
                option.value === value
                  ? "bg-blue-50 font-semibold text-blue-900 border-l-3 border-blue-500"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Komponen untuk item lampiran
const AttachmentItem = ({ attachment, onDelete, isDeleting }) => {
  const getIcon = () => {
    if (attachment.type === "image") return <ImageIcon className="w-4 h-4 text-purple-600" />
    if (attachment.type === "link") return <Link className="w-4 h-4 text-blue-600" />
    return <FileIcon className="w-4 h-4 text-slate-600" />
  }

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0">{getIcon()}</div>
        <a
          href={attachment.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-800 hover:underline truncate font-medium"
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
  // State untuk data inti tugas
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("not_started")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState("medium") // State baru untuk prioritas
  const [collaborators, setCollaborators] = useState([])
  const [updateMessage, setUpdateMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State untuk manajemen lampiran
  const [linkUrl, setLinkUrl] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isAddingLink, setIsAddingLink] = useState(false)
  const [deletingAttachmentId, setDeletingAttachmentId] = useState(null)
  const [attachmentError, setAttachmentError] = useState("")
  const fileInputRef = useRef(null)

  // Mengisi form saat komponen dimuat atau data tugas berubah
  useEffect(() => {
    if (task) {
      setTitle(task.title || "")
      setDescription(task.description || "")
      setStatus(task.status || "not_started")
      setDueDate(task.due_date || "")
      setPriority(task.priority || "medium") // Set state prioritas saat edit
      const existingCollaborators = task.collaborators
        .filter((c) => c.id !== task.user?.id)
        .map((c) => ({ user_id: c.id, name: c.name, permission: c.permission }))
      setCollaborators(existingCollaborators)
    } else {
      // Reset untuk mode 'Create'
      setTitle("")
      setDescription("")
      setStatus("not_started")
      setDueDate("")
      setPriority("medium") // Reset state prioritas
      setCollaborators([])
    }
    setUpdateMessage("") // Hapus pesan pembaruan saat tugas berubah
  }, [task])

  // Handler untuk mengirimkan data inti tugas
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const taskData = {
      title,
      description,
      status,
      due_date: dueDate,
      priority, // Tambahkan prioritas ke data yang dikirim
      collaborators: collaborators.map((c) => ({ user_id: c.user_id, permission: c.permission })),
      update_message: updateMessage,
    }
    try {
      await onSubmit(taskData)
    } finally {
      setIsSubmitting(false)
    }
  }

  // --- Logika Instan untuk Lampiran ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setAttachmentError("")
    setIsUploading(true)
    try {
      await uploadAttachment(task.id, file)
      onAttachmentUpdate() // Callback untuk me-refresh data tugas di parent
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
    if (!linkUrl.trim()) {
      setAttachmentError("URL tidak boleh kosong.")
      return
    }

    setAttachmentError("")
    setIsAddingLink(true)
    try {
      await addLinkAttachment(task.id, linkUrl)
      setLinkUrl("")
      onAttachmentUpdate() // Callback untuk me-refresh data tugas di parent
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
        onAttachmentUpdate() // Callback untuk me-refresh data tugas di parent
      } catch (err) {
        setAttachmentError("Gagal menghapus lampiran.")
        console.error("Gagal menghapus lampiran:", err)
      } finally {
        setDeletingAttachmentId(null)
      }
    }
  }

  const statusOptions = [
    { value: "not_started", label: "Belum Dimulai", icon: Circle },
    { value: "in_progress", label: "Dikerjakan", icon: PlayCircle },
    { value: "completed", label: "Selesai", icon: CheckCircle2 },
    { value: "cancelled", label: "Dibatalkan", icon: XCircle },
  ]
  
  // Opsi baru untuk prioritas
  const priorityOptions = [
    { value: "high", label: "Tinggi", icon: Zap },
    { value: "medium", label: "Sedang", icon: Zap },
    { value: "low", label: "Rendah", icon: Zap },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bagian Form Utama */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-800 mb-2">
          Judul Tugas
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder:text-slate-400"
          placeholder="Masukkan judul tugas..."
          required
        />
      </div>

      <div>
        <label htmlFor="collaborators" className="block text-sm font-medium text-slate-800 mb-2">
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
        <label htmlFor="description" className="block text-sm font-medium text-slate-800 mb-2">
          Deskripsi
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder:text-slate-400"
          placeholder="Tambahkan deskripsi tugas..."
          rows="4"
        ></textarea>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Kolom Status */}
        <div className="sm:col-span-1">
          <label htmlFor="status" className="block text-sm font-medium text-slate-800 mb-2">
            Status
          </label>
          <CustomSelect
            options={statusOptions}
            value={status}
            onChange={setStatus}
            placeholder="Pilih Status"
            
          />
        </div>
        {/* Kolom Prioritas (BARU) */}
        <div className="sm:col-span-1">
          <label htmlFor="priority" className="block text-sm font-medium text-slate-800 mb-2">
            Prioritas
          </label>
          <CustomSelect
            options={priorityOptions}
            value={priority}
            onChange={setPriority}
            placeholder="Pilih Prioritas"
           
          />
        </div>
        {/* Kolom Jatuh Tempo */}
        <div className="sm:col-span-1">
          <label htmlFor="dueDate" className="block text-sm font-medium text-slate-800 mb-2">
            Jatuh Tempo
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {task && (
        <div>
          <label htmlFor="updateMessage" className="block text-sm font-medium text-slate-800 mb-2">
            Catatan Pembaruan (Opsional)
          </label>
          <textarea
            id="updateMessage"
            value={updateMessage}
            onChange={(e) => setUpdateMessage(e.target.value)}
            placeholder="Tambahkan catatan untuk menjelaskan perubahan Anda..."
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder:text-slate-400"
            rows="2"
          ></textarea>
        </div>
      )}

      {/* Bagian Lampiran (Hanya muncul dalam mode edit) */}
      {task && (
        <>
          <hr className="my-6 border-t border-slate-100" />
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 text-lg">Lampiran</h3>

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
                <p className="text-sm text-slate-500 py-2">Belum ada lampiran.</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow flex gap-2">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Tempel link di sini..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={handleAddLink}
                  disabled={isAddingLink}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors duration-200 flex-shrink-0 shadow-md"
                >
                  {isAddingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tambah"}
                </button>
              </div>

              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
                className="px-5 py-2.5 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 flex items-center justify-center disabled:opacity-50 text-sm font-medium transition-colors duration-200 flex-shrink-0 shadow-sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  </>
                ) : (
                  <Paperclip className="w-4 h-4 mr-2" />
                )}
                Unggah File
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tombol Aksi */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 transition-colors duration-200 text-sm font-medium shadow-sm"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium flex items-center justify-center shadow-md"
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
