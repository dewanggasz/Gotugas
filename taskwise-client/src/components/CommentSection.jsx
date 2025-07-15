import React, { useState, useEffect } from 'react';
import { getTaskComments, postTaskComment } from '../services/api';
import { Send } from 'lucide-react';

// Komponen untuk satu item komentar
const CommentItem = ({ comment }) => (
  <li className="flex gap-3">
    <img 
      src={comment.user.profile_photo_url} 
      alt={comment.user.name}
      className="h-8 w-8 rounded-full object-cover flex-shrink-0"
    />
    <div className="flex-1 bg-gray-100 p-3 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-bold text-sm text-gray-800">{comment.user.name}</span>
        <span className="text-xs text-gray-500">{comment.created_at}</span>
      </div>
      <p className="text-sm text-gray-700 mt-1">{comment.body}</p>
    </div>
  </li>
);

export default function CommentSection({ taskId, currentUser }) {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  // Fungsi untuk mengambil komentar
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

  // Handler untuk mengirim komentar baru
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsPosting(true);
    setError('');
    try {
      await postTaskComment(taskId, { body: newComment });
      setNewComment('');
      fetchComments(); // Ambil ulang daftar komentar setelah berhasil
    } catch (err) {
      setError("Gagal mengirim komentar.");
      console.error("Gagal mengirim komentar:", err);
    } finally {
      setIsPosting(false);
    }
  };

  // Hanya admin yang bisa melihat form komentar
  const canComment = currentUser?.role === 'admin';

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-700">Komentar</h4>
      
      {/* Form untuk menambah komentar (hanya untuk admin) */}
      {canComment && (
        <form onSubmit={handlePostComment} className="flex items-start gap-3">
          <img 
            src={currentUser.profile_photo_url} 
            alt="My Avatar"
            className="h-8 w-8 rounded-full object-cover"
          />
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

      {/* Daftar Komentar */}
      {isLoading ? (
        <p>Memuat komentar...</p>
      ) : (
        <ul className="space-y-4">
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            !canComment && <p className="text-sm text-gray-500">Belum ada komentar.</p>
          )}
        </ul>
      )}
    </div>
  );
}
