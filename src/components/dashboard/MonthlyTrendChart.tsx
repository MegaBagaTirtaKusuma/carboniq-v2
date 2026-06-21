"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { SCOPE_COLORS } from "@/lib/calculations"

interface MonthlyData { month: string; scope1: number; scope2: number; scope3: number }
interface Props { data: MonthlyData[] }

export function MonthlyTrendChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v: number) => [`${v.toFixed(2)} kgCO2e`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
        <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
        <Bar dataKey="scope1" name="Scope 1" fill={SCOPE_COLORS.scope1} radius={[3, 3, 0, 0]} />
        <Bar dataKey="scope2" name="Scope 2" fill={SCOPE_COLORS.scope2} radius={[3, 3, 0, 0]} />
        <Bar dataKey="scope3" name="Scope 3" fill={SCOPE_COLORS.scope3} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
