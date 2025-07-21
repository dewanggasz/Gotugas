// src/components/KpiCard.jsx

import { TrendingUp, TrendingDown, Star, Target } from "lucide-react"

// Fungsi helper untuk menentukan level efisiensi berdasarkan skor persentase
const getEfficiencyLevel = (score) => {
  if (score >= 90) return { label: "Luar Biasa", color: "text-green-600", bg: "bg-green-50", shortLabel: "Excellent" }
  if (score >= 75) return { label: "Baik", color: "text-blue-600", bg: "bg-blue-50", shortLabel: "Good" }
  if (score >= 50) return { label: "Cukup", color: "text-yellow-600", bg: "bg-yellow-50", shortLabel: "Fair" }
  return { label: "Perlu Perbaikan", color: "text-red-600", bg: "bg-red-50", shortLabel: "Needs Work" }
}

export default function KpiCard({ user }) {
  // Gunakan efficiency_score yang baru
  const score = user.efficiency_score
  const level = getEfficiencyLevel(score)

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3 md:p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-blue-300 flex flex-col hover:-translate-y-1">
      {/* Bagian Atas: Info Pengguna dan Skor Efisiensi */}
      <div className="flex items-start gap-3 md:gap-4">
        <img
          src={user.profile_photo_url || `https://placehold.co/64x64/e2e8f0/64748b?text=${user.name.charAt(0)}`}
          alt={user.name}
          className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 md:border-4 border-slate-100 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm md:text-base text-slate-900 truncate leading-tight">{user.name}</h4>
          <p className="text-xs text-slate-500 truncate mt-0.5">{user.jabatan || "Anggota Tim"}</p>
          <div
            className={`mt-1.5 md:mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${level.bg} ${level.color} whitespace-nowrap`}
          >
            {score >= 75 && <TrendingUp size={12} />}
            {score < 50 && <TrendingDown size={12} />}
            <span className="hidden sm:inline">{level.label}</span>
            <span className="sm:hidden">{level.shortLabel}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-slate-500 font-semibold">Efisiensi</p>
          <p className={`text-2xl md:text-4xl font-bold ${level.color} leading-none`}>
            {score}
            <span className="text-lg md:text-2xl opacity-70">%</span>
          </p>
        </div>
      </div>

      {/* Bagian Bawah: Rincian Skor Aktual vs. Maksimal */}
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 md:gap-4 text-center text-slate-700">
        <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
          <Star size={14} md:size={16} className="text-yellow-500 mb-1" />
          <span className="font-bold text-base md:text-lg">{user.stats.actual_score}</span>
          <span className="text-xs text-slate-500 leading-tight">Skor Aktual</span>
        </div>
        <div className="flex flex-col items-center p-2 rounded-lg bg-slate-50">
          <Target size={14} md:size={16} className="text-blue-500 mb-1" />
          <span className="font-bold text-base md:text-lg">{user.stats.max_possible_score}</span>
          <span className="text-xs text-slate-500 leading-tight">Skor Maksimal</span>
        </div>
      </div>
    </div>
  )
}
