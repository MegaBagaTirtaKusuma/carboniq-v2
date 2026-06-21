import { cn } from "@/lib/utils"
import { kgToTonne } from "@/lib/calculations"
import { LucideIcon } from "lucide-react"

interface KpiCardProps {
  title: string
  valueKg: number
  icon: LucideIcon
  color: "blue" | "green" | "amber" | "gray"
  description?: string
}

const colorMap = {
  blue: { bg: "bg-blue-50", icon: "text-blue-600", badge: "bg-blue-600" },
  green: { bg: "bg-green-50", icon: "text-green-600", badge: "bg-green-600" },
  amber: { bg: "bg-amber-50", icon: "text-amber-600", badge: "bg-amber-600" },
  gray: { bg: "bg-gray-50", icon: "text-gray-600", badge: "bg-gray-600" },
}

export function KpiCard({ title, valueKg, icon: Icon, color, description }: KpiCardProps) {
  const c = colorMap[color]
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900">{valueKg.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-0.5">kgCO2e</p>
          <p className="mt-1 text-sm font-medium text-gray-600">{kgToTonne(valueKg).toFixed(4)} tCO2e</p>
        </div>
        <div className={cn("p-2.5 rounded-lg", c.bg)}>
          <Icon className={cn("w-5 h-5", c.icon)} />
        </div>
      </div>
      {description && <p className="mt-3 text-xs text-gray-400 border-t border-gray-50 pt-3">{description}</p>}
    </div>
  )
}
