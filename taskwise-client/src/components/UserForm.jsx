import React, { useState, useEffect } from 'react';

const UserForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState({});

  const isEditing = !!initialData;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        role: initialData.role,
        password: '',
        password_confirmation: '',
      });
    } else {
      // Reset form untuk mode "Tambah Baru"
      setFormData({
        name: '',
        email: '',
        role: 'employee',
        password: '',
        password_confirmation: '',
      });
    }
    setErrors({}); // Selalu reset error saat modal dibuka/data berubah
  }, [initialData, isEditing, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose(); // Tutup modal jika berhasil
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        console.error('An unexpected error occurred:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nama */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
            </div>

            {/* Peran */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Peran</label>
              <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role[0]}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required={!isEditing} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
              {isEditing && <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah password.</p>}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
              <input type="password" name="password_confirmation" id="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required={!isEditing || !!formData.password} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Batal</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;