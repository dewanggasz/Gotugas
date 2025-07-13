import React from 'react';

export default function SummaryCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className="bg-blue-100 p-3 rounded-full">
        {/* Icon akan kita tambahkan nanti, untuk sekarang placeholder */}
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
