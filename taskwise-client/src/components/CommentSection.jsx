import React, { useState, useEffect } from 'react';
import { getTaskComments, postTaskComment } from '../services/api';
import { Send, MessageSquare } from 'lucide-react';

// Komponen untuk form balasan
const ReplyForm = ({ taskId, parentId, onCommentPosted, currentUser }) => {
  const [reply, setReply] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setIsPosting(true);
    try {
      await postTaskComment(taskId, { body: reply, parent_id: parentId });
      setReply('');
      onCommentPosted(); // Panggil callback untuk refresh
    } catch (error) {
      console.error("Gagal mengirim balasan:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2 mt-2 ml-10">
      <img src={currentUser.profile_photo_url} alt="Avatar Anda" className="h-6 w-6 rounded-full mt-1" />
      <div className="flex-1">
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Tulis balasan..."
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          rows="1"
        />
        <button type="submit" disabled={isPosting} className="mt-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xs font-medium disabled:opacity-50">
          {isPosting ? '...' : 'Balas'}
        </button>
      </div>
    </form>
  );
};

// Komponen untuk satu item komentar (dan balasannya)
const CommentItem = ({ comment, taskId, onCommentPosted, currentUser, canComment }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  return (
    <li className="flex gap-3">
      <img src={comment.user.profile_photo_url} alt={comment.user.name} className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
      <div className="flex-1">
        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm text-gray-800">{comment.user.name}</span>
            <span className="text-xs text-gray-500">{comment.created_at}</span>
          </div>
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.body}</p>
        </div>
        {canComment && (
          <button onClick={() => setShowReplyForm(!showReplyForm)} className="text-xs text-blue-600 hover:underline mt-1">
            Balas
          </button>
        )}
        {showReplyForm && (
          <ReplyForm
            taskId={taskId}
            parentId={comment.id}
            onCommentPosted={() => {
              setShowReplyForm(false);
              onCommentPosted();
            }}
            currentUser={currentUser}
          />
        )}
        {comment.replies && comment.replies.length > 0 && (
          <ul className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
            {comment.replies.map(reply => (
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
  );
};

export default function CommentSection({ taskId, currentUser, task }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const response = await getTaskComments(taskId);
      setComments(response.data.data);
    } catch (err) {
      console.error("Gagal memuat komentar:", err);
      setError("Tidak dapat memuat komentar.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsPosting(true);
    setError('');
    try {
      await postTaskComment(taskId, { body: newComment, parent_id: null });
      setNewComment('');
      fetchComments();
    } catch (err) {
      setError("Gagal mengirim komentar.");
      console.error("Gagal mengirim komentar:", err);
    } finally {
      setIsPosting(false);
    }
  };

  // Cek apakah user saat ini boleh berkomentar
  const canComment = currentUser?.role === 'admin' || task.collaborators.some(c => c.id === currentUser?.id && (c.permission === 'edit' || c.permission === 'comment'));

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Diskusi
      </h4>
      
      {canComment && (
        <form onSubmit={handlePostComment} className="flex items-start gap-3">
          <img src={currentUser.profile_photo_url} alt="Avatar Anda" className="h-8 w-8 rounded-full object-cover" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              rows="2"
            />
            <button 
              type="submit" 
              disabled={isPosting}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              {isPosting ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
        </form>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {isLoading ? (
        <p>Memuat komentar...</p>
      ) : (
        <ul className="space-y-4">
          {comments.length > 0 ? (
            comments.map(comment => (
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
            <p className="text-sm text-gray-500 text-center py-4">Belum ada komentar. Jadilah yang pertama!</p>
          )}
        </ul>
      )}
    </div>
  );
}
