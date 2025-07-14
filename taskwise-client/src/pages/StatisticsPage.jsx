import React, { useState, useEffect } from 'react';
import { getSummary } from '../services/api';
import SummaryCard from '../components/SummaryCard';

export default function StatisticsPage() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getSummary();
        setSummary(response.data);
      } catch (err) {
        setError('Gagal memuat data ringkasan.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) return <p>Memuat statistik...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Ringkasan Bulanan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <SummaryCard title="Dibuat Bulan Ini" value={summary.created_this_month} icon="created" />
        <SummaryCard title="Selesai Bulan Ini" value={summary.completed_this_month} icon="completed" />
        <SummaryCard title="Sedang Dikerjakan" value={summary.in_progress} icon="in_progress" />
        <SummaryCard title="Dibatalkan" value={summary.cancelled} icon="cancelled" />
        <SummaryCard title="Lewat Batas Waktu" value={summary.overdue} icon="overdue" />
      </div>
    </div>
  );
}
