import React, { useState, useEffect, useMemo } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import TaskColumn from '../components/TaskColumn';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';

export default function DashboardPage({ onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk filter
  const [filter, setFilter] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // State untuk modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fungsi untuk mengambil data tugas dari API
  const fetchTasks = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getTasks(filter);
      setTasks(response.data.data);
    } catch (err) {
      setError('Failed to fetch tasks.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  // Handler untuk membuka modal
  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  // Handler untuk submit form
  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        // Mode Edit
        await updateTask(editingTask.id, taskData);
      } else {
        // Mode Create
        await createTask(taskData);
      }
      // Ambil ulang data terbaru dan tutup modal
      fetchTasks();
      handleCloseModal();
    } catch (err) {
      console.error('Failed to save task', err);
      // Di sini kita bisa menambahkan state untuk menampilkan error di form
    }
  };

  // Handler untuk menghapus tugas
  const handleDeleteTask = async (taskId) => {
    // Tampilkan konfirmasi sebelum menghapus
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        // Ambil ulang data terbaru
        fetchTasks();
      } catch (err) {
        console.error('Failed to delete task', err);
      }
    }
  };

  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const status = task.status || 'not_started';
      if (!acc[status]) acc[status] = [];
      acc[status].push(task);
      return acc;
    }, {});
  }, [tasks]);

  const handleFilterChange = (e) => {
    setFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getSummary = (status) => {
    const count = groupedTasks[status]?.length || 0;
    return `${count} task${count !== 1 ? 's' : ''} in this category.`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Tasks</h1>
        <div className="flex items-center space-x-4">
          <button onClick={handleOpenCreateModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            + Create Task
          </button>
          <select name="month" value={filter.month} onChange={handleFilterChange} className="p-2 border rounded-lg">
            {Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}
          </select>
          <select name="year" value={filter.year} onChange={handleFilterChange} className="p-2 border rounded-lg">
            {Array.from({length: 5}, (_, i) => <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>)}
          </select>
          <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Logout</button>
        </div>
      </header>

      {isLoading && <p>Loading tasks...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <TaskColumn title="Not Started" tasks={groupedTasks.not_started} summary={getSummary('not_started')} onEditTask={handleOpenEditModal} onDeleteTask={handleDeleteTask} />
          <TaskColumn title="In Progress" tasks={groupedTasks.in_progress} summary={getSummary('in_progress')} onEditTask={handleOpenEditModal} onDeleteTask={handleDeleteTask} />
          <TaskColumn title="Completed" tasks={groupedTasks.completed} summary={getSummary('completed')} onEditTask={handleOpenEditModal} onDeleteTask={handleDeleteTask} />
          <TaskColumn title="Cancelled" tasks={groupedTasks.cancelled} summary={getSummary('cancelled')} onEditTask={handleOpenEditModal} onDeleteTask={handleDeleteTask} />
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTask ? 'Edit Task' : 'Create New Task'}>
        <TaskForm 
          onSubmit={handleFormSubmit}
          onCancel={handleCloseModal}
          task={editingTask}
        />
      </Modal>
    </div>
  );
}
