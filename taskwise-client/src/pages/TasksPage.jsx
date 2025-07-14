import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getUsers, getUser } from '../services/api';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';
import TaskDetailModal from '../components/TaskDetailModal';
import { Eye, Pencil, Trash2 } from 'lucide-react';

// (Komponen Pagination dan useDebounce tidak berubah)
const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.last_page <= 1) return null;
  return (
    <div className="mt-8 flex justify-between items-center">
      <p className="text-sm text-gray-700">Menampilkan <span className="font-medium">{meta.from}</span> sampai <span className="font-medium">{meta.to}</span> dari <span className="font-medium">{meta.total}</span> hasil</p>
      <div className="flex items-center space-x-2">
        <button onClick={() => onPageChange(meta.current_page - 1)} disabled={meta.current_page === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Sebelumnya</button>
        <button onClick={() => onPageChange(meta.current_page + 1)} disabled={meta.current_page === meta.last_page} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Berikutnya</button>
      </div>
    </div>
  );
};
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
    return () => { clearTimeout(handler); };
  }, [value, delay]);
  return debouncedValue;
}

// --- Komponen TaskDisplay Diperbarui ---
const TaskDisplay = ({ tasks, onEdit, onDelete, onView, currentUser }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const StatusBadge = ({ status }) => {
    const statusStyles = { not_started: 'bg-gray-200 text-gray-800', in_progress: 'bg-blue-200 text-blue-800', completed: 'bg-green-200 text-green-800', cancelled: 'bg-red-200 text-red-800' };
    return <span className={`px-2 py-1 text-xs font-semibold leading-5 rounded-full capitalize ${statusStyles[status] || statusStyles.not_started}`}>{status.replace('_', ' ')}</span>;
  };
  const ActionButtons = ({ task }) => {
    const canModify = task.collaborators.some(c => c.id === currentUser?.id && c.permission === 'edit');
    const canDelete = task.user?.id === currentUser?.id;
    return (
      <div className="flex items-center space-x-2">
        <button onClick={() => onView(task)} className="text-green-600 hover:text-green-900" title="Lihat Riwayat">
          <Eye className="h-5 w-5" />
        </button>
        {canModify && (
          <button onClick={() => onEdit(task)} className="text-blue-600 hover:text-blue-900" title="Edit">
            <Pencil className="h-5 w-5" />
          </button>
        )}
        {canDelete && (
          <button onClick={() => onDelete(task.id)} className="text-red-600 hover:text-red-900" title="Hapus">
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>
    );
  };
  
  // Komponen Avatar baru yang lebih cerdas
  const Avatar = ({ user }) => {
    if (!user) return null;
    return (
      <img
        src={user.profile_photo_url}
        alt={user.name}
        className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
        title={user.name}
      />
    );
  };

  const CollaboratorAvatars = ({ collaborators, creator }) => {
    if (!creator) return null;
    const otherCollaborators = collaborators.filter(c => c.id !== creator.id);

    if (otherCollaborators.length === 0) {
      return (
        <div className="flex items-center">
          <Avatar user={creator} />
        </div>
      );
    }

    return (
      <div className="flex items-center -space-x-2">
        {otherCollaborators.slice(0, 3).map(user => (
          <Avatar key={user.id} user={user} />
        ))}
        {otherCollaborators.length > 3 && (
          <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white">
            +{otherCollaborators.length - 3}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="hidden md:block bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kolaborator</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat Oleh</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dibuat Pada</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jatuh Tempo</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map(task => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{task.title}</div></td>
                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={task.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap"><CollaboratorAvatars collaborators={task.collaborators} creator={task.user} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.user?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(task.created_at)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(task.due_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><ActionButtons task={task} currentUser={currentUser} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow-md space-y-3">
            <div className="flex justify-between items-start"><h3 className="font-bold text-lg text-gray-800">{task.title}</h3><StatusBadge status={task.status} /></div>
            {task.description && <p className="text-sm text-gray-600">{task.description}</p>}
            <div className="border-t pt-3 text-sm text-gray-500 space-y-1">
              <div className="flex items-center gap-2"><strong>Kolaborator:</strong> <CollaboratorAvatars collaborators={task.collaborators} creator={task.user} /></div>
              <p><strong>Dibuat Oleh:</strong> {task.user?.name}</p>
              <p><strong>Dibuat Pada:</strong> {formatDate(task.created_at)}</p>
              <p><strong>Jatuh Tempo:</strong> {formatDate(task.due_date)}</p>
            </div>
            <div className="flex justify-end pt-2"><ActionButtons task={task} currentUser={currentUser} /></div>
          </div>
        ))}
      </div>
    </>
  );
};

export default function TasksPage({ currentUser }) { 
  const [tasks, setTasks] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);

  const [users, setUsers] = useState([]);
  const [forceRefetch, setForceRefetch] = useState(0);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const usersResponse = await getUsers(); 
        setUsers(usersResponse.data.data);
      } catch (err) { 
        console.error("Gagal memuat daftar pengguna", err); 
        setError("Gagal memuat daftar pengguna."); 
      }
    };
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true); setError('');
      try {
        const params = { status: statusFilter, sort_by: sortBy, page: currentPage, search: debouncedSearchTerm };
        const response = await getTasks(params);
        setTasks(response.data.data); setPaginationMeta(response.data.meta);
      } catch (err) { setError('Gagal memuat tugas.'); console.error(err); } finally { setIsLoading(false); }
    };
    if (currentUser) { fetchTasks(); }
  }, [statusFilter, sortBy, currentPage, debouncedSearchTerm, currentUser, forceRefetch]);

  const handleFilterChange = (e) => { setStatusFilter(e.target.value); setCurrentPage(1); };
  const handleSortChange = (e) => { setSortBy(e.target.value); setCurrentPage(1); };
  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handlePageChange = (newPage) => { setCurrentPage(newPage); };
  
  const handleOpenCreateModal = () => { setEditingTask(null); setIsEditModalOpen(true); };
  const handleOpenEditModal = (task) => { setEditingTask(task); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setEditingTask(null); };

  const handleOpenDetailModal = (task) => { setViewingTask(task); setIsDetailModalOpen(true); };
  const handleCloseDetailModal = () => { setIsDetailModalOpen(false); setViewingTask(null); };

  const refreshTasks = () => { setForceRefetch(c => c + 1); };
  
  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) { await updateTask(editingTask.id, taskData); } else { await createTask(taskData); }
      handleCloseEditModal();
      refreshTasks();
    } catch (err) { console.error('Gagal menyimpan tugas', err); }
  };
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tugas ini?')) {
      try { await deleteTask(taskId); refreshTasks(); } catch (err) { console.error('Gagal menghapus tugas', err); }
    }
  };

  return (
    <div>
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Tugas Saya</h1>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button onClick={handleOpenCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">+ Buat Tugas</button>
        </div>
      </header>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-grow"><input type="text" placeholder="Cari berdasarkan nama tugas..." value={searchTerm} onChange={handleSearchChange} className="w-full p-2 border rounded-lg text-sm bg-white" /></div>
        <div className="flex gap-4">
          <select name="status" value={statusFilter} onChange={handleFilterChange} className="w-full md:w-auto p-2 border rounded-lg text-sm bg-white">
            <option value="all">Semua Status</option><option value="not_started">Belum Dimulai</option><option value="in_progress">Dikerjakan</option><option value="completed">Selesai</option><option value="cancelled">Dibatalkan</option>
          </select>
          <select name="sort_by" value={sortBy} onChange={handleSortChange} className="w-full md:w-auto p-2 border rounded-lg text-sm bg-white">
            <option value="newest">Terbaru</option><option value="oldest">Terlama</option><option value="due_date_asc">Jatuh Tempo (Asc)</option><option value="due_date_desc">Jatuh Tempo (Desc)</option>
          </select>
        </div>
      </div>

      {isLoading && <p>Memuat tugas...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!isLoading && !error && tasks.length > 0 ? (
        <>
          <TaskDisplay tasks={tasks} onEdit={handleOpenEditModal} onDelete={handleDeleteTask} onView={handleOpenDetailModal} currentUser={currentUser} />
          <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
        </>
      ) : (
        !isLoading && <p className="text-center text-gray-500 mt-8">Tidak ada tugas yang ditemukan.</p>
      )}

      {isEditModalOpen && (
        <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title={editingTask ? 'Edit Tugas' : 'Buat Tugas Baru'}>
          <div className="max-h-[80vh] overflow-y-auto p-1 pr-4 -mr-4">
            <TaskForm 
              onSubmit={handleFormSubmit} 
              onCancel={handleCloseEditModal} 
              task={editingTask} 
              users={users} 
              currentUser={currentUser} 
            />
          </div>
        </Modal>
      )}

      {viewingTask && (
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          task={viewingTask}
        />
      )}
    </div>
  );
}
