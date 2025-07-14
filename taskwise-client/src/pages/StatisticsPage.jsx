import React, { useState, useEffect } from 'react';
import { getStatistics } from '../services/api';
import SummaryCard from '../components/SummaryCard';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

// Komponen Grafik (tidak ada perubahan signifikan)
const ChartCard = ({ title, children, isLoading }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
    {isLoading ? (
      <div className="h-[300px] flex items-center justify-center"><p>Memuat grafik...</p></div>
    ) : (
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    )}
  </div>
);

export default function StatisticsPage({ currentUser }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('30d');
  
  const [customRange, setCustomRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 29)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = { period };
        if (period === 'custom') {
          params.start_date = customRange.start_date;
          params.end_date = customRange.end_date;
        }
        const response = await getStatistics(params);
        setDashboardData(response.data);
      } catch (err) {
        setError('Gagal memuat data statistik. Pastikan rentang tanggal valid.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [period, customRange]);

  const handleCustomRangeChange = (e) => {
    setCustomRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const FilterButton = ({ value, label }) => (
    <button onClick={() => setPeriod(value)} className={`px-3 py-1 text-sm rounded-md transition-colors ${period === value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
      {label}
    </button>
  );

  const summary = dashboardData?.summary;
  const trendData = dashboardData?.trend || [];
  const statusData = dashboardData?.status_composition?.filter(item => item.value > 0) || [];
  const performanceData = dashboardData?.performance || [];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Dasbor Statistik</h1>
        <div className="flex items-center space-x-2">
          <FilterButton value="30d" label="30 Hari" />
          <FilterButton value="90d" label="90 Hari" />
          <FilterButton value="this_year" label="Tahun Ini" />
          <FilterButton value="custom" label="Kustom" />
        </div>
      </div>
      
      {period === 'custom' && (
        <div className="mb-8 p-4 bg-gray-100 rounded-lg flex flex-col sm:flex-row items-center gap-4">
          <p className="text-sm font-medium text-gray-700">Pilih Rentang Tanggal:</p>
          <input type="date" name="start_date" value={customRange.start_date} onChange={handleCustomRangeChange} className="p-2 border rounded-lg text-sm bg-white" />
          <span>-</span>
          <input type="date" name="end_date" value={customRange.end_date} onChange={handleCustomRangeChange} className="p-2 border rounded-lg text-sm bg-white" />
        </div>
      )}
      
      {isLoading && !dashboardData ? (
        <div className="p-8"><p>Memuat dasbor...</p></div>
      ) : error ? (
        <div className="p-8"><p className="text-red-500">{error}</p></div>
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <SummaryCard title="Dibuat (Periode)" value={summary.created_in_period} icon="created" />
              <SummaryCard title="Selesai (Periode)" value={summary.completed_in_period} icon="completed" />
              <SummaryCard title="Dikerjakan (Periode)" value={summary.in_progress_in_period} icon="in_progress" />
              <SummaryCard title="Dibatalkan (Periode)" value={summary.cancelled_in_period} icon="cancelled" />
              <SummaryCard title="Lewat Waktu (Total)" value={summary.overdue} icon="overdue" />
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <ChartCard title="Tren Tugas Dibuat" isLoading={isLoading}>
                <BarChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                  <Bar dataKey="Tugas Dibuat" fill="#3b82f6" />
                </BarChart>
              </ChartCard>
            </div>
            <div className="lg:col-span-2">
              <ChartCard title="Komposisi Status (Periode)" isLoading={isLoading}>
                {statusData.length > 0 ? (
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                      {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '14px' }} />
                  </PieChart>
                ) : <div className="flex items-center justify-center h-full text-gray-500">Tidak ada data.</div>}
              </ChartCard>
            </div>
          </div>
          
          {currentUser?.isAdmin && (
            <div className="mt-8">
              <ChartCard title="Performa Tim (Tugas Selesai di Periode)" isLoading={isLoading}>
                {performanceData.length > 0 ? (
                  <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="Tugas Selesai" fill="#8884d8">
                      <LabelList dataKey="Tugas Selesai" position="right" style={{ fill: 'black' }} />
                    </Bar>
                  </BarChart>
                ) : <div className="flex items-center justify-center h-full text-gray-500">Tidak ada data performa.</div>}
              </ChartCard>
            </div>
          )}
        </>
      )}
    </div>
  );
}
