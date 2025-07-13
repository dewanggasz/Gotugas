import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, getUsers, getUser } from '../services/api'; // 1. Import getUsers dan getUser
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';

// (Komponen Pagination dan useDebounce tidak berubah)
const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.last_page <= 1) return null;
  return (
    <div className="mt-8 flex justify-between items-center">
      <p className="text-sm text-gray-700">Showing <span className="font-medium">{meta.from}</span> to <span className="font-medium">{meta.to}</span> of <span className="font-medium">{meta.total}</span> results</p>
      <div className="flex items-center space-x-2">
        <button onClick={() => onPageChange(meta.current_page - 1)} disabled={meta.current_page === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
        <button onClick={() => onPageChange(meta.current_page + 1)} disabled={meta.current_page === meta.last_page} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
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

// --- TaskDisplay Diperbarui untuk Menampilkan Info Kolaborasi ---
const TaskDisplay = ({ tasks, onEdit, onDelete, currentUser }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const StatusBadge = ({ status }) => {
    const statusStyles = { not_started: 'bg-gray-200 text-gray-800', in_progress: 'bg-blue-200 text-blue-800', completed: 'bg-green-200 text-green-800', cancelled: 'bg-yellow-200 text-yellow-800' };
    return <span className={`px-2 py-1 text-xs font-semibold leading-5 rounded-full capitalize ${statusStyles[status] || statusStyles.not_started}`}>{status.replace('_', ' ')}</span>;
  };
  const ActionButtons = ({ task }) => {
    const canModify = task.user?.id === currentUser?.id; // Hanya pembuat yang bisa edit/hapus
    if (!canModify) return null;
    return (
      <div className="flex items-center space-x-2">
        <button onClick={() => onEdit(task)} className="text-blue-600 hover:text-blue-900" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
        <button onClick={() => onDelete(task.id)} className="text-red-600 hover:text-red-900" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
      </div>
    );
  };

  return (
    <>
      <div className="hidden md:block bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map(task => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{task.title}</div></td>
                <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={task.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignee?.name || 'Myself'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.user?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(task.due_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><ActionButtons task={task} /></td>
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
              <p><strong>Assigned To:</strong> {task.assignee?.name || 'Myself'}</p>
              <p><strong>Created By:</strong> {task.user?.name}</p>
              <p><strong>Due:</strong> {formatDate(task.due_date)}</p>
            </div>
            <div className="flex justify-end pt-2"><ActionButtons task={task} /></div>
          </div>
        ))}
      </div>
    </>
  );
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [paginationMeta, setPaginationMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // --- 2. State untuk menyimpan daftar pengguna dan pengguna saat ini ---
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // --- 3. Effect untuk mengambil data pengguna ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const usersResponse = await getUsers();
        setUsers(usersResponse.data.data);
        const currentUserResponse = await getUser();
        setCurrentUser(currentUserResponse.data);
      } catch (err) {
        console.error("Failed to fetch initial data", err);
        setError("Failed to load user data. Please refresh.");
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = { status: statusFilter, sort_by: sortBy, page: currentPage, search: debouncedSearchTerm };
        const response = await getTasks(params);
        setTasks(response.data.data);
        setPaginationMeta(response.data.meta);
      } catch (err) {
        setError('Failed to fetch tasks.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, [statusFilter, sortBy, currentPage, debouncedSearchTerm]);

  const handleFilterChange = (e) => { setStatusFilter(e.target.value); setCurrentPage(1); };
  const handleSortChange = (e) => { setSortBy(e.target.value); setCurrentPage(1); };
  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handlePageChange = (newPage) => { setCurrentPage(newPage); };
  const handleOpenCreateModal = () => { setEditingTask(null); setIsModalOpen(true); };
  const handleOpenEditModal = (task) => { setEditingTask(task); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingTask(null); };

  const refreshTasks = () => {
    // Cara sederhana untuk memicu re-fetch
    setCurrentPage(prev => prev === 1 ? 1.00001 : 1); // Trik untuk memicu useEffect
  };
  
  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      handleCloseModal();
      refreshTasks();
    } catch (err) {
      console.error('Failed to save task', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        refreshTasks();
      } catch (err) {
        console.error('Failed to delete task', err);
      }
    }
  };

  return (
    <div>
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button onClick={handleOpenCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            + Create Task
          </button>
        </div>
      </header>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <input type="text" placeholder="Search by task name..." value={searchTerm} onChange={handleSearchChange} className="w-full p-2 border rounded-lg text-sm bg-white" />
        </div>
        <div className="flex gap-4">
          <select name="status" value={statusFilter} onChange={handleFilterChange} className="w-full md:w-auto p-2 border rounded-lg text-sm bg-white">
            <option value="all">All Statuses</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select name="sort_by" value={sortBy} onChange={handleSortChange} className="w-full md:w-auto p-2 border rounded-lg text-sm bg-white">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="due_date_asc">Due Date (Asc)</option>
            <option value="due_date_desc">Due Date (Desc)</option>
          </select>
        </div>
      </div>

      {isLoading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!isLoading && !error && tasks.length > 0 ? (
        <>
          <TaskDisplay tasks={tasks} onEdit={handleOpenEditModal} onDelete={handleDeleteTask} currentUser={currentUser} />
          <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
        </>
      ) : (
        !isLoading && <p className="text-center text-gray-500 mt-8">No tasks found.</p>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTask ? 'Edit Task' : 'Create New Task'}>
        <TaskForm onSubmit={handleFormSubmit} onCancel={handleCloseModal} task={editingTask} users={users} currentUser={currentUser} />
      </Modal>
    </div>
  );
}
