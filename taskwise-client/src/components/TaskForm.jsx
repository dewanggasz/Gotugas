import React, { useState, useEffect } from 'react';

export default function TaskForm({ onSubmit, onCancel, task }) {
  // State untuk setiap input form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('not_started');
  const [dueDate, setDueDate] = useState('');

  // useEffect untuk mengisi form jika sedang dalam mode edit
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'not_started');
      setDueDate(task.due_date || '');
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = { title, description, status, due_date: dueDate };
    onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 mb-2">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        ></textarea>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="status" className="block text-gray-700 mb-2">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-gray-700 mb-2">Due Date</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Save Task
        </button>
      </div>
    </form>
  );
}
