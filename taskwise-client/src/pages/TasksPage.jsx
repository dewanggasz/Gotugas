"use client"

import { useState, useEffect, useRef } from "react"
// --- 1. Impor fungsi getTask ---
import { getTasks, getTask, createTask, updateTask, deleteTask, getUsers } from "../services/api"
import Modal from "../components/Modal"
import TaskForm from "../components/TaskForm"
import TaskDetailModal from "../components/TaskDetailModal"
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Search,
  Filter,
  User,
  Users,
  ArrowDownUp,
  ChevronDown,
  Clock,
  CheckCircle2,
  Circle,
  XCircle,
  PlayCircle,
  Calendar,
  Target,
} from "lucide-react"

// ... (semua komponen helper seperti useDebounce, CustomSelect, dll. tetap sama)
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
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleOptionClick = (optionValue) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-slate-50 hover:border-slate-400 group min-h-[40px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-slate-500 group-hover:text-slate-700 transition-colors" />}
          <span className="font-medium text-slate-700 text-sm truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-all duration-200 group-hover:text-slate-600 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul
          className="absolute z-30 w-full bg-white border border-slate-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`px-3 py-2.5 text-sm cursor-pointer transition-all duration-150 first:rounded-t-lg last:rounded-b-lg ${
                option.value === value
                  ? "bg-blue-50 font-semibold text-blue-900 border-l-3 border-blue-500"
                  : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

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
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Sebelumnya
          </button>

          <div className="flex items-center space-x-1">
            {getVisiblePages().map((page, index) =>
              page === "..." ? (
                <span key={`dot-${index}`} className="px-2 py-2 text-slate-400 font-medium text-sm">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    page === meta.current_page
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400"
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
            className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const statusConfig = {
    not_started: {
      label: "Belum Dimulai",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      icon: Circle,
    },
    in_progress: {
      label: "Dikerjakan",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      icon: PlayCircle,
    },
    completed: {
      label: "Selesai",
      color: "bg-green-100 text-green-700 border-green-200",
      icon: CheckCircle2,
    },
    cancelled: {
      label: "Dibatalkan",
      color: "bg-red-100 text-red-700 border-red-200",
      icon: XCircle,
    },
  }

  const config = statusConfig[status] || statusConfig.not_started
  const IconComponent = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border whitespace-nowrap ${config.color}`}
    >
      <IconComponent className="h-3 w-3" />
      {config.label}
    </span>
  )
}

const Avatar = ({ user, size = "sm" }) => {
  if (!user) return null

  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
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
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 flex items-center justify-center font-semibold text-blue-700 overflow-hidden`}
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

const CollaboratorAvatars = ({ collaborators, creator }) => {
  if (!creator) return null

  const otherCollaborators = collaborators.filter((c) => c.id !== creator.id)

  if (otherCollaborators.length === 0) {
    return (
      <div className="flex items-center">
        <Avatar user={creator} />
      </div>
    )
  }

  return (
    <div className="flex items-center -space-x-1">
      {otherCollaborators.slice(0, 2).map((user) => (
        <Avatar key={user.id} user={user} />
      ))}
      {otherCollaborators.length > 2 && (
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center text-xs font-bold text-white border border-slate-400">
          +{otherCollaborators.length - 2}
        </div>
      )}
    </div>
  )
}

const ActionButtons = ({ task, onEdit, onDelete, onView, currentUser }) => {
  const canModify = task.collaborators.some((c) => c.id === currentUser?.id && c.permission === "edit")
  const canDelete = task.user?.id === currentUser?.id || currentUser?.role === "admin"

  return (
    <div className="flex items-center justify-end space-x-1">
      <button
        onClick={() => onView(task)}
        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-all duration-200 group"
        title="Lihat Detail"
      >
        <Eye className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
      </button>
      {canModify && (
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 group"
          title="Edit Tugas"
        >
          <Pencil className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
        </button>
      )}
      {canDelete && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onDelete(task.id)
          }}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 group"
          title="Hapus Tugas"
        >
          <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  )
}

const TaskDisplay = ({ tasks, onEdit, onDelete, onView, currentUser }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const truncateTitle = (title, maxWords = 5) => {
    if (!title) return ""
    const words = title.split(" ")
    if (words.length <= maxWords) return title
    return words.slice(0, maxWords).join(" ") + "..."
  }

  const isOverdue = (dueDateString) => {
    if (!dueDateString) return false
    return new Date(dueDateString) < new Date()
  }

  return (
    <>
      {/* Desktop Table View with Fixed Column Widths */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[280px]">
                  <div className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5" />
                    Tugas
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[120px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-3.5 w-3.5" />
                    Status
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[140px]">
                  <div className="flex items-center gap-2">
                    <Users className="h-3.5 w-3.5" />
                    Tim
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[120px]">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Pembuat
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[110px]">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Dibuat
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide w-[150px]">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    Jatuh Tempo
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide w-[70px]">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {tasks.map((task, index) => (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-4 py-3 w-[280px]">
                    <div className="flex flex-col">
                      <div
                        className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate pr-2"
                        title={task.title}
                      >
                        {truncateTitle(task.title)}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 w-[120px]">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-3 py-3 w-[140px]">
                    <CollaboratorAvatars collaborators={task.collaborators} creator={task.user} />
                  </td>
                  <td className="px-3 py-3 w-[120px]">
                    <div className="flex items-center">
                      
                      <span className="text-xs font-medium text-slate-700 truncate" title={task.user?.name}>
                        {task.user?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 w-[110px]">
                    <span className="text-xs text-slate-600 font-medium">{formatDate(task.created_at)}</span>
                  </td>
                  <td className="px-3 py-3 w-[150px]">
                    <span
                      className={`text-xs font-medium ${
                        isOverdue(task.due_date) ? "text-red-600 font-semibold" : "text-slate-700"
                      }`}
                    >
                      {formatDate(task.due_date)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-left w-[70px]">
                    <ActionButtons
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onView={onView}
                      currentUser={currentUser}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-between items-start mb-4 gap-x-3">
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-slate-900 mb-1 text-base group-hover:text-blue-600 transition-colors"
                  title={task.title}
                >
                  {truncateTitle(task.title)}
                </h3>
              </div>
              <StatusBadge status={task.status} />
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Tim</span>
                </div>
                <CollaboratorAvatars collaborators={task.collaborators} creator={task.user} />
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Pembuat</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Avatar user={task.user} size="sm" />
                  <span className="text-sm font-medium text-slate-700">{task.user?.name}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Jatuh Tempo</span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    isOverdue(task.due_date) ? "text-red-600 font-semibold" : "text-slate-700"
                  }`}
                >
                  {formatDate(task.due_date)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <ActionButtons
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
                currentUser={currentUser}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}


export default function TasksPage({ currentUser }) {
  const [tasks, setTasks] = useState([])
  const [paginationMeta, setPaginationMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [selectedUserId, setSelectedUserId] = useState("all")

  const [isEditModalOpen, setIsEditModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [viewingTask, setViewingTask] = useState(null)

  const [users, setUsers] = useState([])
  const [forceRefetch, setForceRefetch] = useState(0)
  const [deletingTaskId, setDeletingTaskId] = useState(null)

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const usersResponse = await getUsers()
        setUsers(usersResponse.data.data.filter((u) => u.role !== "admin"))
      } catch (err) {
        console.error("Gagal memuat daftar pengguna", err)
        setError("Gagal memuat daftar pengguna.")
      }
    }
    if (currentUser) {
      fetchAllUsers()
    }
  }, [currentUser])

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true)
      setError("")
      try {
        const params = {
          status: statusFilter,
          sort_by: sortBy,
          page: currentPage,
          search: debouncedSearchTerm,
          user_id: selectedUserId,
        }
        const response = await getTasks(params)
        setTasks(response.data.data)
        setPaginationMeta(response.data.meta)
      } catch (err) {
        setError("Gagal memuat tugas.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    if (currentUser) {
      fetchTasks()
    }
  }, [statusFilter, sortBy, currentPage, debouncedSearchTerm, currentUser, forceRefetch, selectedUserId])

  // --- 2. LOGIKA BARU DI SINI ---
  // Efek ini berjalan sekali saat komponen dimuat untuk menangani deep link
  useEffect(() => {
    const path = window.location.pathname;
    // Mencocokkan URL seperti /tasks/111
    const match = path.match(/\/tasks\/(\d+)/);
    const taskIdFromUrl = match ? parseInt(match[1], 10) : null;

    if (taskIdFromUrl) {
      const fetchAndOpenTask = async () => {
        try {
          console.log(`Mencoba memuat tugas dengan ID: ${taskIdFromUrl}`);
          const response = await getTask(taskIdFromUrl);
          handleOpenDetailModal(response.data.data);
          
          // Membersihkan URL setelah modal dibuka untuk menghindari pembukaan berulang
          window.history.replaceState(null, '', '/tasks');
        } catch (error) {
          console.error("Gagal memuat detail tugas dari URL", error);
          alert("Tugas dengan ID tersebut tidak ditemukan atau Anda tidak memiliki akses.");
          window.history.replaceState(null, '', '/tasks');
        }
      };

      fetchAndOpenTask();
    }
  }, []); // Dependensi kosong berarti ini hanya berjalan sekali

  useEffect(() => {
    if (isEditModalOpen && editingTask) {
      const updatedTaskInList = tasks.find((t) => t.id === editingTask.id)
      if (updatedTaskInList) {
        setEditingTask(updatedTaskInList)
      }
    }
  }, [tasks, isEditModalOpen, editingTask])

  const handleFilterChange = (value) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleUserFilterChange = (value) => {
    setSelectedUserId(value)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleOpenCreateModal = () => {
    setEditingTask(null)
    setIsEditModal(true)
  }

  const handleOpenEditModal = (task) => {
    setEditingTask(task)
    setIsEditModal(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModal(false)
    setEditingTask(null)
  }

  const handleOpenDetailModal = (task) => {
    setViewingTask(task)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setViewingTask(null)
  }

  const refreshTasks = () => {
    setForceRefetch((c) => c + 1)
  }

  const handleFormSubmit = async (taskData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData)
      } else {
        await createTask(taskData)
      }
      handleCloseEditModal()
      refreshTasks()
    } catch (err) {
      console.error("Gagal menyimpan tugas", err)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus tugas ini?")) {
      try {
        setDeletingTaskId(taskId)
        await deleteTask(taskId)
        refreshTasks()
        console.log("Tugas berhasil dihapus")
      } catch (err) {
        console.error("Gagal menghapus tugas", err)
        setError("Gagal menghapus tugas. Silakan coba lagi.")
        alert("Gagal menghapus tugas. Silakan coba lagi.")
      } finally {
        setDeletingTaskId(null)
      }
    }
  }

  const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "not_started", label: "Belum Dimulai" },
    { value: "in_progress", label: "Dikerjakan" },
    { value: "completed", label: "Selesai" },
    { value: "cancelled", label: "Dibatalkan" },
  ]

  const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "oldest", label: "Terlama" },
    { value: "due_date_asc", label: "Jatuh Tempo (Asc)" },
    { value: "due_date_desc", label: "Jatuh Tempo (Desc)" },
  ]

  const userFilterOptions = [
    { value: "all", label: "Semua Pengguna" },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Manajemen Tugas
              </h1>
              <p className="text-slate-600 text-base font-medium max-w-2xl leading-relaxed">
                Kelola dan pantau semua tugas Anda dengan efisien dan terorganisir
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Buat Tugas Baru
            </button>
          </div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-end gap-4">
            {/* Enhanced Search */}
            <div className="relative flex-1 max-w-full xl:max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari tugas berdasarkan judul atau deskripsi..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white hover:border-slate-400 font-medium placeholder:text-slate-400"
              />
            </div>

            {/* Enhanced Filters with proper sizing */}
            <div className="flex flex-col sm:flex-row gap-3 xl:flex-none">
              {currentUser?.role === "admin" && (
                <CustomSelect
                  options={userFilterOptions}
                  value={selectedUserId}
                  onChange={handleUserFilterChange}
                  placeholder="Filter Pengguna"
                  icon={Users}
                  className="w-full sm:w-48"
                />
              )}
              <CustomSelect
                options={statusOptions}
                value={statusFilter}
                onChange={handleFilterChange}
                placeholder="Pilih Status"
                icon={Filter}
                className="w-full sm:w-40"
              />
              <CustomSelect
                options={sortOptions}
                value={sortBy}
                onChange={handleSortChange}
                placeholder="Urutkan Berdasarkan"
                icon={ArrowDownUp}
                className="w-full sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center space-y-4 text-slate-600">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900 mb-1">Memuat tugas...</p>
                <p className="text-sm text-slate-600">Mohon tunggu sebentar</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Terjadi Kesalahan</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : tasks.length > 0 ? (
          <>
            <TaskDisplay
              tasks={tasks}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTask}
              onView={handleOpenDetailModal}
              currentUser={currentUser}
            />
            <Pagination meta={paginationMeta} onPageChange={handlePageChange} />
          </>
        ) : (
          <div className="text-center py-24">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Tidak ada tugas</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Belum ada tugas yang dibuat. Mulai dengan membuat tugas pertama Anda dan tingkatkan produktivitas tim.
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group"
              >
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Buat Tugas Pertama
              </button>
            </div>
          </div>
        )}

        {/* Modals */}
        {isEditModalOpen && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            title={editingTask ? "Edit Tugas" : "Buat Tugas Baru"}
          >
            <div className="max-h-[80vh] overflow-y-auto p-1 pr-4 -mr-4">
              <TaskForm
                onSubmit={handleFormSubmit}
                onCancel={handleCloseEditModal}
                task={editingTask}
                users={users}
                currentUser={currentUser}
                onAttachmentUpdate={refreshTasks}
              />
            </div>
          </Modal>
        )}

        {viewingTask && (
          <TaskDetailModal
            isOpen={isDetailModalOpen}
            onClose={handleCloseDetailModal}
            task={viewingTask}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  )
}
