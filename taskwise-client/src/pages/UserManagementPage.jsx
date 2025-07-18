"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
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
  Filter as FilterIcon,
  ArrowDownUp,
  Briefcase,
  ChevronDown,
} from "lucide-react"

// --- HOOK & KOMPONEN HELPER ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

const CustomSelect = ({ options, value, onChange, placeholder, icon: Icon, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)
  const selectedOption = options.find((option) => option.value === value)
  useEffect(() => {
    const handleClickOutside = (event) => { if (selectRef.current && !selectRef.current.contains(event.target)) setIsOpen(false) }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  const handleOptionClick = (optionValue) => { onChange(optionValue); setIsOpen(false) }
  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:bg-slate-50 group min-h-[40px]">
        <span className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-slate-500 group-hover:text-slate-700" />}
          <span className="font-medium text-slate-700 text-sm truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-all group-hover:text-slate-600 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <ul className="absolute z-30 w-full bg-white border border-slate-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
          {options.map((option) => (<li key={option.value} onClick={() => handleOptionClick(option.value)} className={`px-3 py-2.5 text-sm cursor-pointer transition-all ${option.value === value ? "bg-blue-50 font-semibold text-blue-900" : "text-slate-700 hover:bg-slate-50"}`}>{option.label}</li>))}
        </ul>
      )}
    </div>
  )
}

const Avatar = ({ user }) => {
  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??"
  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 flex items-center justify-center font-semibold text-blue-700 overflow-hidden flex-shrink-0">
      {user.profile_photo_url ? (<img src={user.profile_photo_url} alt={user.name} className="w-full h-full object-cover" title={user.name}/>) : (<span title={user.name}>{initials}</span>)}
    </div>
  )
}

const RoleBadge = ({ role }) => {
  const roleConfig = {
    admin: { label: "Admin", color: "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300", icon: Crown },
    semi_admin: { label: "Semi Admin", color: "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300", icon: UserCheck },
    employee: { label: "Employee", color: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300", icon: User },
  }
  const config = roleConfig[role] || roleConfig.employee
  const IconComponent = config.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${config.color}`}>
      <IconComponent className="h-3 w-3" />
      {config.label}
    </span>
  )
}

const Pagination = ({ meta, onPageChange }) => {
  if (!meta || meta.last_page <= 1) return null
  const getVisiblePages = () => {
    const current = meta.current_page, total = meta.last_page, delta = 2, range = [], rangeWithDots = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) { range.push(i) }
    if (current - delta > 2) { rangeWithDots.push(1, "...") } else { rangeWithDots.push(1) }
    rangeWithDots.push(...range);
    if (current + delta < total - 1) { rangeWithDots.push("...", total) } else if (total > 1) { rangeWithDots.push(total) }
    return rangeWithDots;
  }
  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-600 font-medium">Menampilkan <span className="text-slate-900 font-semibold">{meta.from}</span> - <span className="text-slate-900 font-semibold">{meta.to}</span> dari <span className="text-slate-900 font-semibold">{meta.total}</span> hasil</p>
        <div className="flex items-center space-x-1">
          <button onClick={() => onPageChange(meta.current_page - 1)} disabled={meta.current_page === 1} className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 shadow-sm"><ChevronLeft className="h-4 w-4" /></button>
          <div className="flex items-center space-x-1">
            {getVisiblePages().map((page, index) => page === "..." ? (<span key={index} className="px-2 py-2 text-slate-400 font-medium text-sm">...</span>) : (<button key={page} onClick={() => onPageChange(page)} className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${page === meta.current_page ? "bg-blue-600 text-white shadow-md" : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm"}`}>{page}</button>))}
          </div>
          <button onClick={() => onPageChange(meta.current_page + 1)} disabled={meta.current_page === meta.last_page} className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 shadow-sm"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  )
}

