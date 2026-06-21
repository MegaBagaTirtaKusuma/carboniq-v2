"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const schema = z.object({
  vehicleType: z.string().min(1, "Pilih jenis kendaraan"),
  fuelType: z.string().min(1, "Pilih jenis bahan bakar"),
  startDate: z.string().min(1, "Isi tanggal mulai"),
  endDate: z.string().min(1, "Isi tanggal selesai"),
  quantity: z.coerce.number().positive("Jumlah harus lebih dari 0"),
})

type FormData = z.infer<typeof schema>

interface Props { onSuccess?: () => void }

export function Scope1Form({ onSuccess }: Props) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, scope: "scope1", category: "Kendaraan Operasional", unit: "Liter" }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan")
      toast({ title: "Berhasil!", description: `Emisi: ${json.data.emissionResult.toFixed(2)} kgCO2e`, variant: "default" })
      reset()
      onSuccess?.()
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Terjadi kesalahan", variant: "destructive" })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Jenis Kendaraan</Label>
          <Select onValueChange={(v) => setValue("vehicleType", v)}>
            <SelectTrigger><SelectValue placeholder="Pilih kendaraan" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Motor">Motor</SelectItem>
              <SelectItem value="Mobil">Mobil</SelectItem>
            </SelectContent>
          </Select>
          {errors.vehicleType && <p className="text-xs text-red-500">{errors.vehicleType.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Jenis Bahan Bakar</Label>
          <Select onValueChange={(v) => setValue("fuelType", v)}>
            <SelectTrigger><SelectValue placeholder="Pilih bahan bakar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Pertalite">Pertalite (2.309 kgCO2e/L)</SelectItem>
              <SelectItem value="Pertamax">Pertamax (2.305 kgCO2e/L)</SelectItem>
            </SelectContent>
          </Select>
          {errors.fuelType && <p className="text-xs text-red-500">{errors.fuelType.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Tanggal Mulai</Label>
          <Input type="date" {...register("startDate")} />
          {errors.startDate && <p className="text-xs text-red-500">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Tanggal Selesai</Label>
          <Input type="date" {...register("endDate")} />
          {errors.endDate && <p className="text-xs text-red-500">{errors.endDate.message}</p>}
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Jumlah Pemakaian (Liter)</Label>
          <Input type="number" step="0.01" placeholder="0.00" {...register("quantity")} />
          {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan & Hitung Emisi"}
      </Button>
    </form>
  )
}
