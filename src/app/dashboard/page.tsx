"use client"
import { useEffect, useState } from "react"
import { Flame, Zap, Globe, TrendingUp, Loader2 } from "lucide-react"
import { KpiCard } from "@/components/dashboard/KpiCard"
import { ScopeBreakdownChart } from "@/components/dashboard/ScopeBreakdownChart"
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart"
import { RecentActivities } from "@/components/dashboard/RecentActivities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardData {
  totals: { scope1: number; scope2: number; scope3: number; total: number }
  monthlyTrend: { month: string; scope1: number; scope2: number; scope3: number }[]
  recentActivities: Array<{ id: string; scope: string; category: string; quantity: number; unit: string; emissionResult: number; startDate: string }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const totals = data?.totals || { scope1: 0, scope2: 0, scope3: 0, total: 0 }

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Ringkasan Emisi Karbon</h2>
        <p className="text-sm text-gray-500 mt-0.5">Overview total emisi berdasarkan scope</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Scope 1 — Langsung" valueKg={totals.scope1} icon={Flame} color="blue" description="Pembakaran bahan bakar kendaraan operasional" />
        <KpiCard title="Scope 2 — Tidak Langsung" valueKg={totals.scope2} icon={Zap} color="green" description="Konsumsi listrik PLN" />
        <KpiCard title="Scope 3 — Rantai Nilai" valueKg={totals.scope3} icon={Globe} color="amber" description="Perjalanan bisnis & produk dijual" />
        <KpiCard title="Total Emisi" valueKg={totals.total} icon={TrendingUp} color="gray" description="Seluruh scope gabungan" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Distribusi Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <ScopeBreakdownChart data={totals} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Tren Emisi 6 Bulan Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart data={data?.monthlyTrend || []} />
          </CardContent>
        </Card>
      </div>

      {/* Recent activities */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivities activities={data?.recentActivities || []} />
        </CardContent>
      </Card>
    </div>
  )
}
