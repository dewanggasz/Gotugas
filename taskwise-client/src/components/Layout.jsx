"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, LogOut, User, X, BarChart3, CheckSquare, ChevronDown, ShieldCheck } from "lucide-react" // <-- PERUBAHAN: Menambahkan ikon ShieldCheck

export default function ClientLayout({ activePage, setActivePage, onLogout, currentUser, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [profileRef])

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false)
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const navigationItems = [
    {
      id: "statistics",
      label: "Statistik",
      icon: BarChart3,
    },
    {
      id: "tasks",
      label: "Tugas",
      icon: CheckSquare,
    },
  ]
  
  // <-- PERUBAHAN: Menambahkan item navigasi untuk admin
  const adminNavigationItem = {
      id: "userManagement",
      label: "Pengguna",
      icon: ShieldCheck,
  };


  const NavLink = ({ item, isMobile = false }) => {
    const Icon = item.icon
    const isActive = activePage === item.id

    return (
      <button
        onClick={() => {
          setActivePage(item.id)
          if (isMobile) {
            setIsMenuOpen(false)
          }
        }}
        className={`group flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium ${
          isActive ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
        } ${isMobile ? "w-full" : ""}`}
      >
        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-600"}`} />
        <span>{item.label}</span>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">TaskWise</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <nav className="flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <NavLink key={item.id} item={item} />
                ))}
                {/* <-- PERUBAHAN: Menampilkan tautan admin secara kondisional */}
                {currentUser?.role === 'admin' && <NavLink item={adminNavigationItem} />}
              </nav>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-slate-50 transition-colors duration-200 group"
                >
                  <img
                    src={currentUser?.profile_photo_url || "/placeholder.svg"}
                    alt={currentUser?.name || "User"}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 shadow-sm"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-slate-900">{currentUser?.name}</p>
                    <p className="text-xs text-slate-500">{currentUser?.email}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-all duration-200 group-hover:text-slate-600 ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{currentUser?.name}</p>
                      <p className="text-xs text-slate-500">{currentUser?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActivePage("profile")
                          setIsProfileOpen(false)
                        }}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                      >
                        <User className="w-4 h-4 mr-2 text-slate-400" />
                        Pengaturan Profil
                      </button>
                      <button
                        onClick={onLogout}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-2 text-red-400" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-200"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            isMenuOpen ? "opacity-50" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Mobile Menu */}
        <div
          className={`fixed top-0 left-0 w-64 max-w-[85vw] h-full bg-white shadow-xl transform transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <img
                  src={currentUser?.profile_photo_url || "/placeholder.svg"}
                  alt={currentUser?.name || "User"}
                  className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{currentUser?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navigationItems.map((item) => (
                <NavLink key={item.id} item={item} isMobile={true} />
              ))}
              {/* <-- PERUBAHAN: Menampilkan tautan admin secara kondisional di mobile */}
              {currentUser?.role === 'admin' && <NavLink item={adminNavigationItem} isMobile={true} />}
              <button
                onClick={() => {
                  setActivePage("profile")
                  setIsMenuOpen(false)
                }}
                className={`group flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium w-full ${
                  activePage === "profile"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-blue-700 hover:bg-blue-50"
                }`}
              >
                <User
                  className={`h-4 w-4 ${
                    activePage === "profile" ? "text-white" : "text-slate-400 group-hover:text-blue-600"
                  }`}
                />
                <span>Pengaturan Profil</span>
              </button>
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200 text-sm font-medium"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  )
}