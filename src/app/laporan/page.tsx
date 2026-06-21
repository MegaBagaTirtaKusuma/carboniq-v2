"use client"
import { useEffect, useState } from "react"
import { FileDown, Loader2, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import { kgToTonne } from "@/lib/calculations"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface DashboardData {
  totals: { scope1: number; scope2: number; scope3: number; total: number }
  recentActivities: Array<{ id: string; scope: string; category: string; quantity: number; unit: string; emissionResult: number; startDate: string }>
}

export default function LaporanPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetch("/api/dashboard").then(r => r.json()).then(setData).finally(() => setLoading(false))
  }, [])

  const exportPDF = async () => {
    setExporting(true)
    try {
      const { default: jsPDF } = await import("jspdf")
      const { default: autoTable } = await import("jspdf-autotable")

      const doc = new jsPDF()
      const today = format(new Date(), "d MMMM yyyy", { locale: id })
      const totals = data?.totals || { scope1: 0, scope2: 0, scope3: 0, total: 0 }

      // Header
      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, 220, 35, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text("CarbonIQ", 15, 16)
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text("Carbon Emission Management System", 15, 24)
      doc.text(`Dicetak: ${today}`, 15, 31)

      // Title
      doc.setTextColor(17, 24, 39)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Laporan Emisi Karbon", 15, 50)

      // Summary table
      autoTable(doc, {
        startY: 56,
        head: [["Scope", "Total Emisi (kgCO2e)", "Total Emisi (tCO2e)"]],
        body: [
          ["Scope 1 — Langsung", totals.scope1.toFixed(2), kgToTonne(totals.scope1).toFixed(4)],
          ["Scope 2 — Tidak Langsung", totals.scope2.toFixed(2), kgToTonne(totals.scope2).toFixed(4)],
          ["Scope 3 — Rantai Nilai", totals.scope3.toFixed(2), kgToTonne(totals.scope3).toFixed(4)],
          ["TOTAL KESELURUHAN", totals.total.toFixed(2), kgToTonne(totals.total).toFixed(4)],
        ],
        headStyles: { fillColor: [37, 99, 235], fontStyle: "bold", fontSize: 10 },
        bodyStyles: { fontSize: 10 },
        footStyles: { fontStyle: "bold" },
        columnStyles: { 1: { halign: "right" }, 2: { halign: "right" } },
        styles: { cellPadding: 5 },
        didDrawCell: (data) => {
          if (data.row.index === 3) {
            doc.setFont("helvetica", "bold")
          }
        }
      })

      // Activities table
      const activities = data?.recentActivities || []
      if (activities.length > 0) {
        const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 130
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("Rincian Aktivitas Emisi", 15, finalY + 14)

        const scopeMap: Record<string, string> = { scope1: "Scope 1", scope2: "Scope 2", scope3: "Scope 3" }
        autoTable(doc, {
          startY: finalY + 20,
          head: [["Tanggal", "Scope", "Kategori", "Quantity", "Emisi (kgCO2e)"]],
          body: activities.map(a => [
            format(new Date(a.startDate), "d/M/yyyy"),
            scopeMap[a.scope] || a.scope,
            a.category,
            `${a.quantity} ${a.unit}`,
            a.emissionResult.toFixed(2),
          ]),
          headStyles: { fillColor: [37, 99, 235], fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          columnStyles: { 4: { halign: "right" } },
          styles: { cellPadding: 4 },
        })
      }

      // Footer
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(156, 163, 175)
        doc.text(`CarbonIQ — Laporan Emisi Karbon — ${today} — Halaman ${i}/${pageCount}`, 15, 290)
      }

      doc.save(`CarbonIQ_Laporan_${format(new Date(), "yyyyMMdd")}.pdf`)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const totals = data?.totals || { scope1: 0, scope2: 0, scope3: 0, total: 0 }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Laporan Emisi</h2>
          <p className="text-sm text-gray-500 mt-0.5">Generate laporan PDF lengkap semua data emisi</p>
        </div>
        <Button onClick={exportPDF} disabled={exporting || loading}>
          {exporting ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><FileDown className="w-4 h-4" /> Export PDF</>}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <>
          {/* Preview Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-blue-600 p-6">
              <div className="flex items-center gap-2 text-white">
                <Leaf className="w-5 h-5" />
                <span className="font-bold text-lg">CarbonIQ</span>
              </div>
              <p className="text-blue-200 text-sm mt-0.5">Laporan Emisi Karbon — {format(new Date(), "d MMMM yyyy", { locale: id })}</p>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Ringkasan Emisi</h3>
              <div className="space-y-3">
                {[
                  { label: "Scope 1 — Emisi Langsung", value: totals.scope1, color: "bg-blue-600" },
                  { label: "Scope 2 — Emisi Tidak Langsung", value: totals.scope2, color: "bg-green-600" },
                  { label: "Scope 3 — Rantai Nilai", value: totals.scope3, color: "bg-amber-600" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{value.toFixed(2)} kgCO2e</p>
                      <p className="text-xs text-gray-400">{kgToTonne(value).toFixed(4)} tCO2e</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total Emisi Keseluruhan</span>
                <div className="text-right">
                  <p className="font-bold text-xl text-blue-600">{totals.total.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">kgCO2e ({kgToTonne(totals.total).toFixed(4)} tCO2e)</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
