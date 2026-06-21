"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Plus, Table, FileText, Settings, Leaf, ChevronLeft, ChevronRight, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/input-emisi", label: "Input Emisi", icon: Plus },
  { href: "/data-emisi", label: "Data Emisi", icon: Table },
  { href: "/laporan", label: "Laporan", icon: FileText },
  { href: "/faktor-emisi", label: "Faktor Emisi", icon: BarChart3 },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn("flex flex-col h-screen bg-white border-r border-gray-100 transition-all duration-300 shadow-sm", collapsed ? "w-16" : "w-60")}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg shrink-0">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">CarbonIQ</p>
            <p className="text-xs text-gray-400">Emission Management</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-blue-600" : "text-gray-400")} />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-8 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
