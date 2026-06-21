"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Category =
  | "Perjalanan Bisnis"
  | "Perjalanan Karyawan"
  | "Penggunaan Produk yang Dijual"
  | "Barang & Jasa yang Dibeli"
  | "Barang Modal"
  | "Emisi Terkait Bahan Bakar dan Energi"

const categories: { id: Category; desc: string }[] = [
  { id: "Perjalanan Bisnis",              desc: "Penerbangan domestik & internasional" },
  { id: "Perjalanan Karyawan",            desc: "Komuter karyawan dengan kendaraan" },
  { id: "Penggunaan Produk yang Dijual",  desc: "Pemakaian produk oleh pelanggan" },
  { id: "Barang & Jasa yang Dibeli",      desc: "Pembelian barang/jasa (Rupiah)" },
  { id: "Barang Modal",                   desc: "Aset modal: laptop, meja, dll (unit)" },
  { id: "Emisi Terkait Bahan Bakar dan Energi", desc: "Listrik PLN upstream & T&D losses" },
]

// ── schemas ──────────────────────────────────────────────────────────────────
const bisSchema = z.object({
  flightType: z.string().min(1, "Pilih jenis penerbangan"),
  startDate: z.string().min(1, ""),
  endDate: z.string().min(1, ""),
  quantity: z.coerce.number().positive("Harus lebih dari 0"),
})

const karySchema = z.object({
  vehicleType: z.string().min(1, "Pilih kendaraan"),
  fuelType: z.string().min(1, "Pilih bahan bakar"),
  startDate: z.string().min(1, ""),
  endDate: z.string().min(1, ""),
  quantity: z.coerce.number().positive("Harus lebih dari 0"),
})

const barangJasaSchema = z.object({
  vehicleType: z.string().min(1, "Pilih jenis aset"),   // re-use vehicleType field → "Tangible"/"Intangible"
  startDate: z.string().min(1, ""),
  endDate: z.string().min(1, ""),
  quantity: z.coerce.number().positive("Harus lebih dari 0"),
})

const barangModalSchema = z.object({
  vehicleType: z.string().min(1, "Pilih nama barang"),  // re-use vehicleType → "Laptop"/"Meja"
  startDate: z.string().min(1, ""),
  endDate: z.string().min(1, ""),
  quantity: z.coerce.number().positive("Harus lebih dari 0"),
})

const energiSchema = z.object({
  electricitySource: z.string().min(1, "Pilih sumber listrik"),
  fuelType: z.string().min(1, "Pilih jenis bahan bakar/energi"),
  startDate: z.string().min(1, ""),
  endDate: z.string().min(1, ""),
  quantity: z.coerce.number().positive("Harus lebih dari 0"),
})

interface Props { onSuccess?: () => void }

