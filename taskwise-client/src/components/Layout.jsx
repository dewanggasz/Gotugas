import React, { useState, useRef, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';

export default function Layout({ activePage, setActivePage, onLogout, currentUser, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const NavLink = ({ pageName, children, isMobile = false }) => (
    <button
      onClick={() => {
        setActivePage(pageName);
        if (isMobile) {
          setIsMenuOpen(false);
        }
      }}
      className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
        activePage === pageName
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100'
      } ${isMobile ? 'w-full text-left' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-blue-600">TaskWise</h1>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex items-center space-x-2">
                <NavLink pageName="statistics">Statistik</NavLink>
                <NavLink pageName="tasks">Tugas</NavLink>
              </nav>
              
              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold text-white">
                    {currentUser?.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{currentUser?.name}</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button
                      onClick={onLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-50 md:hidden transition-transform transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className={`fixed inset-0 bg-black transition-opacity ${isMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)}></div>
        <div className="relative w-64 h-full bg-white shadow-lg p-4 flex flex-col">
          <div className="flex items-center space-x-3 mb-8 border-b pb-4">
            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-lg font-bold text-white">
              {currentUser?.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{currentUser?.name}</p>
              <p className="text-xs text-gray-500">{currentUser?.email}</p>
            </div>
          </div>
          <nav className="flex flex-col space-y-2">
            <NavLink pageName="statistics" isMobile={true}>Statistik</NavLink>
            <NavLink pageName="tasks" isMobile={true}>Tugas</NavLink>
          </nav>
          <div className="mt-auto">
            <button
              onClick={onLogout}
              className="w-full flex items-center text-left px-4 py-2 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
