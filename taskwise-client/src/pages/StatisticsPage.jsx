"use client"

import { useState, useEffect, useRef } from "react"
import { getStatistics, getUsers } from "../services/api" // Adjust path if necessary
import SummaryCard from "../components/SummaryCard" // Adjust path if necessary
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
  AreaChart, // Import AreaChart
  Area, // Import Area
} from "recharts"
import { BarChart3, Users, ChevronDown, User } from "lucide-react" // Import Lucide icons for consistency

// Re-using CustomSelect from tasks-page for consistency
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

const ChartCard = ({ title, children, isLoading, className = "" }) => (
  <div
    className={`bg-white border border-slate-200 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
  >
    <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-4 sm:mb-6 tracking-tight">{title}</h3>
    {isLoading ? (
      <div className="h-64 sm:h-80 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-slate-500">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Memuat grafik...</span>
        </div>
      </div>
    ) : (
      <div className="w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={280} className="sm:!h-80">
          {children}
        </ResponsiveContainer>
      </div>
    )}
  </div>
)

const FilterButton = ({ value, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
      isActive
        ? "bg-blue-600 text-white shadow-sm"
        : "bg-white text-slate-700 hover:bg-blue-50 border border-slate-300 hover:border-blue-200"
    }`}
  >
    {label}
  </button>
)

export default function StatisticsPage({ currentUser }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [period, setPeriod] = useState("30d")

  const [customRange, setCustomRange] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 29)).toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  })

  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState("")

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

  // Define vibrant colors for charts
  const PIE_COLORS = {
    not_started: "#64748b", // slate-500
    in_progress: "#3b82f6", // blue-500
    completed: "#22c55e", // green-500
    cancelled: "#ef4444", // red-500
    unknown: "#cccccc", // Fallback color for unknown status
  }

  const PERFORMANCE_COLORS = {
    completed: "#22c55e", // green-500
    in_progress: "#3b82f6", // blue-500
    not_started: "#64748b", // slate-500
    overdue: "#f59e0b", // amber-500
    cancelled: "#ef4444", // red-500
  }

  // Helper for status labels and robust key generation
  const statusLabels = {
    not_started: "Belum Dimulai",
    in_progress: "Dikerjakan",
    completed: "Selesai",
    cancelled: "Dibatalkan",
    unknown: "Tidak Diketahui", // Add a label for unknown status
  }

  // Map status data to colors and labels for the Pie Chart
  const coloredStatusData = statusData.map((item) => {
    const rawStatusName = item.name
    // Convert status name to a consistent key (lowercase, replace spaces with underscores)
    const statusKey = rawStatusName ? rawStatusName.toLowerCase().replace(/ /g, "_") : "unknown"

    return {
      ...item,
      label: statusLabels[statusKey] || rawStatusName || "Tidak Diketahui", // Use predefined label or fallback to original name
      fill: PIE_COLORS[statusKey] || "#cccccc", // Use statusKey for color lookup, with a fallback
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Statistik Dashboard</h1>
              <p className="text-slate-600 text-sm">Analisis performa dan tren aktivitas</p>
            </div>

            {/* Period Filters - Mobile Optimized */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2">
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

          {/* Admin User Selection - Mobile Optimized */}
          {(currentUser?.role === "admin" || currentUser?.role === "semi_admin") && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
              <label className="block text-sm font-medium text-slate-900 mb-3">Filter berdasarkan pengguna</label>
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

          {/* Custom Date Range - Mobile Optimized */}
          {period === "custom" && (
            <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
              <p className="text-sm font-medium text-slate-900 mb-4">Rentang Tanggal Kustom</p>
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-end sm:space-x-4">
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    name="start_date"
                    value={customRange.start_date}
                    onChange={handleCustomRangeChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
                </div>
                <div className="hidden sm:block text-slate-400 pb-2">—</div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-500 mb-1">Tanggal Akhir</label>
                  <input
                    type="date"
                    name="end_date"
                    value={customRange.end_date}
                    onChange={handleCustomRangeChange}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && !dashboardData ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="flex items-center space-x-3 text-slate-500">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-base sm:text-lg font-medium">Memuat dashboard...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 sm:p-8 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <p className="text-red-600 font-medium text-sm sm:text-base">{error}</p>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-12">
            {/* Summary Cards - Mobile Optimized Grid */}
            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                <SummaryCard title="Dibuat" value={summary.created_in_period} icon="created" />
                <SummaryCard title="Selesai" value={summary.completed_in_period} icon="completed" />
                <SummaryCard title="Dikerjakan" value={summary.in_progress_in_period} icon="in_progress" />
                <SummaryCard title="Dibatalkan" value={summary.cancelled_in_period} icon="cancelled" />
                <div className="col-span-2 sm:col-span-1">
                  <SummaryCard title="Terlambat" value={summary.overdue} icon="overdue" />
                </div>
              </div>
            )}

            {/* Charts Grid - Mobile Optimized */}
            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-8">
              {/* Trend Chart - Mobile First */}
              <div className="lg:col-span-3">
                <ChartCard title="Tren Pembuatan Tugas" isLoading={isLoading}>
                  <AreaChart
                    data={trendData}
                    margin={{
                      top: 20,
                      right: 10,
                      left: -10,
                      bottom: 20,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                        fontSize: "12px",
                      }}
                      labelStyle={{ color: "#334155", fontWeight: 600 }}
                      itemStyle={{ color: "#475569" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Tugas Dibuat"
                      stroke="#3b82f6"
                      fill="url(#colorUv)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ChartCard>
              </div>

              {/* Status Composition - Mobile Optimized */}
              <div className="lg:col-span-2">
                <ChartCard title="Komposisi Status" isLoading={isLoading}>
                  {statusData.length > 0 ? (
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        strokeWidth={0}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          fontSize: "12px",
                        }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: "11px",
                          color: "#64748b",
                          paddingTop: "10px",
                        }}
                        layout="horizontal"
                        align="center"
                      />
                    </PieChart>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium">Tidak ada data</p>
                      </div>
                    </div>
                  )}
                </ChartCard>
              </div>
            </div>

            {/* Performance Chart (Admin Only) - Mobile Optimized */}
            {(currentUser?.role === "admin" || currentUser?.role === "semi_admin") && (
              <div>
                <ChartCard title="Performa Individual" isLoading={isLoading}>
                  {performanceData.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[600px] sm:min-w-0">
                        <ResponsiveContainer width="100%" height={Math.max(280, performanceData.length * 40)}>
                          <BarChart
                            data={performanceData}
                            layout="vertical"
                            margin={{
                              top: 20,
                              right: 20,
                              left: 80,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                            <XAxis
                              type="number"
                              allowDecimals={false}
                              tick={{ fontSize: 10, fill: "#64748b" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              type="category"
                              dataKey="name"
                              width={75}
                              tick={{ fontSize: 10, fill: "#64748b" }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                                fontSize: "12px",
                              }}
                              labelStyle={{ color: "#334155", fontWeight: 600 }}
                              itemStyle={{ color: "#475569" }}
                            />
                            <Legend
                              wrapperStyle={{
                                fontSize: "11px",
                                color: "#64748b",
                                marginTop: "15px",
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
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-sm font-medium">Tidak ada data performa</p>
                      </div>
                    </div>
                  )}
                </ChartCard>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
