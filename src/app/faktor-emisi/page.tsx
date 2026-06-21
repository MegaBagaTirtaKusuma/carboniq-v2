"use client"
import { useEffect, useState, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { emissionFactorSchema, type EmissionFactorInput } from "@/lib/validations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"

interface Factor { id: string; scope: string; category: string; factorType: string; factorValue: number; unit: string }

const scopeLabel: Record<string, string> = { scope1: "Scope 1", scope2: "Scope 2", scope3: "Scope 3" }
const scopeVariant: Record<string, "scope1" | "scope2" | "scope3"> = { scope1: "scope1", scope2: "scope2", scope3: "scope3" }

function FactorForm({ initial, onSave, onCancel }: { initial?: Factor; onSave: (d: EmissionFactorInput) => Promise<void>; onCancel: () => void }) {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<EmissionFactorInput>({
    resolver: zodResolver(emissionFactorSchema),
    defaultValues: initial ? { scope: initial.scope as "scope1" | "scope2" | "scope3", category: initial.category, factorType: initial.factorType, factorValue: initial.factorValue, unit: initial.unit } : undefined,
  })
  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Scope</Label>
          <Select defaultValue={initial?.scope} onValueChange={v => setValue("scope", v as "scope1" | "scope2" | "scope3")}>
            <SelectTrigger><SelectValue placeholder="Pilih scope" /></SelectTrigger>
            <SelectContent><SelectItem value="scope1">Scope 1</SelectItem><SelectItem value="scope2">Scope 2</SelectItem><SelectItem value="scope3">Scope 3</SelectItem></SelectContent>
          </Select>
          {errors.scope && <p className="text-xs text-red-500">{errors.scope.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Kategori</Label>
          <Input {...register("category")} placeholder="Kendaraan Operasional" />
          {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Tipe Faktor</Label>
          <Input {...register("factorType")} placeholder="Pertalite" />
          {errors.factorType && <p className="text-xs text-red-500">{errors.factorType.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Nilai Faktor</Label>
          <Input type="number" step="0.0001" {...register("factorValue")} placeholder="2.309" />
          {errors.factorValue && <p className="text-xs text-red-500">{errors.factorValue.message}</p>}
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label>Satuan</Label>
          <Input {...register("unit")} placeholder="kgCO2e/Liter" />
          {errors.unit && <p className="text-xs text-red-500">{errors.unit.message}</p>}
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
        </Button>
      </div>
    </form>
  )
}

export default function FaktorEmisiPage() {
  const [factors, setFactors] = useState<Factor[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editFactor, setEditFactor] = useState<Factor | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/emission-factors")
      const json = await res.json()
      setFactors(json.data || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleAdd = async (data: EmissionFactorInput) => {
    const res = await fetch("/api/emission-factors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) throw new Error("Gagal menyimpan")
    toast({ title: "Faktor emisi ditambahkan" })
    setShowAdd(false)
    fetchData()
  }

  const handleEdit = async (data: EmissionFactorInput) => {
    const res = await fetch(`/api/emission-factors/${editFactor!.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
    if (!res.ok) throw new Error("Gagal memperbarui")
    toast({ title: "Faktor emisi diperbarui" })
    setEditFactor(null)
    fetchData()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await fetch(`/api/emission-factors/${deleteId}`, { method: "DELETE" })
      toast({ title: "Faktor emisi dihapus" })
      setDeleteId(null)
      fetchData()
    } finally { setDeleting(false) }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Faktor Emisi</h2>
          <p className="text-sm text-gray-500 mt-0.5">Kelola faktor emisi yang digunakan dalam perhitungan</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Tambah Faktor</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Scope</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Kategori</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Tipe</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Nilai</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Satuan</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {factors.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3"><Badge variant={scopeVariant[f.scope]}>{scopeLabel[f.scope]}</Badge></td>
                    <td className="px-4 py-3 text-gray-700">{f.category}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{f.factorType}</td>
                    <td className="px-4 py-3 text-right font-semibold text-blue-600">{f.factorValue}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{f.unit}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setEditFactor(f)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteId(f.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent><DialogHeader><DialogTitle>Tambah Faktor Emisi</DialogTitle></DialogHeader>
          <FactorForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </DialogContent>
      </Dialog>

      {editFactor && (
        <Dialog open={!!editFactor} onOpenChange={() => setEditFactor(null)}>
          <DialogContent><DialogHeader><DialogTitle>Edit Faktor Emisi</DialogTitle></DialogHeader>
            <FactorForm initial={editFactor} onSave={handleEdit} onCancel={() => setEditFactor(null)} />
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Hapus Faktor Emisi</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-500">Yakin ingin menghapus faktor emisi ini? Ini akan memengaruhi perhitungan baru.</p>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Hapus"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
