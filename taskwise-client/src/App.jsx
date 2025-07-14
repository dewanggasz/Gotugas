import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import StatisticsPage from './pages/StatisticsPage';
import TasksPage from './pages/TasksPage';
import { getUser } from './services/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [activePage, setActivePage] = useState(localStorage.getItem('activePage') || 'statistics');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('activePage', activePage);
  }, [activePage]);

  useEffect(() => {
    if (token) {
      const fetchCurrentUser = async () => {
        try {
          const response = await getUser();
          setCurrentUser(response.data);
        } catch (error) {
          console.error("Token tidak valid, logout...", error);
          handleLogout();
        } finally {
          setAuthLoading(false);
        }
      };
      fetchCurrentUser();
    } else {
      setAuthLoading(false);
    }
  }, [token]);

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
      {activePage === 'statistics' && <StatisticsPage />}
      {activePage === 'tasks' && <TasksPage currentUser={currentUser} />} 
    </Layout>
  );
}

export default App;
