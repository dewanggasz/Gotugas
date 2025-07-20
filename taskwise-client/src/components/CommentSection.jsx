"use client"

import { useState, useEffect } from "react"
import { getTaskComments, postTaskComment } from "../services/api"
import { Send, MessageSquare, Loader2 } from "lucide-react"

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
        className="h-7 w-7 rounded-full object-cover flex-shrink-0 ring-1 ring-slate-200"
      />
      <div className="flex-1">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Tulis balasan..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm resize-y min-h-[40px] placeholder:text-slate-400"
          rows="1"
        />
        <button
          type="submit"
          disabled={isPosting}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition-colors duration-200 flex items-center justify-center shadow-sm"
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
    <li className="flex gap-4 items-start bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200">
      <img
        src={comment.user?.profile_photo_url || "/placeholder.svg"}
        alt={comment.user?.name || "Pengguna"}
        className="h-9 w-9 rounded-full object-cover flex-shrink-0 ring-1 ring-slate-200"
      />
      <div className="flex-1">
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-sm text-slate-900">{comment.user?.name || "Pengguna"}</span>
            <span className="text-xs text-slate-500">{comment.created_at}</span>
          </div>
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
        </div>
        {canComment && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-2 ml-2 transition-colors duration-200"
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
          <ul className="mt-4 space-y-4 pl-6 sm:pl-8 border-l border-blue-200">
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
    currentUser?.role === "semi_admin" ||
    task.collaborators.some((c) => c.id === currentUser?.id && (c.permission === "edit" || c.permission === "comment"))

  return (
    <div className="space-y-6">
      <h4 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-slate-600" />
        Diskusi
      </h4>

      {canComment && (
        <form onSubmit={handlePostComment} className="flex items-start gap-4">
          <img
            src={currentUser?.profile_photo_url || "/placeholder.svg"}
            alt="Avatar Anda"
            className="h-10 w-10 rounded-full object-cover flex-shrink-0 ring-1 ring-slate-200"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm resize-y min-h-[60px] placeholder:text-slate-400"
              rows="2"
            />
            <button
              type="submit"
              disabled={isPosting}
              className="mt-3 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium flex items-center justify-center disabled:opacity-50 transition-colors duration-200 shadow-md"
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
        <div className="flex items-center justify-center py-6 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mr-2"></div>
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
            <p className="text-sm text-slate-500 text-center py-6">Belum ada komentar. Jadilah yang pertama!</p>
          )}
        </ul>
      )}
    </div>
  )
}
