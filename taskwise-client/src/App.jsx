import React, { useState, useEffect, useCallback } from 'react';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import StatisticsPage from './pages/StatisticsPage';
import TasksPage from './pages/TasksPage';
import ProfilePage from './pages/ProfilePage';
import UserManagementPage from './pages/UserManagementPage'; 
import JournalPage from './pages/JournalPage';
import { getUser } from './services/api';

const getInitialPage = () => {
  const path = window.location.pathname;
  if (path.startsWith('/tasks')) {
    return 'tasks';
  }
  if (path.startsWith('/profile')) {
    return 'profile';
  }
  // <-- PERUBAHAN: Menambahkan 'userManagement' ke logika awal (opsional tapi bagus)
  if (path.startsWith('/users')) {
    return 'userManagement';
  }
  return localStorage.getItem('activePage') || 'statistics';
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [activePage, setActivePage] = useState(getInitialPage());
  
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRefetchTrigger, setUserRefetchTrigger] = useState(0);

  useEffect(() => {
    localStorage.setItem('activePage', activePage);
  }, [activePage]);

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
  }, [token, userRefetchTrigger, fetchCurrentUser]);

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
      {activePage === 'profile' && <ProfilePage currentUser={currentUser} onUpdateSuccess={handleProfileUpdate} />}
      {activePage === 'journal' && <JournalPage currentUser={currentUser} />}
      {activePage === 'userManagement' && <UserManagementPage />}
    </Layout>
  );
}

export default App;