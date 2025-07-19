import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export default function JournalNoteForm({ isOpen, onClose, onSubmit, initialNote }) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setContent(initialNote?.content || '');
    }
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ content });
      onClose();
    } catch (error) {
      console.error("Gagal menyimpan catatan:", error);
      alert("Gagal menyimpan catatan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <h2 className="text-lg font-bold text-slate-800">
            {initialNote ? 'Edit Catatan' : 'Buat Catatan Baru'}
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis catatan jurnalmu di sini..."
              className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base leading-relaxed text-slate-800 resize-none"
              autoFocus
            />
          </div>
          <div className="flex items-center justify-end gap-3 rounded-b-xl border-t border-slate-200 bg-slate-50 p-4">
            <button type="button" onClick={onClose} className="rounded-lg bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition-all">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-all disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
              {initialNote ? 'Simpan Perubahan' : 'Simpan Catatan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
