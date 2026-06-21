"use client"
import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Edit, Trash2, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { EditActivityForm } from "./EditActivityForm"

interface Activity {
  id: string; scope: string; category: string; vehicleType?: string; fuelType?: string
  electricitySource?: string; flightType?: string; startDate: string; endDate: string
  quantity: number; unit: string; emissionFactor: number; emissionResult: number; createdAt: string
}

const scopeVariant: Record<string, "scope1" | "scope2" | "scope3"> = { scope1: "scope1", scope2: "scope2", scope3: "scope3" }
const scopeLabel: Record<string, string> = { scope1: "Scope 1", scope2: "Scope 2", scope3: "Scope 3" }

export function ActivityTable() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [scopeFilter, setScopeFilter] = useState("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editActivity, setEditActivity] = useState<Activity | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "10" })
    if (search) params.set("search", search)
    if (scopeFilter !== "all") params.set("scope", scopeFilter)
    try {
      const res = await fetch(`/api/activities?${params}`)
      const json = await res.json()
      setActivities(json.data || [])
      setTotal(json.meta?.total || 0)
      setTotalPages(json.meta?.totalPages || 1)
    } catch { toast({ title: "Error", description: "Gagal memuat data", variant: "destructive" }) }
    finally { setLoading(false) }
  }, [page, search, scopeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/activities/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast({ title: "Berhasil", description: "Data berhasil dihapus" })
      setDeleteId(null)
      fetchData()
    } catch { toast({ title: "Error", description: "Gagal menghapus data", variant: "destructive" }) }
    finally { setDeleting(false) }
  }

  const getDetail = (a: Activity) => {
    if (a.fuelType) return `${a.vehicleType || ""} · ${a.fuelType}`
    if (a.electricitySource) return `PLN · ${a.electricitySource}`
    if (a.flightType) return `Penerbangan · ${a.flightType}`
    return a.category
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Cari aktivitas..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={scopeFilter} onValueChange={v => { setScopeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Scope</SelectItem>
            <SelectItem value="scope1">Scope 1</SelectItem>
            <SelectItem value="scope2">Scope 2</SelectItem>
            <SelectItem value="scope3">Scope 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">Tidak ada data ditemukan</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Tanggal</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Scope</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Kategori</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Detail</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Quantity</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Emisi (kgCO2e)</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activities.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 text-gray-600">{format(new Date(a.startDate), "d MMM yyyy", { locale: id })}</td>
                    <td className="px-4 py-3"><Badge variant={scopeVariant[a.scope]}>{scopeLabel[a.scope]}</Badge></td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{a.category}</td>
                    <td className="px-4 py-3 text-gray-500">{getDetail(a)}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{a.quantity} {a.unit}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{a.emissionResult.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setEditActivity(a)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <p>Menampilkan {activities.length} dari {total} data</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
            <span className="px-2">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Data Emisi</DialogTitle>
            <DialogDescription>Apakah Anda yakin ingin menghapus data ini? Data tidak akan hilang permanen (soft delete).</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editActivity && (
        <EditActivityForm
          activity={editActivity}
          open={!!editActivity}
          onClose={() => setEditActivity(null)}
          onSuccess={() => { setEditActivity(null); fetchData() }}
        />
      )}
    </div>
  )
}
