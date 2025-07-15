import React, { useState, useEffect, useRef } from 'react';
import CollaboratorInput from './CollaboratorInput';
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
        <a href={attachment.file_url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-800 hover:underline truncate" title={attachment.original_name}>
          {attachment.original_name}
        </a>
      </div>
    <button
    type="button"
    data-ignore-close
    onClick={() => onDelete(attachment.id)}
    className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
  >
    <Trash2 className="w-4 h-4 data-ignore-close" />
  </button>
    </div>
  );
};

export default function TaskForm({ onSubmit, onCancel, task, users = [], currentUser, onAttachmentUpdate }) {
  // State untuk data inti tugas
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('not_started');
  const [dueDate, setDueDate] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [updateMessage, setUpdateMessage] = useState('');

  // State khusus untuk manajemen lampiran
  const [linkUrl, setLinkUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef(null);

  // Mengisi form saat komponen dimuat atau data tugas berubah
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'not_started');
      setDueDate(task.due_date || '');
      const existingCollaborators = task.collaborators
        .filter(c => c.id !== task.user.id)
        .map(c => ({ user_id: c.id, name: c.name, permission: c.permission }));
      setCollaborators(existingCollaborators);
    } else {
      // Reset untuk mode 'Create'
      setTitle('');
      setDescription('');
      setStatus('not_started');
      setDueDate('');
      setCollaborators([]);
    }
    setUpdateMessage('');
  }, [task]);

  // Handler untuk menyimpan perubahan pada data inti tugas
  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = { 
      title, 
      description, 
      status, 
      due_date: dueDate,
      collaborators: collaborators.map(c => ({ user_id: c.user_id, permission: c.permission })),
      update_message: updateMessage,
    };
    onSubmit(taskData);
  };

  // --- Logika Instan untuk Lampiran ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachmentError('');
    setIsUploading(true);
    try {
      await uploadAttachment(task.id, file);
      onAttachmentUpdate(); // Refresh data tugas
    } catch (err) {
      setAttachmentError("Gagal mengunggah file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;
    setAttachmentError('');
    setIsAddingLink(true);
    try {
      await addLinkAttachment(task.id, linkUrl);
      setLinkUrl('');
      onAttachmentUpdate();
    } catch (err) {
      setAttachmentError("Gagal menambah link.");
    } finally {
      setIsAddingLink(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus lampiran ini?')) {
      setAttachmentError('');
      try {
        await deleteAttachment(attachmentId);
        onAttachmentUpdate();
      } catch (err) {
        setAttachmentError("Gagal menghapus lampiran.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Bagian Form Utama */}
      <div className="mb-4"><label htmlFor="title" className="block text-gray-700 mb-2">Judul</label><input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required /></div>
      <div className="mb-4"><CollaboratorInput allUsers={users} collaborators={collaborators} setCollaborators={setCollaborators} currentUser={currentUser} /></div>
      <div className="mb-4"><label htmlFor="description" className="block text-gray-700 mb-2">Deskripsi</label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea></div>
      <div className="grid grid-cols-2 gap-4 mb-6"><div><label htmlFor="status" className="block text-gray-700 mb-2">Status</label><select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"><option value="not_started">Belum Dimulai</option><option value="in_progress">Dikerjakan</option><option value="completed">Selesai</option><option value="cancelled">Dibatalkan</option></select></div><div><label htmlFor="dueDate" className="block text-gray-700 mb-2">Jatuh Tempo</label><input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div></div>
      {task && <div className="mb-6"><label htmlFor="updateMessage" className="block text-gray-700 mb-2">Catatan Pembaruan (Opsional)</label><textarea id="updateMessage" value={updateMessage} onChange={(e) => setUpdateMessage(e.target.value)} placeholder="Tambahkan catatan untuk menjelaskan perubahan Anda..." className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" rows="2"></textarea></div>}
      
      {/* Bagian Lampiran (Hanya muncul saat mode edit) */}
      {task && (
        <>
          <hr className="my-6" />
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Lampiran</h3>
            {attachmentError && <p className="text-sm text-red-600">{attachmentError}</p>}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {task.attachments?.length > 0 ? task.attachments.map(att => <AttachmentItem key={att.id} attachment={att} onDelete={handleDeleteAttachment} />) : <p className="text-sm text-gray-500">Belum ada lampiran.</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex gap-2">
                <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
                <button type="button" onClick={handleAddLink}>Tambah</button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <button type="button" onClick={() => fileInputRef.current.click()} disabled={isUploading} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center justify-center disabled:opacity-50">
                {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Paperclip className="w-5 h-5 mr-2" />} Unggah File
              </button>
            </div>
          </div>
        </>
      )}

      {/* Tombol Aksi Utama */}
      <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan Perubahan</button>
      </div>
    </form>
  );
}
