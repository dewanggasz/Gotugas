"use client"

import { useState, useEffect, useRef } from "react"
import { getStatistics, getUsers } from "../services/api"
import { CheckCircle2, Circle, PlayCircle, XCircle, PlusCircle, AlertTriangle } from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import {
  BarChart3,
  Users,
  ChevronDown,
  User,
  TrendingUp,
  Activity,
  Sparkles,
  Target,
  Award,
  Calendar,
  Star,
} from "lucide-react"
import KpiCard from "../components/KpiCard"

// Vibrant SummaryCard with enhanced animations - Updated to match MoodCard height
const SummaryCard = ({ title, value, icon }) => {
  const iconConfig = {
    created: {
      icon: PlusCircle,
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50",
      border: "border-blue-300",
      shadow: "shadow-blue-200",
      glow: "shadow-blue-500/20",
    },
    completed: {
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-gradient-to-br from-emerald-50 via-green-100 to-teal-50",
      border: "border-emerald-300",
      shadow: "shadow-emerald-200",
      glow: "shadow-emerald-500/20",
    },
    in_progress: {
      icon: PlayCircle,
      color: "text-amber-600",
      bg: "bg-gradient-to-br from-amber-50 via-yellow-100 to-orange-50",
      border: "border-amber-300",
      shadow: "shadow-amber-200",
      glow: "shadow-amber-500/20",
    },
    cancelled: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-gradient-to-br from-red-50 via-rose-100 to-pink-50",
      border: "border-red-300",
      shadow: "shadow-red-200",
      glow: "shadow-red-500/20",
    },
    overdue: {
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-gradient-to-br from-orange-50 via-amber-100 to-yellow-50",
      border: "border-orange-300",
      shadow: "shadow-orange-200",
      glow: "shadow-orange-500/20",
    },
    not_started: {
      icon: Circle,
      color: "text-slate-600",
      bg: "bg-gradient-to-br from-slate-50 via-gray-100 to-zinc-50",
      border: "border-slate-300",
      shadow: "shadow-slate-200",
      glow: "shadow-slate-500/20",
    },
  }

  const config = iconConfig[icon] || iconConfig.created
  const IconComponent = config.icon

  return (
    <div className="group relative h-full">
      <div
        className={`relative bg-white border-2 ${config.border} rounded-3xl p-4 md:p-5 shadow-lg ${config.shadow} hover:shadow-2xl hover:${config.glow} hover:-translate-y-2 transition-all duration-500 overflow-hidden h-full flex flex-col justify-center`}
      >
        {/* Animated background gradient */}
        <div
          className={`absolute inset-0 ${config.bg} opacity-60 group-hover:opacity-80 transition-opacity duration-500`}
        />

        {/* Floating sparkle effect */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div
              className={`p-3 md:p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
            >
              <IconComponent
                className={`h-5 w-5 md:h-6 md:w-6 ${config.color} group-hover:scale-110 transition-transform duration-300`}
              />
            </div>
            {/* Pulse ring effect */}
            <div
              className={`absolute inset-0 rounded-2xl ${config.bg} opacity-0 group-hover:opacity-30 group-hover:scale-150 transition-all duration-700`}
            />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider group-hover:text-slate-800 transition-colors duration-200">
              {title}
            </p>
            <p className="text-2xl md:text-3xl font-black text-slate-900 group-hover:scale-110 transition-transform duration-300">
              {value}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced MoodCard with more personality
const MoodCard = ({ mood, isLoading }) => (
  <div className="group relative h-full">
    <div className="relative bg-gradient-to-br from-indigo-50 via-blue-100 to-cyan-50 border-2 border-indigo-300 rounded-3xl p-4 md:p-5 shadow-lg shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 transition-all duration-500 overflow-hidden h-full flex flex-col justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 group-hover:from-indigo-400/20 group-hover:to-cyan-400/20 transition-all duration-500" />

      {/* Floating particles */}
      <div className="absolute top-3 right-3 w-1 h-1 bg-indigo-400 rounded-full animate-bounce delay-300" />
      <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse delay-700" />

      {isLoading ? (
        <div className="relative z-10 flex items-center justify-center h-20">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mood Tim</p>
          </div>

          <div className="text-4xl group-hover:scale-125 transition-transform duration-500 animate-bounce">
            {getMoodDisplay(mood?.average_score).emoji}
          </div>

          <div>
            <p
              className={`text-sm md:text-base font-black ${getMoodDisplay(mood?.average_score).color} transition-colors duration-300 mb-2`}
            >
              {getMoodDisplay(mood?.average_score).text}
            </p>
            {mood?.average_score && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-16 h-2 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${(mood.average_score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-600 font-bold">{mood.average_score.toFixed(1)}/5</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
)

// Enhanced Select with better styling
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
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100 group"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          {Icon && (
            <Icon className="h-5 w-5 text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
          )}
          <span className="font-semibold text-slate-700 text-sm truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 text-blue-400 transition-all duration-300 group-hover:text-blue-600 ${
            isOpen ? "rotate-180 text-blue-600 scale-110" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul className="absolute z-30 w-full bg-white border-2 border-blue-200 rounded-2xl shadow-2xl shadow-blue-100 mt-2 max-h-60 overflow-auto animate-in slide-in-from-top-2 duration-200 backdrop-blur-sm">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`px-4 py-3 text-sm cursor-pointer transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 ${
                option.value === value
                  ? "bg-gradient-to-r from-blue-100 to-indigo-100 font-bold text-blue-900 border-l-4 border-blue-500"
                  : "text-slate-700 hover:text-slate-900"
              }`}
            >
              <span className="truncate block">{option.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const getMoodDisplay = (score) => {
  if (score === null || score === undefined) {
    return { emoji: "🤔", text: "Data Kurang", color: "text-slate-500" }
  }
  if (score > 4.5) return { emoji: "🚀", text: "Luar Biasa!", color: "text-emerald-600" }
  if (score > 3.5) return { emoji: "😊", text: "Senang", color: "text-blue-600" }
  if (score > 2.5) return { emoji: "🙂", text: "Cukup Baik", color: "text-indigo-600" }
  if (score > 1.5) return { emoji: "😐", text: "Netral", color: "text-slate-600" }
  if (score > 0) return { emoji: "😟", text: "Perlu Perhatian", color: "text-amber-600" }
  return { emoji: "😢", text: "Butuh Dukungan", color: "text-red-600" }
}

// Enhanced ChartCard with better height management
const ChartCard = ({
  title,
  children,
  isLoading,
  className = "",
  minWidth = 600,
  height = 320,
  noHorizontalScroll = false,
}) => (
  <div
    className={`group bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200 rounded-3xl p-4 md:p-6 shadow-lg shadow-blue-100 hover:shadow-2xl hover:shadow-blue-200 hover:-translate-y-1 transition-all duration-500 ${className}`}
  >
    <div className="flex items-center gap-3 mb-6 pt-2 pl-1">
      <div className="relative">
        <div className="p-1 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
      </div>
      <h3 className="text-md md:text-xl font-black bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
        {title}
      </h3>
    </div>

    {isLoading ? (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          <span className="text-sm font-bold text-slate-600 animate-pulse">Memuat grafik...</span>
        </div>
      </div>
    ) : (
      <div className="w-full">
        {noHorizontalScroll ? (
          // No horizontal scroll - for pie charts
          <ResponsiveContainer width="100%" height={height}>
            {children}
          </ResponsiveContainer>
        ) : (
          // Horizontal scroll container for other charts
          <>
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
              <div style={{ minWidth: `${minWidth}px` }} className="md:min-w-0">
                <ResponsiveContainer width="100%" height={height}>
                  {children}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mobile scroll indicator */}
            <div className="md:hidden flex justify-center mt-3">
              <div className="flex items-center gap-1 text-xs text-slate-500 bg-blue-50 px-3 py-1 rounded-full">
                <span>←</span>
                <span>Geser untuk melihat lebih</span>
                <span>→</span>
              </div>
            </div>
          </>
        )}
      </div>
    )}
  </div>
)

// Vibrant Filter Button
const FilterButton = ({ value, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-2.5 text-sm font-bold rounded-2xl transition-all duration-300 whitespace-nowrap transform hover:scale-105 overflow-hidden ${
      isActive
        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-300 hover:shadow-xl"
        : "bg-gradient-to-r from-white to-blue-50 text-slate-700 hover:from-blue-50 hover:to-indigo-50 border-2 border-blue-200 hover:border-blue-300 hover:text-blue-700 hover:shadow-lg shadow-blue-100"
    }`}
  >
    {isActive && (
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 animate-pulse" />
    )}
    <span className="relative z-10 flex items-center gap-1">
      {isActive && <Star className="w-3 h-3" />}
      {label}
    </span>
  </button>
)

// Enhanced Individual Mood Card
const AnimatedMoodCard = ({ mood, isLoading }) => (
  <div className="group relative">
    <div className="relative bg-gradient-to-br from-indigo-50 via-blue-100 to-cyan-50 border-2 border-indigo-300 rounded-3xl p-4 md:p-6 shadow-lg shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 group-hover:from-indigo-400/20 group-hover:to-cyan-400/20 transition-all duration-500" />

      {isLoading ? (
        <div className="relative z-10 flex items-center justify-center h-16 md:h-20">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex flex-col md:flex-row items-center md:space-x-4 space-y-3 md:space-y-0 text-center md:text-left">
          <div className="text-4xl md:text-6xl group-hover:scale-125 transition-transform duration-500 animate-bounce">
            {getMoodDisplay(mood?.average_score).emoji}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-700 mb-2 flex items-center justify-center md:justify-start gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
              Mood Personal
            </p>
            <p className={`text-lg md:text-2xl font-black ${getMoodDisplay(mood?.average_score).color} mb-3`}>
              {getMoodDisplay(mood?.average_score).text}
            </p>
            {mood?.average_score && (
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="w-24 h-3 bg-white/50 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${(mood.average_score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-600 font-bold">{mood.average_score.toFixed(1)}/5.0</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
)

export default function StatisticsPage({ currentUser }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [period, setPeriod] = useState("30d")
  const [isMobile, setIsMobile] = useState(false)
  const individualMood = dashboardData?.individual_mood
  const overallMood = dashboardData?.overall_mood

  const [customRange, setCustomRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 29)).toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  })

  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState("")

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (currentUser?.role === "admin" || currentUser?.role === "semi_admin") {
      getUsers()
        .then((res) => setUsers(res.data.data))
        .catch(console.error)
    }
  }, [currentUser])

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      setError("")
      try {
        const params = { period }
        if (period === "custom") {
          params.start_date = customRange.start_date
          params.end_date = customRange.end_date
        }
        if ((currentUser?.role === "admin" || currentUser?.role === "semi_admin") && selectedUserId) {
          params.user_id = selectedUserId
        }
        const response = await getStatistics(params)
        setDashboardData(response.data)
      } catch (err) {
        setError("Gagal memuat data statistik. Pastikan rentang tanggal valid.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllData()
  }, [period, customRange, selectedUserId, currentUser])

  const handleCustomRangeChange = (e) => {
    setCustomRange((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const summary = dashboardData?.summary
  const trendData = dashboardData?.trend || []
  const statusData = dashboardData?.status_composition?.filter((item) => item.value > 0) || []
  const performanceData = dashboardData?.performance || []
  const moodTrendData = dashboardData?.mood_trend || []
  const kpiData = dashboardData?.kpi_data || []

  const PIE_COLORS = {
    not_started: "#64748b",
    in_progress: "#3b82f6",
    completed: "#10b981",
    cancelled: "#ef4444",
    unknown: "#9ca3af",
  }

  const PERFORMANCE_COLORS = {
    completed: "#10b981",
    in_progress: "#3b82f6",
    not_started: "#64748b",
    overdue: "#f59e0b",
    cancelled: "#ef4444",
  }

  const statusLabels = {
    not_started: "Belum Dimulai",
    in_progress: "Dikerjakan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    unknown: "Tidak Diketahui",
  }

  const coloredStatusData = statusData.map((item) => {
    const rawStatusName = item.name
    const statusKey = rawStatusName ? rawStatusName.toLowerCase().replace(/ /g, "_") : "unknown"

    return {
      ...item,
      label: statusLabels[statusKey] || rawStatusName || "Tidak Diketahui",
      fill: PIE_COLORS[statusKey] || "#9ca3af",
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-cyan-50/30 relative overflow-hidden">
      {/* Enhanced background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 rounded-full blur-2xl animate-pulse delay-500" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-12">
        {/* Enhanced Header */}
        <div className="mb-8 md:mb-12 animate-in slide-in-from-top duration-500">
          <div className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="text-center lg:text-left">
              <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-4 mb-4">
                <div className="relative">
                  <div className="p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-600 rounded-3xl shadow-xl shadow-blue-300">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent tracking-tight mb-2">
                    Analytics Dashboard ✨
                  </h1>
                  <p className="text-slate-600 text-sm md:text-base font-medium">
                    Real-time insights & performance metrics 🚀
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Filter Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3">
              <FilterButton value="7d" label="7 Hari" isActive={period === "7d"} onClick={() => setPeriod("7d")} />
              <FilterButton value="30d" label="30 Hari" isActive={period === "30d"} onClick={() => setPeriod("30d")} />
              <FilterButton value="90d" label="90 Hari" isActive={period === "90d"} onClick={() => setPeriod("90d")} />
              <FilterButton
                value="this_year"
                label="Tahun Ini"
                isActive={period === "this_year"}
                onClick={() => setPeriod("this_year")}
              />
              <FilterButton
                value="custom"
                label="Custom"
                isActive={period === "custom"}
                onClick={() => setPeriod("custom")}
              />
            </div>
          </div>

          {/* User Selection */}
          {(currentUser?.role === "admin" || currentUser?.role === "semi_admin") && (
            <div className="mt-8 animate-in slide-in-from-left duration-700">
              <div className="bg-gradient-to-br from-white to-blue-50/50 border-2 border-blue-200 rounded-3xl p-6 shadow-lg shadow-blue-100 hover:shadow-xl hover:shadow-blue-200 transition-all duration-300">
                <label className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Users className="w-5 h-5 text-blue-500" />
                  Filter Pengguna
                </label>
                <CustomSelect
                  options={[
                    { value: "", label: "Semua Pengguna", icon: Users },
                    ...users.map((user) => ({ value: user.id, label: user.name, icon: User })),
                  ]}
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  placeholder="Pilih Pengguna"
                  icon={Users}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Individual Mood */}
          {selectedUserId && period !== "custom" && (
            <div className="mt-6 animate-in slide-in-from-right duration-700">
              <AnimatedMoodCard mood={individualMood} isLoading={isLoading} />
            </div>
          )}

          {/* Custom Date Range */}
          {period === "custom" && (
            <div className="mt-6 animate-in slide-in-from-bottom duration-700">
              <div className="bg-gradient-to-br from-white to-blue-50/50 border-2 border-blue-200 rounded-3xl p-6 shadow-lg shadow-blue-100">
                <p className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Rentang Tanggal Custom
                </p>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={customRange.start_date}
                      onChange={handleCustomRangeChange}
                      className="w-full px-4 py-3 bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 hover:border-blue-300 font-medium"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={customRange.end_date}
                      onChange={handleCustomRangeChange}
                      className="w-full px-4 py-3 bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 hover:border-blue-300 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && !dashboardData ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animate-reverse"></div>
              </div>
              <div className="text-center">
                <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Loading Dashboard... ✨
                </span>
                <p className="text-sm text-slate-500 mt-1 font-medium">Analyzing your awesome data 🚀</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-3xl p-8 shadow-lg shadow-red-100">
            <p className="text-red-700 font-bold text-center text-lg">{error}</p>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 items-stretch">
                <div className="animate-in slide-in-from-left duration-500 delay-100 h-full">
                  <SummaryCard title="Dibuat" value={summary.created_in_period} icon="created" />
                </div>
                <div className="animate-in slide-in-from-left duration-500 delay-200 h-full">
                  <SummaryCard title="Selesai" value={summary.completed_in_period} icon="completed" />
                </div>
                <div className="animate-in slide-in-from-left duration-500 delay-300 h-full">
                  <SummaryCard title="Dikerjakan" value={summary.in_progress_in_period} icon="in_progress" />
                </div>
                <div className="animate-in slide-in-from-left duration-500 delay-400 h-full">
                  <SummaryCard title="Dibatalkan" value={summary.cancelled_in_period} icon="cancelled" />
                </div>
                <div className="animate-in slide-in-from-left duration-500 delay-500 h-full">
                  <SummaryCard title="Terlambat" value={summary.overdue} icon="overdue" />
                </div>
                <div className="animate-in slide-in-from-left duration-500 delay-600 h-full">
                  <MoodCard mood={overallMood} isLoading={isLoading} />
                </div>
              </div>
            )}

            {/* KPI Section */}
            {(currentUser?.role === "admin" || currentUser?.role === "semi_admin") && (
              <div className="animate-in slide-in-from-bottom duration-700 delay-300">
                <div className="flex items-center gap-3 mb-6 mt-15">
                  <div className="relative">
                    <div className="p-2 md:p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
                  </div>
                  <h2 className="text-md md:text-2xl font-black bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent">
                    Performance Indicators
                  </h2>
                </div>

                {isLoading ? (
                  <div className="bg-gradient-to-br from-white to-emerald-50/50 border-2 border-emerald-200 rounded-3xl p-8 shadow-lg text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <p className="text-slate-600 font-medium">Loading KPI data...</p>
                  </div>
                ) : kpiData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kpiData.map((user) => (
                      <KpiCard key={user.id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-3xl p-8 shadow-lg text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                      <Target className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-medium">No KPI data available for selected period</p>
                  </div>
                )}
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Trend Chart with horizontal scroll */}
              <div className="lg:col-span-3 animate-in slide-in-from-bottom duration-700 delay-400">
                <ChartCard title="Task Creation Trend" isLoading={isLoading} minWidth={700} height={350}>
                  <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                      interval={0}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: "2px solid #3b82f6",
                        borderRadius: "16px",
                        boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Tugas Dibuat"
                      stroke="#3b82f6"
                      fill="url(#colorTrend)"
                      strokeWidth={3}
                      dot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#3b82f6", stroke: "#fff", strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ChartCard>
              </div>

              {/* Status Composition */}
              <div className="lg:col-span-2 animate-in slide-in-from-bottom duration-700 delay-500">
                <ChartCard title="Status Distribution" isLoading={isLoading} height={350} noHorizontalScroll={true}>
                  {statusData.length > 0 ? (
                    <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={isMobile ? 45 : 65}
                        outerRadius={isMobile ? 85 : 110}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          backdropFilter: "blur(10px)",
                          border: "2px solid #e2e8f0",
                          borderRadius: "16px",
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: "11px",
                          color: "#64748b",
                          paddingTop: "10px",
                          fontWeight: 600,
                        }}
                        verticalAlign="bottom"
                        height={36}
                      />
                    </PieChart>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                          <BarChart3 className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No data available</p>
                      </div>
                    </div>
                  )}
                </ChartCard>
              </div>
            </div>

            {/* Performance Chart with proper height calculation */}
            {(currentUser?.role === "admin" || currentUser?.role === "semi_admin") && (
              <div className="animate-in slide-in-from-bottom duration-700 delay-600">
                <div className="group bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-200 rounded-3xl p-4 md:p-6 shadow-lg shadow-blue-100 hover:shadow-2xl hover:shadow-blue-200 hover:-translate-y-1 transition-all duration-500">
                  <div className="flex items-center gap-3 mb-6 pl-1 pt-2">
                    <div className="relative">
                      <div className="p-1 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
                    </div>
                    <h3 className="text-md md:text-xl font-black bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                      Individual Performance
                    </h3>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-indigo-400 rounded-full animate-spin animate-reverse"></div>
                        </div>
                        <span className="text-sm font-bold text-slate-600 animate-pulse">Memuat grafik...</span>
                      </div>
                    </div>
                  ) : performanceData.length > 0 ? (
                    <div className="w-full">
                      {/* Desktop: Full height, Mobile: Fixed height with vertical scroll */}
                      <div
                        className={`${isMobile ? "h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100" : ""}`}
                      >
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
                          <div style={{ minWidth: "800px" }} className="md:min-w-0">
                            <ResponsiveContainer
                              width="100%"
                              height={
                                isMobile
                                  ? performanceData.length * 60 + 100
                                  : Math.max(400, performanceData.length * 50 + 100)
                              }
                            >
                              <BarChart
                                data={performanceData}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: isMobile ? 50 : 60, bottom: 20 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  type="number"
                                  tick={{ fontSize: 11, fill: "#64748b" }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis
                                  type="category"
                                  dataKey="name"
                                  tick={{ fontSize: isMobile ? 10 : 11, fill: "#64748b" }}
                                  axisLine={false}
                                  tickLine={false}
                                  width={isMobile ? 45 : 55}
                                  interval={0}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    backdropFilter: "blur(10px)",
                                    border: "2px solid #cbd5e1",
                                    borderRadius: "16px",
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                  }}
                                />
                                <Legend
                                  wrapperStyle={{
                                    paddingTop: "20px",
                                    fontSize: isMobile ? "10px" : "12px",
                                    fontWeight: 600,
                                  }}
                                />
                                <Bar
                                  dataKey="Selesai"
                                  stackId="a"
                                  fill={PERFORMANCE_COLORS.completed}
                                  radius={[0, 4, 4, 0]}
                                />
                                <Bar dataKey="Dikerjakan" stackId="a" fill={PERFORMANCE_COLORS.in_progress} />
                                <Bar dataKey="Belum Dimulai" stackId="a" fill={PERFORMANCE_COLORS.not_started} />
                                <Bar dataKey="Terlambat" stackId="a" fill={PERFORMANCE_COLORS.overdue} />
                                <Bar dataKey="Dibatalkan" stackId="a" fill={PERFORMANCE_COLORS.cancelled} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Mobile scroll indicators */}
                      {isMobile && (
                        <div className="flex justify-between mt-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                            <span>←</span>
                            <span>Geser horizontal</span>
                            <span>→</span>
                          </div>
                          <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full">
                            <span>↑</span>
                            <span>Scroll vertikal</span>
                            <span>↓</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                          <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No performance data</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mood Trend Chart with better spacing */}
            <div className="animate-in slide-in-from-bottom duration-700 delay-700">
              <ChartCard title="Daily Mood Trends 😊" isLoading={isLoading} minWidth={800} height={380}>
                {moodTrendData.some((d) => d.score !== null) ? (
                  <AreaChart data={moodTrendData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 5.5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickFormatter={(value) => {
                        const labels = { 1: "😢", 2: "😐", 3: "🙂", 4: "😊", 5: "🚀" }
                        return labels[value] || ""
                      }}
                      tick={{ fontSize: 14, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip
                      formatter={(value) => {
                        const labels = {
                          1: "Butuh Dukungan",
                          2: "Netral",
                          3: "Cukup Baik",
                          4: "Senang",
                          5: "Luar Biasa",
                        }
                        const displayValue = Number.isInteger(value) ? labels[value] : `${value.toFixed(1)}/5`
                        return [displayValue, "Mood Score"]
                      }}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        border: "2px solid #f59e0b",
                        borderRadius: "16px",
                        boxShadow: "0 25px 50px -12px rgba(245, 158, 11, 0.25)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#f59e0b"
                      fill="url(#colorMood)"
                      strokeWidth={3}
                      connectNulls={false}
                      dot={{ r: 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "#f59e0b", stroke: "#fff", strokeWidth: 3 }}
                    />
                  </AreaChart>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No mood data available</p>
                    </div>
                  </div>
                )}
              </ChartCard>
            </div>
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-blue-300::-webkit-scrollbar-thumb {
          background-color: #93c5fd;
          border-radius: 9999px;
        }
        
        .scrollbar-track-blue-100::-webkit-scrollbar-track {
          background-color: #dbeafe;
          border-radius: 9999px;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
          width: 6px;
        }
      `}</style>
    </div>
  )
}
