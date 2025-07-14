import React, { useState } from 'react';
import { uploadProfilePhoto } from '../services/api';
import { UploadCloud } from 'lucide-react';

export default function ProfilePage({ currentUser, onUpdateSuccess }) {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fungsi ini dijalankan saat pengguna memilih file
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (misalnya, maks 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran file terlalu besar. Maksimal 2MB.' });
        return;
      }
      setPhoto(file);
      // Buat pratinjau gambar
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fungsi ini dijalankan saat tombol "Unggah" diklik
  const handleUpload = async () => {
    if (!photo) return;
    setIsUploading(true);
    setMessage({ type: '', text: '' });
    try {
      await uploadProfilePhoto(photo);
      setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
      onUpdateSuccess(); // Callback untuk me-refresh data pengguna di App.jsx
      setPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengunggah foto. Pastikan file adalah gambar.' });
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Pengaturan Profil</h1>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Foto Profil</h2>
        
        {/* Tampilkan pesan sukses atau error */}
        {message.text && (
          <p className={`mb-4 text-sm p-3 rounded-md ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Tampilan foto profil saat ini atau pratinjau */}
          <img
            src={photoPreview || currentUser.profile_photo_url}
            alt="Foto Profil"
            className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-100"
          />
          <div className="flex-grow flex flex-col sm:flex-row items-center gap-4">
            {/* Input file yang tersembunyi */}
            <input
              type="file"
              id="photo-upload"
              className="hidden"
              accept="image/jpeg, image/png, image/gif"
              onChange={handlePhotoChange}
            />
            {/* Tombol untuk membuka dialog file */}
            <label
              htmlFor="photo-upload"
              className="cursor-pointer w-full sm:w-auto text-center bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Pilih Foto Baru
            </label>
            
            {/* Tombol Unggah hanya muncul jika ada foto yang dipilih */}
            {photo && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                {isUploading ? 'Mengunggah...' : 'Unggah & Simpan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
