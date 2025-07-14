import React, { useState, useEffect } from 'react';
import { uploadProfilePhoto, updateProfileInfo, updatePassword } from '../services/api';
import { UploadCloud, Save, KeyRound } from 'lucide-react';

// Komponen untuk menampilkan pesan feedback
const FeedbackMessage = ({ message }) => {
  if (!message.text) return null;
  const baseClasses = 'mb-4 text-sm p-3 rounded-md';
  const typeClasses = message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  return <p className={`${baseClasses} ${typeClasses}`}>{message.text}</p>;
};

export default function ProfilePage({ currentUser, onUpdateSuccess }) {
  // State untuk form foto
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState({ type: '', text: '' });

  // State untuk form info profil
  const [name, setName] = useState('');
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState({ type: '', text: '' });

  // State untuk form password
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
    }
  }, [currentUser]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setPhotoMessage({ type: 'error', text: 'Ukuran file terlalu besar. Maksimal 2MB.' });
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => { setPhotoPreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!photo) return;
    setIsUploading(true);
    setPhotoMessage({ type: '', text: '' });
    try {
      await uploadProfilePhoto(photo);
      setPhotoMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
      onUpdateSuccess();
      setPhoto(null);
      setPhotoPreview(null);
    } catch (error) {
      setPhotoMessage({ type: 'error', text: 'Gagal mengunggah foto. Pastikan file adalah gambar.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setIsSavingInfo(true);
    setInfoMessage({ type: '', text: '' });
    try {
      await updateProfileInfo({ name });
      setInfoMessage({ type: 'success', text: 'Informasi profil berhasil diperbarui!' });
      onUpdateSuccess();
    } catch (error) {
      setInfoMessage({ type: 'error', text: 'Gagal memperbarui profil.' });
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.password_confirmation) {
      setPasswordMessage({ type: 'error', text: 'Password baru dan konfirmasi tidak cocok.' });
      return;
    }
    setIsSavingPassword(true);
    setPasswordMessage({ type: '', text: '' });
    try {
      await updatePassword(passwordData);
      setPasswordMessage({ type: 'success', text: 'Password berhasil diperbarui!' });
      setPasswordData({ current_password: '', password: '', password_confirmation: '' }); // Reset form
    } catch (error) {
      setPasswordMessage({ type: 'error', text: error.response?.data?.message || 'Gagal memperbarui password.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Pengaturan Profil</h1>
      <div className="space-y-8">
        {/* --- Bagian Foto Profil --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Foto Profil</h2>
          <FeedbackMessage message={photoMessage} />
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <img src={photoPreview || currentUser.profile_photo_url} alt="Foto Profil" className="h-24 w-24 rounded-full object-cover ring-4 ring-blue-100" />
            <div className="flex-grow flex flex-col sm:flex-row items-center gap-4">
              <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              <label htmlFor="photo-upload" className="cursor-pointer w-full sm:w-auto text-center bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">Pilih Foto Baru</label>
              {photo && <button onClick={handleUpload} disabled={isUploading} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50"><UploadCloud className="w-4 h-4 mr-2" />{isUploading ? 'Mengunggah...' : 'Unggah & Simpan'}</button>}
            </div>
          </div>
        </div>

        {/* --- Bagian Informasi Profil --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Informasi Profil</h2>
          <form onSubmit={handleInfoSubmit} className="space-y-4 max-w-md">
            <FeedbackMessage message={infoMessage} />
            <div><label className="block text-sm font-medium text-gray-700">Nama</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" value={currentUser.email} disabled className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" /></div>
            <div className="text-right"><button type="submit" disabled={isSavingInfo} className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50"><Save className="w-4 h-4 mr-2" />{isSavingInfo ? 'Menyimpan...' : 'Simpan Perubahan'}</button></div>
          </form>
        </div>

        {/* --- Bagian Ubah Password --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Ubah Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <FeedbackMessage message={passwordMessage} />
            <div><label className="block text-sm font-medium text-gray-700">Password Saat Ini</label><input type="password" value={passwordData.current_password} onChange={(e) => setPasswordData(p => ({ ...p, current_password: e.target.value }))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Password Baru</label><input type="password" value={passwordData.password} onChange={(e) => setPasswordData(p => ({ ...p, password: e.target.value }))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required /></div>
            <div><label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label><input type="password" value={passwordData.password_confirmation} onChange={(e) => setPasswordData(p => ({ ...p, password_confirmation: e.target.value }))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required /></div>
            <div className="text-right"><button type="submit" disabled={isSavingPassword} className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50"><KeyRound className="w-4 h-4 mr-2" />{isSavingPassword ? 'Menyimpan...' : 'Ubah Password'}</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}
