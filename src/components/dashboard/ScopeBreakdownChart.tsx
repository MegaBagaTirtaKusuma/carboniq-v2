"use client"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { SCOPE_COLORS } from "@/lib/calculations"

interface Props {
  data: { scope1: number; scope2: number; scope3: number }
}

export function ScopeBreakdownChart({ data }: Props) {
  const chartData = [
    { name: "Scope 1", value: data.scope1, color: SCOPE_COLORS.scope1 },
    { name: "Scope 2", value: data.scope2, color: SCOPE_COLORS.scope2 },
    { name: "Scope 3", value: data.scope3, color: SCOPE_COLORS.scope3 },
  ].filter(d => d.value > 0)

  if (chartData.length === 0) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Belum ada data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
          {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
        </Pie>
        <Tooltip formatter={(v: number) => [`${v.toFixed(2)} kgCO2e`, ""]} />
        <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
