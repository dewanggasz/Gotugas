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
import { BarChart3, Users, ChevronDown, User, TrendingUp, Activity, Sparkles } from "lucide-react"
import KpiCard from '../components/KpiCard';

// Enhanced SummaryCard with better mobile layout
const SummaryCard = ({ title, value, icon }) => {
  const iconConfig = {
    created: {
      icon: PlusCircle,
      color: "text-blue-600",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      border: "border-blue-200",
      shadow: "shadow-blue-100",
    },
    completed: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      border: "border-green-200",
      shadow: "shadow-green-100",
    },
    in_progress: {
      icon: PlayCircle,
      color: "text-yellow-600",
      bg: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      border: "border-yellow-200",
      shadow: "shadow-yellow-100",
    },
    cancelled: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-gradient-to-br from-red-50 to-red-100",
      border: "border-red-200",
      shadow: "shadow-red-100",
    },
    overdue: {
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-gradient-to-br from-orange-50 to-orange-100",
      border: "border-orange-200",
      shadow: "shadow-orange-100",
    },
    not_started: {
      icon: Circle,
      color: "text-slate-600",
      bg: "bg-gradient-to-br from-slate-50 to-slate-100",
      border: "border-slate-200",
      shadow: "shadow-slate-100",
    },
  }

  const config = iconConfig[icon] || iconConfig.created
  const IconComponent = config.icon

  return (
    <div
      className={`bg-white border-2 ${config.border} rounded-2xl p-4 shadow-lg ${config.shadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 hover:border-opacity-80 group`}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div
          className={`p-3 rounded-xl ${config.bg} group-hover:scale-110 transition-transform duration-300 shadow-sm`}
        >
          <IconComponent
            className={`h-5 w-5 ${config.color} group-hover:scale-110 transition-transform duration-300`}
          />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-1 group-hover:text-slate-700 transition-colors duration-200">
            {title}
          </p>
          <p className="text-2xl font-bold text-slate-900 group-hover:scale-105 transition-transform duration-200">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

// Enhanced MoodCard with better mobile layout
const MoodCard = ({ mood, isLoading }) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300 hover:-translate-y-1">
    {isLoading ? (
      <div className="flex items-center justify-center h-20">
        <div className="animate-pulse text-slate-400 text-xs">Memuat mood...</div>
      </div>
    ) : (
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <p className="text-xs font-semibold text-slate-600">Mood Tim</p>
        </div>
        <div className="text-3xl animate-bounce">{getMoodDisplay(mood?.average_score).emoji}</div>
        <div>
          <p
            className={`text-sm font-bold ${getMoodDisplay(mood?.average_score).color} transition-colors duration-300`}
          >
            {getMoodDisplay(mood?.average_score).text}
          </p>
          {mood?.average_score && (
            <p className="text-xs text-slate-500 mt-1">Skor: {mood.average_score.toFixed(1)}/5.0</p>
          )}
        </div>
      </div>
    )}
  </div>
)

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
        className="w-full flex items-center justify-between px-4 py-3 border border-blue-200 rounded-xl text-sm focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white hover:bg-blue-50 hover:border-blue-300 hover:shadow-md group min-h-[44px]"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-blue-500 group-hover:text-blue-600 transition-colors duration-200" />}
          <span className="font-medium text-slate-700 text-sm truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`h-5 w-5 text-blue-400 transition-all duration-300 group-hover:text-blue-600 flex-shrink-0 ${
            isOpen ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul
          className="absolute z-30 w-full bg-white border border-blue-200 rounded-xl shadow-xl mt-2 max-h-60 overflow-auto animate-in slide-in-from-top-2 duration-200"
          role="listbox"
        >
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`px-4 py-3 text-sm cursor-pointer transition-all duration-200 first:rounded-t-xl last:rounded-b-xl hover:bg-blue-50 ${
                option.value === value
                  ? "bg-blue-100 font-semibold text-blue-900 border-l-4 border-blue-500"
                  : "text-slate-700 hover:text-slate-900"
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

const getMoodDisplay = (score) => {
  if (score === null || score === undefined) {
    return { emoji: "🤔", text: "Data Kurang", color: "text-slate-500" }
  }
  if (score > 4.5) return { emoji: "😄", text: "Sangat Gembira", color: "text-green-600" }
  if (score > 3.5) return { emoji: "😊", text: "Senang", color: "text-blue-600" }
  if (score > 2.5) return { emoji: "🙂", text: "Cukup Baik", color: "text-sky-600" }
  if (score > 1.5) return { emoji: "😐", text: "Netral", color: "text-gray-600" }
  if (score > 0) return { emoji: "😟", text: "Kurang Baik", color: "text-yellow-600" }
  return { emoji: "😢", text: "Sedih/Marah", color: "text-red-600" }
}

const ChartCard = ({ title, children, isLoading, className = "" }) => (
  <div
    className={`bg-white border border-blue-100 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-200 hover:-translate-y-1 ${className}`}
  >
    <div className="flex items-center gap-3 mb-4 md:mb-6">
      <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
      </div>
      <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
    </div>
    {isLoading ? (
      <div className="h-64 md:h-80 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-slate-500">
          <div className="relative">
            <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-8 h-8 md:w-12 md:h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animate-reverse"></div>
          </div>
          <span className="text-xs md:text-sm font-medium animate-pulse">Memuat grafik...</span>
        </div>
      </div>
    ) : (
      <div className="w-full overflow-auto">
        <ResponsiveContainer width="100%" height={280} className="md:!h-80">
          {children}
        </ResponsiveContainer>
      </div>
    )}
  </div>
)

const FilterButton = ({ value, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm font-semibold rounded-xl transition-all duration-300 whitespace-nowrap transform hover:scale-105 ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-xl"
        : "bg-white text-slate-700 hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-300 hover:text-blue-700 hover:shadow-md"
    }`}
  >
    {label}
  </button>
)

