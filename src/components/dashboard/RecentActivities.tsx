import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  scope: string
  category: string
  quantity: number
  unit: string
  emissionResult: number
  startDate: string | Date
}

interface Props { activities: Activity[] }

const scopeVariant: Record<string, "scope1" | "scope2" | "scope3"> = {
  scope1: "scope1",
  scope2: "scope2",
  scope3: "scope3",
}

export function RecentActivities({ activities }: Props) {
  if (activities.length === 0) {
    return <div className="text-center py-8 text-gray-400 text-sm">Belum ada aktivitas</div>
  }

  return (
    <div className="space-y-3">
      {activities.map((a) => (
        <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
          <div className="flex items-center gap-3">
            <Badge variant={scopeVariant[a.scope] || "default"}>
              {a.scope === "scope1" ? "Scope 1" : a.scope === "scope2" ? "Scope 2" : "Scope 3"}
            </Badge>
            <div>
              <p className="text-sm font-medium text-gray-800">{a.category}</p>
              <p className="text-xs text-gray-400">{format(new Date(a.startDate), "d MMM yyyy", { locale: id })}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{a.emissionResult.toFixed(2)}</p>
            <p className="text-xs text-gray-400">kgCO2e</p>
          </div>
        </div>
      ))}
    </div>
  )
}
