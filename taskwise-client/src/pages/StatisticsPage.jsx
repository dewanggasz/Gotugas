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
        setError('Failed to load summary data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (isLoading) return <p>Loading statistics...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Monthly Summary</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <SummaryCard title="Created This Month" value={summary.created_this_month} icon="📝" />
        <SummaryCard title="Completed This Month" value={summary.completed_this_month} icon="✅" />
        <SummaryCard title="In Progress" value={summary.in_progress} icon="⏳" />
        <SummaryCard title="Cancelled" value={summary.cancelled} icon="❌" />
        <SummaryCard title="Overdue" value={summary.overdue} icon="🔥" />
      </div>
    </div>
  );
}
