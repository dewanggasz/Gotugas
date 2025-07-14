import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { getTaskActivities } from '../services/api';
import { PlusCircle, RefreshCw, Pencil, FileText, MessageSquare, Pin } from 'lucide-react';

// Komponen kecil untuk setiap item di log aktivitas
const ActivityItem = ({ activity }) => {
  const getIcon = (description) => {
    if (description.includes('membuat')) return <PlusCircle className="w-5 h-5 text-green-600" />;
    if (description.includes('status')) return <RefreshCw className="w-5 h-5 text-blue-600" />;
    if (description.includes('judul')) return <Pencil className="w-5 h-5 text-purple-600" />;
    if (description.includes('deskripsi')) return <FileText className="w-5 h-5 text-yellow-600" />;
    if (description.includes('pembaruan')) return <MessageSquare className="w-5 h-5 text-indigo-600" />;
    return <Pin className="w-5 h-5 text-gray-600" />;
  };

  // Fungsi untuk merender deskripsi dengan styling khusus
  const renderDescription = (desc) => {
    const statusChangeRegex = /mengubah status dari '(.+?)' menjadi '(.+?)'/;
    const match = desc.match(statusChangeRegex);

    if (match) {
      const fromStatus = match[1].replace(/_/g, ' ');
      const toStatus = match[2].replace(/_/g, ' ');

      const statusStyles = {
        not_started: 'text-gray-600 font-semibold capitalize',
        in_progress: 'text-blue-600 font-semibold capitalize',
        completed: 'text-green-600 font-semibold capitalize',
        cancelled: 'text-red-600 font-semibold capitalize',
      };

      return (
        <>
          mengubah status dari <span className={statusStyles[match[1]] || ''}>'{fromStatus}'</span> menjadi <span className={statusStyles[match[2]] || ''}>'{toStatus}'</span>
        </>
      );
    }
    return desc;
  };

  return (
    <li className="flex gap-3">
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        {getIcon(activity.description)}
      </div>
      <div>
        <p className="text-sm text-gray-800">
          <span className="font-bold">{activity.user?.name || 'Pengguna'}</span> {renderDescription(activity.description)}
        </p>
        <p className="text-xs text-gray-500 mt-1">{activity.created_at}</p>
      </div>
    </li>
  );
};

export default function TaskDetailModal({ isOpen, onClose, task }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      const fetchActivities = async () => {
        setIsLoading(true);
        try {
          const response = await getTaskActivities(task.id);
          setActivities(response.data.data);
        } catch (error) {
          console.error("Gagal memuat aktivitas tugas", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchActivities();
    }
  }, [isOpen, task]);

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail & Riwayat Tugas">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
        {/* Bagian Detail Tugas */}
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800">{task.title}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{task.description || 'Tidak ada deskripsi.'}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm border-t pt-4">
                <div>
                    <label className="font-semibold text-gray-500">Status</label>
                    <p className="capitalize">{task.status.replace('_', ' ')}</p>
                </div>
                <div>
                    <label className="font-semibold text-gray-500">Tanggal Jatuh Tempo</label>
                    <p>{task.due_date ? new Date(task.due_date).toLocaleDateString('id-ID') : 'N/A'}</p>
                </div>
                <div>
                    <label className="font-semibold text-gray-500">Dibuat Oleh</label>
                    <p>{task.user?.name}</p>
                </div>
            </div>

            <div>
                <label className="font-semibold text-gray-500">Kolaborator</label>
                <div className="flex flex-wrap gap-2 mt-1">
                {task.collaborators?.map(c => (
                    <span key={c.id} className="bg-gray-200 text-gray-800 px-2 py-1 text-xs rounded-full">
                    {c.name} ({c.permission})
                    </span>
                ))}
                </div>
            </div>
        </div>

        <hr />

        {/* Bagian Riwayat Aktivitas */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Riwayat Aktivitas</h4>
          {isLoading ? (
            <p>Memuat riwayat...</p>
          ) : (
            <ul className="space-y-4">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
}
