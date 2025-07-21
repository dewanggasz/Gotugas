// src/components/KpiCard.jsx

import { TrendingUp, TrendingDown, CheckCircle, Clock, AlertTriangle } from "lucide-react"

// Fungsi helper untuk menentukan level KPI berdasarkan skor
const getKpiLevel = (score) => {
  if (score >= 100) return { label: "Luar Biasa", color: "text-green-500", bg: "bg-green-50" }
  if (score >= 50) return { label: "Baik", color: "text-blue-500", bg: "bg-blue-50" }
  if (score >= 0) return { label: "Cukup", color: "text-yellow-500", bg: "bg-yellow-50" }
  return { label: "Perlu Perbaikan", color: "text-red-500", bg: "bg-red-50" }
}

export default function KpiCard({ user }) {
  const level = getKpiLevel(user.kpi_score)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 md:p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-blue-200 flex flex-col">
      {/* Bagian Atas: Info Pengguna dan Skor */}
      <div className="flex items-start gap-4">
        <img
          src={user.profile_photo_url || "/placeholder.svg"}
          alt={user.name}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-slate-100"
        />
        <div className="flex-1">
          <h4 className="font-bold text-sm md:text-sm text-slate-800 truncate w-40 md:w-40">{user.name}</h4>
          <p className="text-xs text-slate-500">{user.jabatan || "Tidak ada jabatan"}</p>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${level.bg} ${level.color}`}
          >
            {level.label === "Luar Biasa" && <TrendingUp size={14} />}
            {level.label === "Perlu Perbaikan" && <TrendingDown size={14} />}
            <span>{level.label}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-medium">Skor KPI</p>
          <p className={`text-2xl md:text-3xl font-bold ${level.color}`}>{user.kpi_score}</p>
        </div>
      </div>

      {/* Bagian Bawah: Rincian Statistik Tugas */}
      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
        <div className="flex flex-col items-center px-1">
          <CheckCircle size={14} md:size={16} className="text-green-500 mb-1" />
          <span className="font-semibold">{user.stats.completed_on_time}</span>
          <span>Tepat Waktu</span>
        </div>
        <div className="flex flex-col items-center px-1">
          <Clock size={14} md:size={16} className="text-yellow-500 mb-1" />
          <span className="font-semibold">{user.stats.completed_late}</span>
          <span>Selesai Telat</span>
        </div>
        <div className="flex flex-col items-center px-1">
          <AlertTriangle size={14} md:size={16} className="text-red-500 mb-1" />
          <span className="font-semibold">{user.stats.still_overdue}</span>
          <span>Masih Telat</span>
        </div>
      </div>
    </div>
  )
}
