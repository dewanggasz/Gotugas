import { CheckCircle2, Circle, PlayCircle, XCircle, PlusCircle, AlertTriangle } from "lucide-react"

export default function SummaryCard({ title, value, icon }) {
  const iconConfig = {
    created: {
      icon: PlusCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    completed: {
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    in_progress: {
      icon: PlayCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    cancelled: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    overdue: {
      icon: AlertTriangle,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    not_started: {
      icon: Circle,
      color: "text-slate-600",
      bg: "bg-slate-50",
    },
  }

  const config = iconConfig[icon] || iconConfig.created
  const IconComponent = config.icon

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center space-x-4">
      <div className={`p-3 rounded-full ${config.bg}`}>
        <IconComponent className={`h-5 w-5 ${config.color}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}
