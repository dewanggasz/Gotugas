"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, LogOut, User, X, BarChart3, CheckSquare } from "lucide-react"

export default function Layout({ activePage, setActivePage, onLogout, currentUser, children }) {
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

  // Close mobile menu on escape key
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
        className={`group flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
          isActive ? "bg-gray-900 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        } ${isMobile ? "w-full" : ""}`}
      >
        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
        <span>{item.label}</span>
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-light text-gray-900 tracking-tight">TaskWise</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex items-center space-x-2">
                {navigationItems.map((item) => (
                  <NavLink key={item.id} item={item} />
                ))}
              </nav>

              {/* Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <img
                    src={currentUser?.profile_photo_url || "/placeholder.svg"}
                    alt={currentUser?.name || "User"}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                      <p className="text-xs text-gray-500">{currentUser?.email}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setActivePage("profile")
                          setIsProfileOpen(false)
                        }}
                        className="w-full text-left flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        Pengaturan Profil
                      </button>
                      <button
                        onClick={onLogout}
                        className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-red-400" />
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
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
              >
                <Menu className="w-6 h-6" />
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
          className={`fixed top-0 left-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl transform transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <img
                  src={currentUser?.profile_photo_url || "/placeholder.svg"}
                  alt={currentUser?.name || "User"}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6 space-y-2">
              {navigationItems.map((item) => (
                <NavLink key={item.id} item={item} isMobile={true} />
              ))}
              <button
                onClick={() => {
                  setActivePage("profile")
                  setIsMenuOpen(false)
                }}
                className={`group flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium w-full ${
                  activePage === "profile"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <User
                  className={`h-4 w-4 ${
                    activePage === "profile" ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                  }`}
                />
                <span>Pengaturan Profil</span>
              </button>
            </nav>

            {/* Logout Button */}
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200 text-sm font-medium"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</main>
    </div>
  )
}
