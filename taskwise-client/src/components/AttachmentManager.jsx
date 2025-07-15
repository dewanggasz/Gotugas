import React, { useState, useRef } from 'react';
import { uploadAttachment, addLinkAttachment, deleteAttachment } from '../services/api';
import { Paperclip, Link, Trash2, Loader2, Image as ImageIcon, File as FileIcon } from 'lucide-react';

// Komponen kecil untuk setiap item lampiran
const AttachmentItem = ({ attachment, onDelete }) => {
  const getIcon = () => {
    if (attachment.type === 'image') return <ImageIcon className="w-5 h-5 text-purple-600" />;
    if (attachment.type === 'link') return <Link className="w-5 h-5 text-blue-600" />;
    return <FileIcon className="w-5 h-5 text-gray-600" />;
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
      <div className="flex items-center gap-3 min-w-0">
        {getIcon()}
        <a
          href={attachment.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-800 hover:underline truncate"
          title={attachment.original_name}
        >
          {attachment.original_name}
        </a>
      </div>
      <button onClick={() => onDelete(attachment.id)} className="text-red-500 hover:text-red-700 p-1 flex-shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function AttachmentManager({ task, onUpdate }) {
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setIsUploading(true);
    try {
      await uploadAttachment(task.id, file);
      onUpdate(); // Panggil callback untuk me-refresh data tugas
    } catch (err) {
      setError("Gagal mengunggah file. Pastikan ukuran tidak melebihi 5MB.");
      console.error("Gagal mengunggah file:", err);
    } finally {
      setIsUploading(false);
      // Reset input file agar bisa memilih file yang sama lagi
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    setError('');
    setIsAddingLink(true);
    try {
      await addLinkAttachment(task.id, linkUrl);
      setLinkUrl('');
      onUpdate(); // Panggil callback untuk me-refresh data tugas
    } catch (err) {
      setError("Gagal menambah link. Pastikan URL valid.");
      console.error("Gagal menambah link:", err);
    } finally {
      setIsAddingLink(false);
    }
  };
  
  const handleDelete = async (attachmentId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus lampiran ini?')) {
        setError('');
        try {
            await deleteAttachment(attachmentId);
            onUpdate(); // Panggil callback untuk me-refresh data tugas
        } catch (err) {
            setError("Gagal menghapus lampiran.");
            console.error("Gagal menghapus lampiran:", err);
        }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700">Lampiran</h3>
      
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
        {task.attachments?.length > 0 ? (
          task.attachments.map(att => (
            <AttachmentItem key={att.id} attachment={att} onDelete={handleDelete} />
          ))
        ) : (
          <p className="text-sm text-gray-500">Belum ada lampiran.</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleAddLink} className="flex-grow flex gap-2">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Tempel link di sini..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <button type="submit" disabled={isAddingLink} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm">
            {isAddingLink ? '...' : 'Tambah'}
          </button>
        </form>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center justify-center disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Paperclip className="w-5 h-5 mr-2" />
          )}
          Unggah File
        </button>
      </div>
    </div>
  );
}
