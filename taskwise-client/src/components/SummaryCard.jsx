"use client"

import { FilePlus, CheckCircle2, Loader, XCircle, AlertTriangle } from "lucide-react"

export default function SummaryCard({ title, value, icon }) {
  // Icon configuration with improved colors and styling
  const iconConfig = {
    created: {
      icon: FilePlus,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    completed: {
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
    },
    in_progress: {
      icon: Loader,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      animate: true,
    },
    cancelled: {
      icon: XCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-100",
    },
    overdue: {
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
    },
  }

  const config = iconConfig[icon] || iconConfig.created
  const IconComponent = config.icon

  // Format large numbers
  const formatValue = (val) => {
    if (typeof val !== "number") return val
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`
    return val.toString()
  }

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start space-x-4">
        {/* Icon Container */}
        <div
          className={`flex-shrink-0 p-2.5 sm:p-3 rounded-xl border ${config.bgColor} ${config.borderColor} group-hover:scale-105 transition-transform duration-200`}
        >
          <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${config.color} ${config.animate ? "animate-spin" : ""}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 tracking-wide uppercase">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">{formatValue(value)}</p>
            {typeof value === "number" && value >= 1000 && (
              <span className="text-xs text-gray-400 font-medium">({value.toLocaleString()})</span>
            )}
          </div>
        </div>
      </div>

      {/* Optional trend indicator - can be added later */}
      <div className="mt-4 pt-4 border-t border-gray-50 hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">vs bulan lalu</span>
          <span className="text-green-600 font-medium">+12%</span>
        </div>
      </div>
    </div>
  )
}
