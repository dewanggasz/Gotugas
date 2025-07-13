import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import StatisticsPage from './pages/StatisticsPage';
import TasksPage from './pages/TasksPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  
  // Baca halaman terakhir dari localStorage, jika tidak ada, default ke 'statistics'
  const [activePage, setActivePage] = useState(
    localStorage.getItem('activePage') || 'statistics'
  );

  // Simpan halaman aktif ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem('activePage', activePage);
  }, [activePage]);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    // Setelah login, arahkan ke halaman statistik
    setActivePage('statistics'); 
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('activePage'); // Hapus juga state halaman
    setToken(null);
  };

  // Jika tidak ada token, tampilkan halaman login
  if (!token) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Jika ada token, tampilkan layout utama
  return (
    <Layout activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout}>
      {/* Tampilkan konten halaman berdasarkan state activePage */}
      {activePage === 'statistics' && <StatisticsPage />}
      {activePage === 'tasks' && <TasksPage />}
    </Layout>
  );
}

export default App;
