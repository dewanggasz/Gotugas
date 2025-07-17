"use client"

import React from "react"

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
    return <FileIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
  }

  return attachment.type === "image" ? (
    <button
      onClick={() => onViewImage(attachment.file_url)}
      className="flex w-full items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition-colors text-left"
    >
      {getIcon()}
      <span className="text-sm text-slate-800 truncate font-medium" title={attachment.original_name}>
        {attachment.original_name}
      </span>
    </button>
  ) : (
    <a
      href={attachment.file_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-100 transition-colors"
    >
      {getIcon()}
      <span className="text-sm text-slate-800 truncate font-medium" title={attachment.original_name}>
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
    if (description.includes("lampiran")) return <Paperclip className="w-4 h-4 text-slate-600" />
    if (description.includes("komentar")) return <MessageSquare className="w-4 h-4 text-indigo-600" />
    return <Pin className="w-4 h-4 text-slate-600" />
  }

  const renderDescription = (desc) => {
    const statusChangeRegex = /mengubah status dari '(.+?)' menjadi '(.+?)'/
    const match = desc.match(statusChangeRegex)
    if (match) {
      const fromStatus = match[1].replace(/_/g, " ")
      const toStatus = match[2].replace(/_/g, " ")
      const statusStyles = {
        not_started: "text-slate-600 font-semibold capitalize",
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

  return (
    <li className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
        {getIcon(activity.description)}
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-800 leading-snug">
          <span className="font-semibold">{activity.user?.name || "Pengguna"}</span>{" "}
          {renderDescription(activity.description)}
        </p>
        <p className="text-xs text-slate-500 mt-1">{activity.created_at}</p>
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
    const date = new Date(dateString)
    if (!dateString || isNaN(date.getTime())) {
      return "N/A"
    }
    return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
  }

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      not_started: { label: "Belum Dimulai", color: "bg-slate-100 text-slate-700 border-slate-200" },
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
              <h3 className="text-2xl font-semibold text-slate-900 leading-tight break-words max-w-[calc(100%-120px)]">
                {task.title}
              </h3>
              <StatusBadge status={task.status} />
            </div>
            <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed break-words">
              {task.description || "Tidak ada deskripsi."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm border-t border-slate-100 pt-6">
              <div>
                <label className="font-medium text-slate-500 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-slate-400" /> Jatuh Tempo
                </label>
                <p className="text-slate-800 text-xs">{formatDate(task.due_date)}</p>
              </div>
              <div>
                <label className="font-medium text-slate-500 flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-slate-400" /> Dibuat Oleh
                </label>
                <p className="text-slate-800 text-xs">{task.user?.name}</p>
              </div>
              <div>
                <label className="font-medium text-slate-500 flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-slate-400" /> Kolaborator
                </label>
                <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-0.5 mt-0.5 text-[0.625rem]">
                  {task.collaborators?.length > 0 ? (
                    task.collaborators.map((c) => (
                      <React.Fragment key={c.id}>
                        <span className="font-medium text-slate-800 break-words" title={c.name}>
                          {c.name}
                        </span>
                        <span className="text-slate-500">({c.permission})</span>
                      </React.Fragment>
                    ))
                  ) : (
                    <span className="text-slate-500 text-xs col-span-2">Tidak ada kolaborator.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          {task.attachments && task.attachments.length > 0 && (
            <>
              <hr className="border-t border-slate-100" />
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-800 text-lg">Lampiran</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {task.attachments.map((att) => (
                    <AttachmentDisplayItem key={att.id} attachment={att} onViewImage={setLightboxImage} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Comments Section */}
          <hr className="border-t border-slate-100" />
          <CommentSection taskId={task.id} currentUser={currentUser} task={task} />

          {/* Activity History Section */}
          <hr className="border-t border-slate-100" />
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800 text-lg">Riwayat Aktivitas</h4>
            {isLoadingActivities ? (
              <div className="flex items-center justify-center py-4 text-slate-500">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
                <span>Memuat riwayat...</span>
              </div>
            ) : activities.length > 0 ? (
              <ul className="space-y-4">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">Tidak ada riwayat aktivitas.</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Lightbox component for displaying images */}
      <ImageLightbox imageUrl={lightboxImage} onClose={() => setLightboxImage(null)} />
    </>
  )
}