const AnimatedMoodCard = ({ mood, isLoading }) => (
  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300 hover:-translate-y-1">
    {isLoading ? (
      <div className="flex items-center justify-center h-16 md:h-20">
        <div className="animate-pulse text-slate-400 text-xs md:text-sm">Memuat mood...</div>
      </div>
    ) : (
      <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-2 md:space-y-0 text-center md:text-left">
        <div className="text-3xl md:text-5xl animate-bounce">{getMoodDisplay(mood?.average_score).emoji}</div>
        <div>
          <p className="text-xs md:text-sm font-semibold text-slate-600 mb-1 flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
            Mood Tim
          </p>
          <p
            className={`text-sm md:text-xl font-bold ${getMoodDisplay(mood?.average_score).color} transition-colors duration-300`}
          >
            {getMoodDisplay(mood?.average_score).text}
          </p>
          {mood?.average_score && (
            <p className="text-xs text-slate-500 mt-1">Skor: {mood.average_score.toFixed(1)}/5.0</p>
          )}
        </div>
      </div>
    )}
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
  const kpiData = dashboardData?.kpi_data || [];

  const PIE_COLORS = {
    not_started: "#64748b",
    in_progress: "#3b82f6",
    completed: "#22c55e",
    cancelled: "#ef4444",
    unknown: "#cccccc",
  }

  const PERFORMANCE_COLORS = {
    completed: "#22c55e",
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
      fill: PIE_COLORS[statusKey] || "#cccccc",
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8 py-4 md:py-8">
        {/* Enhanced Mobile-First Header */}
        <div className="mb-8 md:mb-12 animate-in slide-in-from-top duration-500">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="text-center lg:text-left">
              <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-3 mb-3">
                <div className="p-2 md:p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <Activity className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                    Dashboard Statistik
                  </h1>
                  <p className="text-slate-600 text-xs md:text-sm mt-1">
                    Analisis performa dan tren aktivitas real-time
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Mobile-First Period Filters */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2 md:gap-3">
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
                label="Kustom"
                isActive={period === "custom"}
                onClick={() => setPeriod("custom")}
              />
            </div>
          </div>

          {/* Enhanced Admin User Selection */}
          {(currentUser?.role === "admin" || currentUser?.role === "semi_admin") && (
            <div className="mt-6 md:mt-8 p-4 md:p-6 bg-white border-2 border-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all  animate-in slide-in-from-left duration-700">
              <label className="text-sm font-bold text-slate-900 mb-3 md:mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                Filter berdasarkan pengguna
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
          )}

          {/* Enhanced Individual Mood Display */}
          {selectedUserId && period !== "custom" && (
            <div className="mt-4 md:mt-6 animate-in slide-in-from-right duration-700">
              <AnimatedMoodCard mood={individualMood} isLoading={isLoading} />
            </div>
          )}

          {/* Enhanced Custom Date Range */}
          {period === "custom" && (
            <div className="mt-4 md:mt-6 p-4 md:p-6 bg-white border-2 border-blue-100 rounded-2xl shadow-lg hover:shadow-xl transition-all animate-in slide-in-from-bottom duration-700">
              <p className="text-sm font-bold text-slate-900 mb-3 md:mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                Rentang Tanggal Kustom
              </p>
              <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-end md:space-x-6">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-2">Tanggal Mulai</label>
                  <input
                    type="date"
                    name="start_date"
                    value={customRange.start_date}
                    onChange={handleCustomRangeChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-blue-200 rounded-xl text-sm focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white hover:border-blue-300"
                  />
                </div>
                <div className="hidden md:block text-blue-400 pb-3 text-xl">→</div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-2">Tanggal Akhir</label>
                  <input
                    type="date"
                    name="end_date"
                    value={customRange.end_date}
                    onChange={handleCustomRangeChange}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border-2 border-blue-200 rounded-xl text-sm focus:ring-3 focus:ring-blue-100 focus:border-blue-400 transition-all duration-300 bg-white hover:border-blue-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Loading State */}
        {isLoading && !dashboardData ? (
          <div className="flex items-center justify-center py-16 md:py-20">
            <div className="flex flex-col items-center space-y-4 md:space-y-6 text-slate-500">
              <div className="relative">
                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 md:w-16 md:h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animate-reverse"></div>
              </div>
              <div className="text-center">
                <span className="text-base md:text-lg font-bold animate-pulse">Memuat dashboard...</span>
                <p className="text-xs md:text-sm text-slate-400 mt-1">Menganalisis data statistik</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 md:p-8 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl shadow-lg animate-in slide-in-from-bottom duration-500">
            <p className="text-red-700 font-semibold text-center text-sm md:text-base">{error}</p>
          </div>
        ) : (
          <div className="space-y-8 md:space-y-12">
            {/* Enhanced Mobile-First Summary Cards */}
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
                <div className="animate-in slide-in-from-left duration-500 delay-100">
                  <SummaryCard title="Dibuat" value={summary.created_in_period} icon="created" />
                </div>
                <div className="animate-in slide-in-from-left duration-500 delay-200">
                  <SummaryCard title="Selesai" value={summary.completed_in_period} icon="completed" />
                </div>
                <div className="animate-in slide-in-from-left duration-500 delay-300">
                  <SummaryCard title="Dikerjakan" value={summary.in_progress_in_period} icon="in_progress" />
                </div>
                <div className="animate-in slide-in-from-left duration-500 delay-400">
                  <SummaryCard title="Dibatalkan" value={summary.cancelled_in_period} icon="cancelled" />
                </div>
                <div className="animate-in slide-in-from-left duration-500 delay-500">
                  <SummaryCard title="Terlambat" value={summary.overdue} icon="overdue" />
                </div>
                <div className="animate-in slide-in-from-left duration-500 delay-600">
                  <MoodCard mood={overallMood} isLoading={isLoading} />
                </div>
              </div>
            )}

            {(currentUser?.role === "admin" || currentUser?.role === "semi_admin") && (
              <div className="animate-in slide-in-from-bottom duration-700 delay-300">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  Key Performance Indicators (KPI)
                </h2>
                {isLoading ? (
                  <div className="text-center p-6 bg-white rounded-2xl border border-blue-100 shadow-lg">
                    <p className="text-slate-500 animate-pulse">Memuat data KPI...</p>
                  </div>
                ) : kpiData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kpiData.map(user => (
                      <KpiCard key={user.id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500">
                    <p>Tidak ada data KPI untuk ditampilkan pada periode atau pengguna yang dipilih.</p>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Charts Grid */}
            <div className="space-y-6 md:space-y-8 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-8">
              {/* Enhanced Trend Chart */}
              <div className="lg:col-span-3 animate-in slide-in-from-bottom duration-700 delay-200">
                <ChartCard title="Tren Pembuatan Tugas" isLoading={isLoading}>
                  <AreaChart data={trendData} margin={{ top: 20, right: 10, left: -10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: isMobile ? 9 : 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: isMobile ? 9 : 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "2px solid #3b82f6",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(59, 130, 246, 0.15)",
                        fontSize: isMobile ? "11px" : "13px",
                      }}
                      labelStyle={{ color: "#1e293b", fontWeight: 700 }}
                      itemStyle={{ color: "#475569", fontWeight: 600 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Tugas Dibuat"
                      stroke="#3b82f6"
                      fill="url(#colorTrend)"
                      strokeWidth={3}
                      dot={{ r: isMobile ? 3 : 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: isMobile ? 5 : 7, fill: "#3b82f6", stroke: "#fff", strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ChartCard>
              </div>

              {/* Enhanced Status Composition */}
              <div className="lg:col-span-2 animate-in slide-in-from-bottom duration-700 delay-400">
                <ChartCard title="Komposisi Status" isLoading={isLoading}>
                  {statusData.length > 0 ? (
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={isMobile ? 40 : 60}
                        outerRadius={isMobile ? 70 : 100}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "2px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                          fontSize: isMobile ? "11px" : "13px",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: isMobile ? "10px" : "12px",
                          color: "#64748b",
                          paddingTop: "15px",
                          fontWeight: 600,
                        }}
                        layout="horizontal"
                        align="center"
                      />
                    </PieChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
                        </div>
                        <p className="text-xs md:text-sm font-semibold">Tidak ada data</p>
                      </div>
                    </div>
                  )}
                </ChartCard>
              </div>
            </div>

            {/* Enhanced Mobile-Friendly Performance Chart */}
            {(currentUser?.role === "admin" || currentUser?.role === "semi_admin") && (
              <div className="animate-in slide-in-from-bottom duration-700 delay-600">
                <ChartCard title="Performa Individual" isLoading={isLoading}>
                  {performanceData.length > 0 ? (
                    <div className="w-full">
                      <ResponsiveContainer
                        width="100%"
                        height={isMobile ? 300 : Math.max(380, performanceData.length * 45)}
                      >
                        <BarChart
                          data={performanceData}
                          layout={isMobile ? "horizontal" : "vertical"}
                          margin={
                            isMobile
                              ? { top: 20, right: 20, left: 20, bottom: 60 }
                              : { top: 20, right: 20, left: 0, bottom: 20 }
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                            horizontal={!isMobile}
                            vertical={isMobile}
                          />
                          <XAxis
                            type={isMobile ? "category" : "number"}
                            dataKey={isMobile ? "name" : undefined}
                            allowDecimals={false}
                            tick={{ fontSize: isMobile ? 9 : 11, fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                            angle={isMobile ? -45 : 0}
                            textAnchor={isMobile ? "end" : "middle"}
                            height={isMobile ? 80 : undefined}
                            width={isMobile ? undefined : 85}
                          />
                          <YAxis
                            type={isMobile ? "number" : "category"}
                            dataKey={isMobile ? undefined : "name"}
                            tick={{ fontSize: isMobile ? 9 : 11, fill: "#64748b" }}
                            axisLine={false}
                            tickLine={false}
                            width={isMobile ? 30 : 85}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "2px solid #cbd5e1",
                              borderRadius: "12px",
                              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
                              fontSize: isMobile ? "11px" : "13px",
                            }}
                            labelStyle={{ color: "#1e293b", fontWeight: 700 }}
                            itemStyle={{ color: "#475569", fontWeight: 600 }}
                          />
                          <Legend
                            wrapperStyle={{
                              fontSize: isMobile ? "10px" : "12px",
                              color: "#64748b",
                              marginTop: "20px",
                              fontWeight: 600,
                            }}
                          />
                          <Bar
                            dataKey="Selesai"
                            stackId="a"
                            fill={PERFORMANCE_COLORS.completed}
                            radius={isMobile ? [4, 4, 0, 0] : [0, 4, 4, 0]}
                          />
                          <Bar dataKey="Dikerjakan" stackId="a" fill={PERFORMANCE_COLORS.in_progress} />
                          <Bar dataKey="Belum Dimulai" stackId="a" fill={PERFORMANCE_COLORS.not_started} />
                          <Bar dataKey="Terlambat" stackId="a" fill={PERFORMANCE_COLORS.overdue} />
                          <Bar dataKey="Dibatalkan" stackId="a" fill={PERFORMANCE_COLORS.cancelled} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
                          <Users className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
                        </div>
                        <p className="text-xs md:text-sm font-semibold">Tidak ada data performa</p>
                      </div>
                    </div>
                  )}
                </ChartCard>
              </div>
            )}

            {/* Enhanced Mood Trend Chart */}
            <div className="animate-in slide-in-from-bottom duration-700 delay-800">
              <ChartCard title="Tren Mood Harian" isLoading={isLoading}>
                {moodTrendData.some((d) => d.score !== null) ? (
                  <AreaChart data={moodTrendData} margin={{ top: 20, right: 10, left: -10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: isMobile ? 9 : 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      domain={[0, 5.5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tickFormatter={(value) => {
                        const labels = { 1: "Sedih", 2: "Netral", 3: "Senang", 4: "Semangat", 5: "Gembira" }
                        return labels[value] || ""
                      }}
                      tick={{ fontSize: isMobile ? 8 : 11, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      width={isMobile ? 50 : 60}
                    />
                    <Tooltip
                      formatter={(value, name, props) => {
                        const labels = { 1: "Sedih", 2: "Netral", 3: "Senang", 4: "Semangat", 5: "Gembira" }
                        const displayValue = Number.isInteger(value) ? labels[value] : `Rata-rata ${value.toFixed(1)}`
                        return [displayValue, "Mood"]
                      }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "2px solid #f59e0b",
                        borderRadius: "12px",
                        boxShadow: "0 10px 25px rgba(245, 158, 11, 0.15)",
                        fontSize: isMobile ? "11px" : "13px",
                      }}
                      labelStyle={{ color: "#1e293b", fontWeight: 700 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      name="Skor Mood"
                      stroke="#f59e0b"
                      fill="url(#colorMood)"
                      strokeWidth={3}
                      connectNulls={false}
                      dot={{ r: isMobile ? 3 : 5, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: isMobile ? 5 : 7, fill: "#f59e0b", stroke: "#fff", strokeWidth: 3 }}
                    />
                  </AreaChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <div className="text-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
                        <Activity className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
                      </div>
                      <p className="text-xs md:text-sm font-semibold">Tidak ada data mood</p>
                    </div>
                  </div>
                )}
              </ChartCard>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
