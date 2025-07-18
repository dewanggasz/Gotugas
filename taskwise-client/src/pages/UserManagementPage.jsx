import React, { useState, useEffect, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';
import UserForm from '../components/UserForm';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

// --- GUNAKAN KOMPONEN PAGINATION YANG SAMA SEPERTI DI TASKSPAGE ---
const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.last_page <= 1) return null;

  // Fungsi untuk membuat nomor halaman yang terlihat, dengan "..."
  const getVisiblePages = () => {
    const current = meta.current_page;
    const total = meta.last_page;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    range.push(1);
    for (let i = current - delta; i <= current + delta; i++) {
        if (i < total && i > 1) {
            range.push(i);
        }
    }
    range.push(total);

    for (let i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-600 font-medium">
          Menampilkan <span className="text-slate-900 font-semibold">{meta.from}</span> - <span className="text-slate-900 font-semibold">{meta.to}</span> dari <span className="text-slate-900 font-semibold">{meta.total}</span> hasil
        </p>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(meta.current_page - 1)}
            disabled={meta.current_page === 1}
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center space-x-1">
            {getVisiblePages().map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-2 py-2 text-slate-400 font-medium text-sm">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    page === meta.current_page
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => onPageChange(meta.current_page + 1)}
            disabled={meta.current_page === meta.last_page}
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};


// Sisa dari file UserManagementPage.jsx (tidak ada perubahan di bawah ini)
const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [paginationMeta, setPaginationMeta] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = useCallback(async (page) => {
    try {
      setLoading(true);
      const response = await getUsers(page);
      setUsers(response.data.data);
      setPaginationMeta(response.data.meta);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data pengguna. Anda mungkin tidak memiliki akses.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [fetchUsers, currentPage]);

  const handlePageChange = (newPage) => {
      if (newPage > 0 && newPage <= paginationMeta.last_page) {
          setCurrentPage(newPage);
      }
  };

  const handleOpenModal = (user = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (userData) => {
    const dataToSend = { ...userData };
    if (editingUser && !dataToSend.password) {
        delete dataToSend.password;
        delete dataToSend.password_confirmation;
    }
    
    if (editingUser) {
      await updateUser(editingUser.id, dataToSend);
    } else {
      await createUser(dataToSend);
    }
    fetchUsers(currentPage); 
  };
  
  const handleDelete = async (userId) => {
      if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
          try {
              await deleteUser(userId);
              if (users.length === 1 && currentPage > 1) {
                  setCurrentPage(currentPage - 1);
              } else {
                  fetchUsers(currentPage);
              }
          } catch (error) {
              alert('Gagal menghapus pengguna. Anda tidak dapat menghapus diri sendiri.');
              console.error(error);
          }
      }
  };

  if (loading && !paginationMeta) return <div>Memuat data pengguna...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
        <button onClick={() => handleOpenModal()} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peran</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                          <img className="h-8 w-8 rounded-full mr-3 object-cover" src={user.profile_photo_url} alt={user.name} />
                          <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {user.role}
                  </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5" />
                  </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Komponen Pagination akan dirender di sini */}
        <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
      </div>

      <UserForm 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingUser}
      />
    </div>
  );
};

export default UserManagementPage;