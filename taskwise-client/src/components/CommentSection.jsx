"use client"

import { useState, useEffect } from "react"
import { getTaskComments, postTaskComment } from "../services/api"
import { Send, MessageSquare, Loader2 } from "lucide-react" // Removed Clock icon

// Removed formatDateTime helper as the API provides relative time strings

// Component for the reply form
const ReplyForm = ({ taskId, parentId, onCommentPosted, currentUser }) => {
  const [reply, setReply] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reply.trim()) return
    setIsPosting(true)
    try {
      await postTaskComment(taskId, { body: reply, parent_id: parentId })
      setReply("")
      onCommentPosted() // Call callback to refresh
    } catch (error) {
      console.error("Gagal mengirim balasan:", error)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3 mt-3 pl-10">
      <img
        src={currentUser?.profile_photo_url || "/placeholder.svg"}
        alt="Avatar Anda"
        className="h-7 w-7 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Tulis balasan..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm resize-y min-h-[40px]"
          rows="1"
        />
        <button
          type="submit"
          disabled={isPosting}
          className="mt-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm font-medium disabled:opacity-50 transition-colors duration-200 flex items-center justify-center"
        >
          {isPosting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...
            </>
          ) : (
            "Balas"
          )}
        </button>
      </div>
    </form>
  )
}

// Component for a single comment item (and its replies)
const CommentItem = ({ comment, taskId, onCommentPosted, currentUser, canComment }) => {
  const [showReplyForm, setShowReplyForm] = useState(false)

  return (
    <li className="flex gap-4 items-start">
      <img
        src={comment.user?.profile_photo_url || "/placeholder.svg"}
        alt={comment.user?.name || "Pengguna"}
        className="h-9 w-9 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-sm text-gray-900">{comment.user?.name || "Pengguna"}</span>
            {/* Directly display the created_at string */}
            <span className="text-xs text-gray-500">{comment.created_at}</span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
        </div>
        {canComment && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-gray-600 hover:text-gray-900 hover:underline mt-2 ml-2 transition-colors duration-200"
          >
            {showReplyForm ? "Batal Balas" : "Balas"}
          </button>
        )}
        {showReplyForm && (
          <ReplyForm
            taskId={taskId}
            parentId={comment.id}
            onCommentPosted={() => {
              setShowReplyForm(false)
              onCommentPosted()
            }}
            currentUser={currentUser}
          />
        )}
        {comment.replies && comment.replies.length > 0 && (
          <ul className="mt-4 space-y-4 pl-6 border-l border-gray-200">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                taskId={taskId}
                onCommentPosted={onCommentPosted}
                currentUser={currentUser}
                canComment={canComment}
              />
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

export default function CommentSection({ taskId, currentUser, task }) {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState("")

  const fetchComments = async () => {
    if (!taskId) return
    setIsLoading(true)
    try {
      const response = await getTaskComments(taskId)
      setComments(response.data.data)
    } catch (err) {
      console.error("Gagal memuat komentar:", err)
      setError("Tidak dapat memuat komentar.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [taskId])

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    setIsPosting(true)
    setError("")
    try {
      await postTaskComment(taskId, { body: newComment, parent_id: null })
      setNewComment("")
      fetchComments()
    } catch (err) {
      setError("Gagal mengirim komentar.")
      console.error("Gagal mengirim komentar:", err)
    } finally {
      setIsPosting(false)
    }
  }

  // Check if current user is allowed to comment
  const canComment =
    currentUser?.role === "admin" ||
    task.collaborators.some((c) => c.id === currentUser?.id && (c.permission === "edit" || c.permission === "comment"))

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-gray-600" />
        Diskusi
      </h4>

      {canComment && (
        <form onSubmit={handlePostComment} className="flex items-start gap-4">
          <img
            src={currentUser?.profile_photo_url || "/placeholder.svg"}
            alt="Avatar Anda"
            className="h-10 w-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm resize-y min-h-[60px]"
              rows="2"
            />
            <button
              type="submit"
              disabled={isPosting}
              className="mt-3 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 text-sm font-medium flex items-center justify-center disabled:opacity-50 transition-colors duration-200"
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Kirim Komentar
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2"></div>
          <span>Memuat komentar...</span>
        </div>
      ) : (
        <ul className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                taskId={taskId}
                onCommentPosted={fetchComments}
                currentUser={currentUser}
                canComment={canComment}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">Belum ada komentar. Jadilah yang pertama!</p>
          )}
        </ul>
      )}
    </div>
  )
}
