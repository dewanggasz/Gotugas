import React, { useState } from 'react';

export default function Layout({ activePage, setActivePage, onLogout, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Komponen untuk link navigasi, bisa dipakai di header dan off-canvas
  const NavLink = ({ pageName, children, isMobile = false }) => (
    <button
      onClick={() => {
        setActivePage(pageName);
        if (isMobile) {
          setIsMenuOpen(false); // Tutup menu setelah klik di mobile
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
      {/* Header Utama */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Judul */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-blue-600">TaskWise</h1>
            </div>

            {/* Navigasi Desktop */}
            <nav className="hidden md:flex items-center space-x-2">
              <NavLink pageName="statistics">Statistics</NavLink>
              <NavLink pageName="tasks">Tasks</NavLink>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg text-red-500 hover:bg-red-100 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </nav>

            {/* Tombol Hamburger Mobile */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(true)} className="p-2 rounded-md text-gray-500 hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Off-Canvas Menu Mobile */}
      <div className={`fixed inset-0 z-50 md:hidden transition-transform transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Latar Belakang Overlay */}
        <div className={`fixed inset-0 bg-black transition-opacity ${isMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)}></div>
        
        {/* Konten Menu */}
        <div className="relative w-64 h-full bg-white shadow-lg p-4 flex flex-col">
          <h2 className="text-xl font-bold text-blue-600 mb-8">Menu</h2>
          <nav className="flex flex-col space-y-2">
            <NavLink pageName="statistics" isMobile={true}>Statistics</NavLink>
            <NavLink pageName="tasks" isMobile={true}>Tasks</NavLink>
          </nav>
          <div className="mt-auto">
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Konten Utama Halaman */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