const ActionButtons = ({ user, onEdit, onDelete }) => (
  <div className="flex items-center justify-end space-x-2">
    <button onClick={() => onEdit(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all group" title="Edit Pengguna"><Edit className="h-4 w-4 group-hover:scale-110 transition-transform" /></button>
    <button onClick={() => onDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all group" title="Hapus Pengguna"><Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" /></button>
  </div>
)

// --- KOMPONEN UTAMA ---

const UserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [paginationMeta, setPaginationMeta] = useState(null)
  
  const [roleFilter, setRoleFilter] = useState('all');
  const [jabatanFilter, setJabatanFilter] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedJabatanFilter = useDebounce(jabatanFilter, 500);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        role: roleFilter,
        sort_by: sortBy,
        jabatan: debouncedJabatanFilter,
      };
      const response = await getUsers(params);
      setUsers(response.data.data)
      setPaginationMeta(response.data.meta)
      setError(null)
    } catch (err) {
      setError("Gagal memuat data pengguna. Anda mungkin tidak memiliki akses.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, roleFilter, sortBy, debouncedJabatanFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handlePageChange = (newPage) => {
    if (paginationMeta && newPage > 0 && newPage <= paginationMeta.last_page) {
      setCurrentPage(newPage)
    }
  }

  const handleOpenModal = (user = null) => { setEditingUser(user); setIsModalOpen(true) }
  const handleCloseModal = () => { setIsModalOpen(false); setEditingUser(null) }

  const handleSubmit = async (userData) => {
    const dataToSend = { ...userData };
    if (editingUser && !dataToSend.password) {
      delete dataToSend.password;
      delete dataToSend.password_confirmation;
    }
    if (editingUser) {
      await updateUser(editingUser.id, dataToSend);
    } else {
      await createUser(dataToSend);
    }
    handleCloseModal();
    fetchUsers();
  }

  const handleDelete = async (userId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
      try {
        await deleteUser(userId);
        if (users.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchUsers();
        }
      } catch (error) {
        alert("Gagal menghapus pengguna.");
        console.error(error);
      }
    }
  }
  
  const roleOptions = [ { value: 'all', label: 'Semua Peran' }, { value: 'admin', label: 'Admin' }, { value: 'semi_admin', label: 'Semi Admin' }, { value: 'employee', label: 'Employee' } ];
  const sortOptions = [
    { value: 'name_asc', label: 'Nama (A-Z)' }, { value: 'name_desc', label: 'Nama (Z-A)' },
    { value: 'jabatan_asc', label: 'Jabatan (A-Z)' }, { value: 'jabatan_desc', label: 'Jabatan (Z-A)' },
  ];

  if (loading && !paginationMeta) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg font-semibold text-slate-900">Memuat data pengguna...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Terjadi Kesalahan</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Users className="h-5 w-5 text-white" /></div>
              Manajemen Pengguna
            </h1>
            <p className="text-slate-600 text-base font-medium max-w-2xl leading-relaxed">Kelola akun pengguna, peran, dan hak akses dalam sistem</p>
          </div>
          <button onClick={() => handleOpenModal()} className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105 group">
            <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Kontrol Filter & Sort */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CustomSelect options={roleOptions} value={roleFilter} onChange={(v) => { setRoleFilter(v); setCurrentPage(1); }} placeholder="Filter Peran" icon={FilterIcon} />
        <CustomSelect options={sortOptions} value={sortBy} onChange={(v) => { setSortBy(v); setCurrentPage(1); }} placeholder="Urutkan" icon={ArrowDownUp} />
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Briefcase className="h-4 w-4 text-slate-400" /></div>
          <input
            id="jabatan-filter"
            name="jabatan_filter"
            type="text"
            placeholder="Cari berdasarkan jabatan..."
            value={jabatanFilter}
            onChange={(e) => { setJabatanFilter(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white hover:bg-slate-50 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[300px]"><div className="flex items-center gap-2"><User className="h-3.5 w-3.5" />Pengguna</div></th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[250px]"><div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />Email</div></th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[200px]"><div className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" />Jabatan</div></th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[150px]"><div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5" />Peran</div></th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wide w-[120px]">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {users.map((user, index) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-all group" style={{ animationDelay: `${index * 50}ms` }}>
                    <td className="px-6 py-4 w-[300px]">
                        <div className="flex items-center gap-3">
                            <Avatar user={user} />
                            <div className="font-semibold text-slate-900 truncate">{user.name}</div>
                        </div>
                    </td>
                    <td className="px-6 py-4 w-[250px]"><div className="text-sm text-slate-600 truncate" title={user.email}>{user.email}</div></td>
                    <td className="px-6 py-4 w-[200px]"><div className="text-sm text-slate-600 truncate" title={user.jabatan}>{user.jabatan || '-'}</div></td>
                    <td className="px-6 py-4 w-[150px]"><RoleBadge role={user.role} /></td>
                    <td className="px-6 py-4 text-right w-[120px]"><ActionButtons user={user} onEdit={handleOpenModal} onDelete={handleDelete} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:hidden p-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar user={user} />
                  <div>
                    <h3 className="font-semibold text-slate-900 truncate">{user.name}</h3>
                    <p className="text-sm text-slate-600 truncate">{user.email}</p>
                  </div>
                </div>
                <RoleBadge role={user.role} />
              </div>
              <div className="text-sm text-slate-700 mb-4 p-2.5 bg-slate-50 rounded-lg"><span className="font-semibold">Jabatan:</span> {user.jabatan || 'Tidak ada'}</div>
              <div className="flex justify-end pt-3 border-t border-slate-100"><ActionButtons user={user} onEdit={handleOpenModal} onDelete={handleDelete} /></div>
            </div>
          ))}
        </div>
        <div className="px-6 mb-10">
          <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
        </div>
      </div>
      <UserForm isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleSubmit} initialData={editingUser} />
    </div>
  )
}

export default UserManagementPage
