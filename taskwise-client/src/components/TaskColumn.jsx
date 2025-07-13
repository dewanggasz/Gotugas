import React from 'react';

// Komponen Card Tugas sekarang memiliki tombol aksi
const TaskCard = ({ task, onEdit, onDelete }) => (
  <div className="bg-white p-4 rounded-lg shadow mb-4 group">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-bold text-gray-800">{task.title}</h4>
        <p className="text-sm text-gray-600 mt-1">{task.description}</p>
      </div>
      {/* Tombol aksi yang muncul saat hover */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
        <button onClick={() => onEdit(task)} className="text-blue-500 hover:text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
          </svg>
        </button>
        <button onClick={() => onDelete(task.id)} className="text-red-500 hover:text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    {task.due_date && <p className="text-xs text-gray-500 mt-2">Due: {task.due_date}</p>}
  </div>
);

export default function TaskColumn({ title, tasks = [], summary, onEditTask, onDeleteTask }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg flex-1">
      <h3 className="text-lg font-bold mb-4 text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{summary}</p>
      <div className="h-96 overflow-y-auto pr-2">
        {tasks.length > 0 ? (
          tasks.map(task => <TaskCard key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />)
        ) : (
          <p className="text-gray-500 text-sm">No tasks in this category.</p>
        )}
      </div>
    </div>
  );
}
