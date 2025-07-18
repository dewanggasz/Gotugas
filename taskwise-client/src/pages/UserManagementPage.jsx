"use client"

import { useState, useEffect, useCallback } from "react"
import { getUsers, createUser, updateUser, deleteUser } from "../services/api"
import UserForm from "../components/UserForm"
import {
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  User,
  Mail,
  Crown,
  UserCheck,
  AlertTriangle,
} from "lucide-react"

// Enhanced Avatar Component
const Avatar = ({ user, size = "md" }) => {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  }

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??"

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 flex items-center justify-center font-semibold text-blue-700 overflow-hidden flex-shrink-0`}
    >
      {user.profile_photo_url ? (
        <img
          src={user.profile_photo_url || "/placeholder.svg"}
          alt={user.name}
          className="w-full h-full object-cover"
          title={user.name}
        />
      ) : (
        <span title={user.name}>{initials}</span>
      )}
    </div>
  )
}

// Enhanced Role Badge Component
const RoleBadge = ({ role }) => {
  const roleConfig = {
    admin: {
      label: "Admin",
      color: "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300",
      icon: Crown,
    },
    user: {
      label: "User",
      color: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300",
      icon: UserCheck,
    },
  }

  const config = roleConfig[role] || roleConfig.user
  const IconComponent = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${config.color}`}
    >
      <IconComponent className="h-3 w-3" />
      {config.label}
    </span>
  )
}

// Enhanced Pagination Component
const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.last_page <= 1) return null

  const getVisiblePages = () => {
    const current = meta.current_page
    const total = meta.last_page
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i)
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (current + delta < total - 1) {
      rangeWithDots.push("...", total)
    } else if (total > 1) {
      rangeWithDots.push(total)
    }

    return rangeWithDots
  }

  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-600 font-medium">
          Menampilkan <span className="text-slate-900 font-semibold">{meta.from}</span> sampai{" "}
          <span className="text-slate-900 font-semibold">{meta.to}</span> dari{" "}
          <span className="text-slate-900 font-semibold">{meta.total}</span> hasil
        </p>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange(meta.current_page - 1)}
            disabled={meta.current_page === 1}
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center space-x-1">
            {getVisiblePages().map((page, index) =>
              page === "..." ? (
                <span key={index} className="px-2 py-2 text-slate-400 font-medium text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    page === meta.current_page
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm"
                  }`}
                >
                  {page}
                </button>
              ),
            )}
          </div>

          <button
            onClick={() => onPageChange(meta.current_page + 1)}
            disabled={meta.current_page === meta.last_page}
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced Action Buttons Component
const ActionButtons = ({ user, onEdit, onDelete }) => {
  return (
    <div className="flex items-center justify-end space-x-2">
      <button
        onClick={() => onEdit(user)}
        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
        title="Edit Pengguna"
      >
        <Edit className="h-4 w-4 group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={() => onDelete(user.id)}
        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
        title="Hapus Pengguna"
      >
        <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  )
}

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [paginationMeta, setPaginationMeta] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchUsers = useCallback(async (page) => {
    try {
      setLoading(true)
      const response = await getUsers(page)
      setUsers(response.data.data)
      setPaginationMeta(response.data.meta)
      setError(null)
    } catch (err) {
      setError("Gagal memuat data pengguna. Anda mungkin tidak memiliki akses.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers(currentPage)
  }, [fetchUsers, currentPage])

  const handlePageChange = (newPage) => {
    if (paginationMeta && newPage > 0 && newPage <= paginationMeta.last_page) {
      setCurrentPage(newPage)
    }
  }

  const handleOpenModal = (user = null) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSubmit = async (userData) => {
    const dataToSend = { ...userData }
    if (editingUser && !dataToSend.password) {
      delete dataToSend.password
      delete dataToSend.password_confirmation
    }
    if (editingUser) {
      await updateUser(editingUser.id, dataToSend)
    } else {
      await createUser(dataToSend)
    }
    fetchUsers(currentPage)
  }

  const handleDelete = async (userId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        await deleteUser(userId)
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        } else {
          fetchUsers(currentPage)
        }
      } catch (error) {
        alert("Gagal menghapus pengguna.")
        console.error(error)
      }
    }
  }

  if (loading && !paginationMeta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center space-y-4 text-slate-600">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900 mb-1">Memuat data pengguna...</p>
                <p className="text-sm text-slate-600">Mohon tunggu sebentar</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Terjadi Kesalahan</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Manajemen Pengguna
              </h1>
              <p className="text-slate-600 text-base font-medium max-w-2xl leading-relaxed">
                Kelola akun pengguna, peran, dan hak akses dalam sistem
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Tambah Pengguna
            </button>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[300px]">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        Pengguna
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[250px]">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[150px]">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        Peran
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide w-[120px]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 w-[300px]">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} size="md" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-slate-900 truncate" title={user.name}>
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[250px]">
                        <div className="text-sm text-slate-600 truncate" title={user.email}>
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 w-[150px]">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 text-right w-[120px]">
                        <ActionButtons user={user} onEdit={handleOpenModal} onDelete={handleDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden p-4">
            {users.map((user, index) => (
              <div
                key={user.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar user={user} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900 text-base truncate" title={user.name}>
                        {user.name}
                      </h3>
                      <p className="text-sm text-slate-600 truncate" title={user.email}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <RoleBadge role={user.role} />
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <ActionButtons user={user} onEdit={handleOpenModal} onDelete={handleDelete} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="px-6 mb-10">
            <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
          </div>
        </div>

        {/* Modal */}
        <UserForm isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} initialData={editingUser} />
      </div>
    </div>
  )
}

export default UserManagementPage
