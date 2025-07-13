import React from 'react';

// Komponen Card Tugas (didefinisikan di file yang sama untuk simpel)
const TaskCard = ({ task }) => (
  <div className="bg-white p-4 rounded-lg shadow mb-4">
    <h4 className="font-bold text-gray-800">{task.title}</h4>
    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
    {task.due_date && <p className="text-xs text-gray-500 mt-2">Due: {task.due_date}</p>}
  </div>
);

export default function TaskColumn({ title, tasks = [], summary }) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg flex-1">
      <h3 className="text-lg font-bold mb-4 text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{summary}</p>
      <div className="h-96 overflow-y-auto pr-2">
        {tasks.length > 0 ? (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        ) : (
          <p className="text-gray-500 text-sm">No tasks in this category.</p>
        )}
      </div>
    </div>
  );
}
