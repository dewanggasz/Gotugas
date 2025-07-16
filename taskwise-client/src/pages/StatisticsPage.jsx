"use client"

import { useState, useEffect } from "react"
import { getStatistics, getUsers } from "../services/api"
import SummaryCard from "../components/SummaryCard"
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
} from "recharts"

const ChartCard = ({ title, children, isLoading, className = "" }) => (
  <div
    className={`bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
  >
    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4 sm:mb-6 tracking-tight">{title}</h3>
    {isLoading ? (
      <div className="h-64 sm:h-80 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
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
    className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-xl transition-all duration-200 whitespace-nowrap ${
      isActive
        ? "bg-gray-900 text-white shadow-sm"
        : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
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
    if (currentUser?.role === "admin") {
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
        if (currentUser?.role === "admin" && selectedUserId) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight mb-2">Statistik Dashboard</h1>
              <p className="text-gray-600 text-sm">Analisis performa dan tren aktivitas</p>
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
          {currentUser?.role === "admin" && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white border border-gray-100 rounded-2xl">
              <label className="block text-sm font-medium text-gray-900 mb-3">Filter berdasarkan pengguna</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
              >
                <option value="">Semua Pengguna</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Date Range - Mobile Optimized */}
          {period === "custom" && (
            <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white border border-gray-100 rounded-2xl">
              <p className="text-sm font-medium text-gray-900 mb-4">Rentang Tanggal Kustom</p>
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-end sm:space-x-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    name="start_date"
                    value={customRange.start_date}
                    onChange={handleCustomRangeChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div className="hidden sm:block text-gray-400 pb-2">—</div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Tanggal Akhir</label>
                  <input
                    type="date"
                    name="end_date"
                    value={customRange.end_date}
                    onChange={handleCustomRangeChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && !dashboardData ? (
          <div className="flex items-center justify-center py-16 sm:py-20">
            <div className="flex items-center space-x-3 text-gray-500">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span className="text-base sm:text-lg font-medium">Memuat dashboard...</span>
            </div>
          </div>
        ) : error ? (
          <div className="p-6 sm:p-8 bg-red-50 border border-red-100 rounded-2xl">
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
                  <BarChart
                    data={trendData}
                    margin={{
                      top: 20,
                      right: 10,
                      left: -10,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
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
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="Tugas Dibuat" fill="#1f2937" radius={[2, 2, 0, 0]} />
                  </BarChart>
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
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-medium">Tidak ada data</p>
                      </div>
                    </div>
                  )}
                </ChartCard>
              </div>
            </div>

            {/* Performance Chart (Admin Only) - Mobile Optimized */}
            {currentUser?.role === "admin" && (
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
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
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
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                fontSize: "12px",
                              }}
                            />
                            <Legend
                              wrapperStyle={{
                                fontSize: "11px",
                                color: "#64748b",
                                marginTop: "15px",
                              }}
                            />

                            <Bar dataKey="Selesai" stackId="a" fill="#10b981" radius={[0, 2, 2, 0]} />
                            <Bar dataKey="Dikerjakan" stackId="a" fill="#3b82f6" />
                            <Bar dataKey="Belum Dimulai" stackId="a" fill="#6b7280" />
                            <Bar dataKey="Terlambat" stackId="a" fill="#f59e0b" />
                            <Bar dataKey="Dibatalkan" stackId="a" fill="#ef4444" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
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
