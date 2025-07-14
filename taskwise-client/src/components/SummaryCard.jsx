import React from 'react';
import { FilePlus, CheckCircle2, Loader, XCircle, AlertTriangle } from 'lucide-react'; // 1. Import ikon

export default function SummaryCard({ title, value, icon }) {
  // 2. Pilih ikon berdasarkan prop
  const renderIcon = () => {
    switch (icon) {
      case 'created':
        return <FilePlus className="w-6 h-6 text-blue-600" />;
      case 'completed':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'in_progress':
        return <Loader className="w-6 h-6 text-indigo-600 animate-spin" />;
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
      <div className="bg-gray-100 p-3 rounded-full">
        {renderIcon()}
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