export function Scope3Form({ onSuccess }: Props) {
  const [category, setCategory] = useState<Category | null>(null)

  const bis      = useForm({ resolver: zodResolver(bisSchema) })
  const kary     = useForm({ resolver: zodResolver(karySchema) })
  const prod     = useForm({ resolver: zodResolver(karySchema) })
  const bj       = useForm({ resolver: zodResolver(barangJasaSchema) })
  const bm       = useForm({ resolver: zodResolver(barangModalSchema) })
  const energi   = useForm({ resolver: zodResolver(energiSchema) })

  const resetAll = () => { bis.reset(); kary.reset(); prod.reset(); bj.reset(); bm.reset(); energi.reset() }

  const submit = async (data: Record<string, unknown>, cat: Category, unit: string) => {
    try {
      const payload: Record<string, unknown> = {
        scope: "scope3",
        category: cat,
        unit,
        startDate: data.startDate,
        endDate: data.endDate,
        quantity: data.quantity,
      }
      // map fields per category
      if (cat === "Perjalanan Bisnis") {
        payload.flightType = data.flightType
      } else if (cat === "Barang & Jasa yang Dibeli" || cat === "Barang Modal") {
        payload.vehicleType = data.vehicleType   // stores asset type / item name
      } else if (cat === "Emisi Terkait Bahan Bakar dan Energi") {
        payload.electricitySource = data.electricitySource
        payload.fuelType = data.fuelType
      } else {
        payload.vehicleType = data.vehicleType
        payload.fuelType = data.fuelType
      }

      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan")
      toast({ title: "Berhasil!", description: `Emisi: ${json.data.emissionResult.toFixed(2)} kgCO2e` })
      resetAll()
      onSuccess?.()
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Terjadi kesalahan", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-5">
      {/* Category selector */}
      <div>
        <Label className="mb-2 block">Pilih Kategori Scope 3</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(({ id, desc }) => (
            <button
              key={id}
              type="button"
              onClick={() => setCategory(id)}
              className={cn(
                "p-3 text-sm font-medium rounded-lg border text-left transition-colors leading-snug",
                category === id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <span className="block font-semibold text-xs mb-0.5">{id}</span>
              <span className="block text-xs font-normal opacity-70">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Perjalanan Bisnis ─────────────────────────────────────────────── */}
      {category === "Perjalanan Bisnis" && (
        <form onSubmit={bis.handleSubmit(d => submit(d, "Perjalanan Bisnis", "Km"))} className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Jenis Penerbangan</Label>
              <Select onValueChange={v => bis.setValue("flightType", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis penerbangan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Domestik">Domestik (0.255 kgCO2e/Km)</SelectItem>
                  <SelectItem value="Internasional">Internasional (0.195 kgCO2e/Km)</SelectItem>
                </SelectContent>
              </Select>
              {bis.formState.errors.flightType && <p className="text-xs text-red-500">{String(bis.formState.errors.flightType.message ?? "")}</p>}
            </div>
            <div className="space-y-1.5"><Label>Tanggal Mulai</Label><Input type="date" {...bis.register("startDate")} /></div>
            <div className="space-y-1.5"><Label>Tanggal Selesai</Label><Input type="date" {...bis.register("endDate")} /></div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Jarak Perjalanan (Km)</Label>
              <Input type="number" step="0.01" placeholder="0.00" {...bis.register("quantity")} />
              {bis.formState.errors.quantity && <p className="text-xs text-red-500">{String(bis.formState.errors.quantity.message ?? "")}</p>}
            </div>
          </div>
          <Button type="submit" disabled={bis.formState.isSubmitting} className="w-full">
            {bis.formState.isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan & Hitung Emisi"}
          </Button>
        </form>
      )}

      {/* ── Perjalanan Karyawan & Penggunaan Produk ──────────────────────── */}
      {(category === "Perjalanan Karyawan" || category === "Penggunaan Produk yang Dijual") && (() => {
        const form = category === "Perjalanan Karyawan" ? kary : prod
        return (
          <form onSubmit={form.handleSubmit(d => submit(d, category!, "Km"))} className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Jenis Kendaraan</Label>
                <Select onValueChange={v => form.setValue("vehicleType", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih kendaraan" /></SelectTrigger>
                  <SelectContent><SelectItem value="Motor">Motor</SelectItem><SelectItem value="Mobil">Mobil</SelectItem></SelectContent>
                </Select>
                {form.formState.errors.vehicleType && <p className="text-xs text-red-500">{form.formState.errors.vehicleType.message as string}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Jenis Bahan Bakar</Label>
                <Select onValueChange={v => form.setValue("fuelType", v)}>
                  <SelectTrigger><SelectValue placeholder="Pilih bahan bakar" /></SelectTrigger>
                  <SelectContent><SelectItem value="Pertalite">Pertalite</SelectItem><SelectItem value="Pertamax">Pertamax</SelectItem></SelectContent>
                </Select>
                {form.formState.errors.fuelType && <p className="text-xs text-red-500">{form.formState.errors.fuelType.message as string}</p>}
              </div>
              <div className="space-y-1.5"><Label>Tanggal Mulai</Label><Input type="date" {...form.register("startDate")} /></div>
              <div className="space-y-1.5"><Label>Tanggal Selesai</Label><Input type="date" {...form.register("endDate")} /></div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Jarak Tempuh (Km)</Label>
                <Input type="number" step="0.01" placeholder="0.00" {...form.register("quantity")} />
                {form.formState.errors.quantity && <p className="text-xs text-red-500">{form.formState.errors.quantity.message as string}</p>}
              </div>
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan & Hitung Emisi"}
            </Button>
          </form>
        )
      })()}

      {/* ── Barang & Jasa yang Dibeli ─────────────────────────────────────── */}
      {category === "Barang & Jasa yang Dibeli" && (
        <form onSubmit={bj.handleSubmit(d => submit(d, "Barang & Jasa yang Dibeli", "Rupiah"))} className="space-y-4 border-t pt-4">
          <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Faktor emisi berbasis pengeluaran (spend-based). Ubah nilai faktor di menu <strong>Faktor Emisi</strong> sesuai sektor industri.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Jenis Aset</Label>
              <Select onValueChange={v => bj.setValue("vehicleType", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis aset" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tangible">Tangible (Aset Berwujud)</SelectItem>
                  <SelectItem value="Intangible">Intangible (Aset Tidak Berwujud)</SelectItem>
                </SelectContent>
              </Select>
              {bj.formState.errors.vehicleType && <p className="text-xs text-red-500">{bj.formState.errors.vehicleType.message as string}</p>}
            </div>
            <div className="space-y-1.5"><Label>Tanggal Mulai</Label><Input type="date" {...bj.register("startDate")} /></div>
            <div className="space-y-1.5"><Label>Tanggal Selesai</Label><Input type="date" {...bj.register("endDate")} /></div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Jumlah Pengeluaran (Rupiah)</Label>
              <Input type="number" step="1000" placeholder="0" {...bj.register("quantity")} />
              {bj.formState.errors.quantity && <p className="text-xs text-red-500">{bj.formState.errors.quantity.message as string}</p>}
            </div>
          </div>
          <Button type="submit" disabled={bj.formState.isSubmitting} className="w-full">
            {bj.formState.isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan & Hitung Emisi"}
          </Button>
        </form>
      )}

      {/* ── Barang Modal ─────────────────────────────────────────────────── */}
      {category === "Barang Modal" && (
        <form onSubmit={bm.handleSubmit(d => submit(d, "Barang Modal", "Unit"))} className="space-y-4 border-t pt-4">
          <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Emisi dari produksi barang modal. Faktor emisi per unit dapat diubah di menu <strong>Faktor Emisi</strong>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Nama Barang</Label>
              <Select onValueChange={v => bm.setValue("vehicleType", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih barang modal" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Meja">Meja</SelectItem>
                  <SelectItem value="Kursi">Kursi</SelectItem>
                  <SelectItem value="Server">Server</SelectItem>
                  <SelectItem value="AC">AC</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
              {bm.formState.errors.vehicleType && <p className="text-xs text-red-500">{bm.formState.errors.vehicleType.message as string}</p>}
            </div>
            <div className="space-y-1.5"><Label>Tanggal Mulai</Label><Input type="date" {...bm.register("startDate")} /></div>
            <div className="space-y-1.5"><Label>Tanggal Selesai</Label><Input type="date" {...bm.register("endDate")} /></div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Jumlah (Unit)</Label>
              <Input type="number" step="1" min="1" placeholder="1" {...bm.register("quantity")} />
              {bm.formState.errors.quantity && <p className="text-xs text-red-500">{bm.formState.errors.quantity.message as string}</p>}
            </div>
          </div>
          <Button type="submit" disabled={bm.formState.isSubmitting} className="w-full">
            {bm.formState.isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan & Hitung Emisi"}
          </Button>
        </form>
      )}

      {/* ── Emisi Terkait Bahan Bakar dan Energi ─────────────────────────── */}
      {category === "Emisi Terkait Bahan Bakar dan Energi" && (
        <form onSubmit={energi.handleSubmit(d => submit(d, "Emisi Terkait Bahan Bakar dan Energi", "kWh"))} className="space-y-4 border-t pt-4">
          <p className="text-xs text-gray-500 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            Mencakup emisi upstream dari produksi & transmisi energi yang dikonsumsi (T&D losses, well-to-gate).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Sumber Listrik / Wilayah</Label>
              <Select onValueChange={v => energi.setValue("electricitySource", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih wilayah" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jawa-Bali">Jawa-Bali</SelectItem>
                  <SelectItem value="Sumatra">Sumatra</SelectItem>
                </SelectContent>
              </Select>
              {energi.formState.errors.electricitySource && <p className="text-xs text-red-500">{energi.formState.errors.electricitySource.message as string}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Jenis Bahan Bakar / Energi</Label>
              <Select onValueChange={v => energi.setValue("fuelType", v)}>
                <SelectTrigger><SelectValue placeholder="Pilih jenis energi" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLN">PLN (Grid Electricity)</SelectItem>
                </SelectContent>
              </Select>
              {energi.formState.errors.fuelType && <p className="text-xs text-red-500">{energi.formState.errors.fuelType.message as string}</p>}
            </div>
            <div className="space-y-1.5"><Label>Tanggal Mulai</Label><Input type="date" {...energi.register("startDate")} /></div>
            <div className="space-y-1.5"><Label>Tanggal Selesai</Label><Input type="date" {...energi.register("endDate")} /></div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Konsumsi Energi (kWh)</Label>
              <Input type="number" step="0.01" placeholder="0.00" {...energi.register("quantity")} />
              {energi.formState.errors.quantity && <p className="text-xs text-red-500">{energi.formState.errors.quantity.message as string}</p>}
            </div>
          </div>
          <Button type="submit" disabled={energi.formState.isSubmitting} className="w-full">
            {energi.formState.isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan & Hitung Emisi"}
          </Button>
        </form>
      )}
    </div>
  )
}
