"use client"

import { useState, useEffect } from "react"
import Modal from "./Modal" // Assuming this component exists and is styled
import ImageLightbox from "./ImageLightbox" // Assuming this component exists and is styled
import CommentSection from "./CommentSection" // Assuming this component exists and is styled
import { getTaskActivities } from "../services/api"
import {
  PlusCircle,
  RefreshCw,
  Pencil,
  FileText,
  MessageSquare,
  Pin,
  ImageIcon,
  LinkIcon,
  FileIcon,
  Paperclip,
  Calendar,
  User,
  Users,
} from "lucide-react"

// Helper component for each attachment item in detail view
const AttachmentDisplayItem = ({ attachment, onViewImage }) => {
  const getIcon = () => {
    if (attachment.type === "image") return <ImageIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
    if (attachment.type === "link") return <LinkIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
    return <FileIcon className="w-4 h-4 text-gray-600 flex-shrink-0" />
  }

  return attachment.type === "image" ? (
    <button
      onClick={() => onViewImage(attachment.file_url)}
      className="flex w-full items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors text-left"
    >
      {getIcon()}
      <span className="text-sm text-gray-800 truncate font-medium" title={attachment.original_name}>
        {attachment.original_name}
      </span>
    </button>
  ) : (
    <a
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors"
    >
      {getIcon()}
      <span className="text-sm text-gray-800 truncate font-medium" title={attachment.original_name}>
        {attachment.original_name}
      </span>
    </a>
  )
}

// Helper component for each item in the activity log
const ActivityItem = ({ activity }) => {
  const getIcon = (description) => {
    if (description.includes("membuat")) return <PlusCircle className="w-4 h-4 text-green-600" />
    if (description.includes("status")) return <RefreshCw className="w-4 h-4 text-blue-600" />
    if (description.includes("judul")) return <Pencil className="w-4 h-4 text-purple-600" />
    if (description.includes("deskripsi")) return <FileText className="w-4 h-4 text-yellow-600" />
    if (description.includes("pembaruan")) return <MessageSquare className="w-4 h-4 text-indigo-600" />
    if (description.includes("lampiran")) return <Paperclip className="w-4 h-4 text-gray-600" />
    if (description.includes("komentar")) return <MessageSquare className="w-4 h-4 text-indigo-600" />
    return <Pin className="w-4 h-4 text-gray-600" />
  }

  const renderDescription = (desc) => {
    const statusChangeRegex = /mengubah status dari '(.+?)' menjadi '(.+?)'/
    const match = desc.match(statusChangeRegex)
    if (match) {
      const fromStatus = match[1].replace(/_/g, " ")
      const toStatus = match[2].replace(/_/g, " ")
      const statusStyles = {
        not_started: "text-gray-600 font-semibold capitalize",
        in_progress: "text-blue-600 font-semibold capitalize",
        completed: "text-green-600 font-semibold capitalize",
        cancelled: "text-red-600 font-semibold capitalize",
      }
      return (
        <>
          mengubah status dari <span className={statusStyles[match[1]] || ""}>'{fromStatus}'</span> menjadi{" "}
          <span className={statusStyles[match[2]] || ""}>'{toStatus}'</span>
        </>
      )
    }
    return desc
  }

  // Removed formatActivityDate helper as the API provides relative time strings
  return (
    <li className="flex gap-4 items-start">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
        {getIcon(activity.description)}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800 leading-snug">
          <span className="font-semibold">{activity.user?.name || "Pengguna"}</span>{" "}
          {renderDescription(activity.description)}
        </p>
        {/* Directly display the created_at string */}
        <p className="text-xs text-gray-500 mt-1">{activity.created_at}</p>
      </div>
    </li>
  )
}

export default function TaskDetailModal({ isOpen, onClose, task, currentUser }) {
  const [activities, setActivities] = useState([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    if (isOpen && task) {
      const fetchActivities = async () => {
        setIsLoadingActivities(true)
        try {
          const response = await getTaskActivities(task.id)
          setActivities(response.data.data)
        } catch (error) {
          console.error("Gagal memuat aktivitas tugas", error)
        } finally {
          setIsLoadingActivities(false)
        }
      }
      fetchActivities()
    }
  }, [isOpen, task])

  if (!task) return null

  const formatDate = (dateString) => {
    // Log the raw date string and the parsed date object for debugging
    console.log("Raw due_date string:", dateString)
    const date = new Date(dateString)
    console.log("Parsed Date object for due_date:", date)

    if (!dateString || isNaN(date.getTime())) {
      return "N/A" // Return N/A if the date string is empty/null or parsing results in an invalid date
    }
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
  }

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      not_started: { label: "Belum Dimulai", color: "bg-gray-100 text-gray-700 border-gray-200" },
      in_progress: { label: "Dikerjakan", color: "bg-blue-100 text-blue-700 border-blue-200" },
      completed: { label: "Selesai", color: "bg-green-100 text-green-700 border-green-200" },
      cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-700 border-red-200" },
    }
    const config = statusConfig[status] || statusConfig.not_started
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Detail & Riwayat Tugas">
        <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-4 custom-scrollbar">
          {/* Task Details Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold text-gray-900 leading-tight">{task.title}</h3>
              <StatusBadge status={task.status} />
            </div>
            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
              {task.description || "Tidak ada deskripsi."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm border-t border-gray-100 pt-6">
              <div>
                <label className="font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-400" /> Jatuh Tempo
                </label>
                <p className="text-gray-800">{formatDate(task.due_date)}</p>
              </div>
              <div>
                <label className="font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-400" /> Dibuat Oleh
                </label>
                <p className="text-gray-800">{task.user?.name}</p>
              </div>
              <div>
                <label className="font-medium text-gray-500 flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-gray-400" /> Kolaborator
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {task.collaborators?.length > 0 ? (
                    task.collaborators.map((c) => (
                      <span
                        key={c.id}
                        className="bg-gray-100 text-gray-800 px-2.5 py-1 text-xs rounded-full font-medium"
                      >
                        {c.name} ({c.permission})
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">Tidak ada kolaborator.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          {task.attachments && task.attachments.length > 0 && (
            <>
              <hr className="border-t border-gray-100" />
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 text-lg">Lampiran</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {task.attachments.map((att) => (
                    <AttachmentDisplayItem key={att.id} attachment={att} onViewImage={setLightboxImage} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Comments Section */}
          <hr className="border-t border-gray-100" />
          <CommentSection taskId={task.id} currentUser={currentUser} task={task} />

          {/* Activity History Section */}
          <hr className="border-t border-gray-100" />
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 text-lg">Riwayat Aktivitas</h4>
            {isLoadingActivities ? (
              <div className="flex items-center justify-center py-4 text-gray-500">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
                <span>Memuat riwayat...</span>
              </div>
            ) : activities.length > 0 ? (
              <ul className="space-y-4">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Tidak ada riwayat aktivitas.</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Lightbox component for displaying images */}
      <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
    </>
  )
}
