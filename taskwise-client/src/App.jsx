import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import StatisticsPage from './pages/StatisticsPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage'; // 1. Import halaman baru
import { getUser } from './services/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [activePage, setActivePage] = useState(localStorage.getItem('activePage') || 'statistics');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRefetchTrigger, setUserRefetchTrigger] = useState(0); // State untuk memicu refresh

  useEffect(() => {
    localStorage.setItem('activePage', activePage);
  }, [activePage]);

  // 2. Gunakan useCallback agar fungsi tidak dibuat ulang di setiap render
  const fetchCurrentUser = useCallback(async () => {
    if (token) {
      try {
        const response = await getUser();
        setCurrentUser(response.data.data);
      } catch (error) {
        console.error("Token tidak valid, logout...", error);
        handleLogout();
      } finally {
        setAuthLoading(false);
      }
    } else {
      setAuthLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCurrentUser();
  }, [token, userRefetchTrigger, fetchCurrentUser]); // Tambahkan trigger ke dependensi

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setActivePage('statistics');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('activePage');
    setToken(null);
    setCurrentUser(null);
  };

  // 3. Fungsi yang akan dipanggil dari ProfilePage setelah sukses upload
  const handleProfileUpdate = () => {
    setUserRefetchTrigger(c => c + 1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat...</p>
      </div>
    );
  }

  if (!token || !currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout 
      activePage={activePage} 
      setActivePage={setActivePage} 
      onLogout={handleLogout}
      currentUser={currentUser}
    >
      {activePage === 'statistics' && <StatisticsPage currentUser={currentUser} />}
      {activePage === 'tasks' && <TasksPage currentUser={currentUser} />}
      {/* 4. Tampilkan halaman profil jika aktif */}
      {activePage === 'profile' && <ProfilePage currentUser={currentUser} onUpdateSuccess={handleProfileUpdate} />}
    </Layout>
  );
}

export default App;
