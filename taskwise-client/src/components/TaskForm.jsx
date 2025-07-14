import React, { useState, useEffect } from 'react';
import CollaboratorInput from './CollaboratorInput';

export default function TaskForm({ onSubmit, onCancel, task, users = [], currentUser }) {
  // State untuk input form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('not_started');
  const [dueDate, setDueDate] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [updateMessage, setUpdateMessage] = useState(''); // State baru untuk pesan update

  // useEffect untuk mengisi form
  useEffect(() => {
    if (task) { // Mode Edit
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'not_started');
      setDueDate(task.due_date || '');
      const existingCollaborators = task.collaborators
        .filter(c => c.id !== task.user.id)
        .map(c => ({ user_id: c.id, name: c.name, permission: c.permission }));
      setCollaborators(existingCollaborators);
    } else { // Mode Create
      setTitle('');
      setDescription('');
      setStatus('not_started');
      setDueDate('');
      setCollaborators([]);
    }
    // Selalu reset pesan update setiap kali form dibuka
    setUpdateMessage('');
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = { 
      title, 
      description, 
      status, 
      due_date: dueDate,
      collaborators: collaborators.map(({ user_id, permission }) => ({ user_id, permission })),
      update_message: updateMessage, // Sertakan pesan update saat submit
    };
    onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 mb-2">Title</label>
        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
      </div>
      <div className="mb-4">
        <CollaboratorInput allUsers={users} collaborators={collaborators} setCollaborators={setCollaborators} currentUser={currentUser} />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 mb-2">Description</label>
        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="status" className="block text-gray-700 mb-2">Status</label>
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="dueDate" className="block text-gray-700 mb-2">Due Date</label>
          <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* Form Baru untuk Pesan Update (Hanya muncul saat mode edit) */}
      {task && (
        <div className="mb-6">
          <label htmlFor="updateMessage" className="block text-gray-700 mb-2">Update Note (Optional)</label>
          <textarea
            id="updateMessage"
            value={updateMessage}
            onChange={(e) => setUpdateMessage(e.target.value)}
            placeholder="Add a note to explain your changes..."
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows="2"
          ></textarea>
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </form>
  );
}
