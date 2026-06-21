"use client"
import { useState } from "react"
import { Flame, Zap, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Scope1Form } from "@/components/forms/Scope1Form"
import { Scope2Form } from "@/components/forms/Scope2Form"
import { Scope3Form } from "@/components/forms/Scope3Form"

type Scope = "scope1" | "scope2" | "scope3"

const scopeCards = [
  {
    id: "scope1" as Scope,
    label: "Scope 1",
    title: "Emisi Langsung",
    desc: "Pembakaran bahan bakar dari kendaraan operasional yang dimiliki atau dikendalikan",
    icon: Flame,
    color: "blue",
  },
  {
    id: "scope2" as Scope,
    label: "Scope 2",
    title: "Emisi Tidak Langsung",
    desc: "Konsumsi listrik PLN untuk operasional gedung dan fasilitas",
    icon: Zap,
    color: "green",
  },
  {
    id: "scope3" as Scope,
    label: "Scope 3",
    title: "Emisi Rantai Nilai",
    desc: "Perjalanan bisnis, komuter karyawan, dan penggunaan produk yang dijual",
    icon: Globe,
    color: "amber",
  },
]

const colorMap = {
  blue: { border: "border-blue-500 bg-blue-50", icon: "bg-blue-100 text-blue-600", badge: "bg-blue-600", unsel: "border-gray-200 hover:border-blue-200 hover:bg-blue-50/30" },
  green: { border: "border-green-500 bg-green-50", icon: "bg-green-100 text-green-600", badge: "bg-green-600", unsel: "border-gray-200 hover:border-green-200 hover:bg-green-50/30" },
  amber: { border: "border-amber-500 bg-amber-50", icon: "bg-amber-100 text-amber-600", badge: "bg-amber-600", unsel: "border-gray-200 hover:border-amber-200 hover:bg-amber-50/30" },
}

export default function InputEmisiPage() {
  const [selectedScope, setSelectedScope] = useState<Scope | null>(null)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Input Data Emisi</h2>
        <p className="text-sm text-gray-500 mt-0.5">Pilih scope emisi dan isi data aktivitas</p>
      </div>

      {/* Scope selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {scopeCards.map(({ id, label, title, desc, icon: Icon, color }) => {
          const c = colorMap[color as keyof typeof colorMap]
          const selected = selectedScope === id
          return (
            <button
              key={id}
              onClick={() => setSelectedScope(id)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                selected ? c.border : c.unsel
              )}
            >
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", c.icon)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className={cn("inline-block text-xs font-semibold text-white px-2 py-0.5 rounded-full mb-1.5", c.badge)}>{label}</div>
              <p className="font-semibold text-gray-900 text-sm">{title}</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
            </button>
          )
        })}
      </div>

      {/* Form */}
      {selectedScope && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-5">
            Form {selectedScope === "scope1" ? "Scope 1 — Kendaraan Operasional" : selectedScope === "scope2" ? "Scope 2 — Listrik PLN" : "Scope 3 — Rantai Nilai"}
          </h3>
          {selectedScope === "scope1" && <Scope1Form onSuccess={() => {}} />}
          {selectedScope === "scope2" && <Scope2Form onSuccess={() => {}} />}
          {selectedScope === "scope3" && <Scope3Form onSuccess={() => {}} />}
        </div>
      )}
    </div>
  )
}
