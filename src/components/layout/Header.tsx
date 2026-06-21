"use client"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/input-emisi": "Input Emisi",
  "/data-emisi": "Data Emisi",
  "/laporan": "Laporan",
  "/faktor-emisi": "Faktor Emisi",
  "/pengaturan": "Pengaturan",
}

export function Header() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] || "CarbonIQ"

  return (
    <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-gray-100">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">U</div>
        </div>
      </div>
    </header>
  )
}
