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
  electricitySource: z.string().min(1, "Pilih sumber listrik"),
  startDate: z.string().min(1, "Isi tanggal mulai"),
  endDate: z.string().min(1, "Isi tanggal selesai"),
  quantity: z.coerce.number().positive("Jumlah harus lebih dari 0"),
})

type FormData = z.infer<typeof schema>
interface Props { onSuccess?: () => void }

export function Scope2Form({ onSuccess }: Props) {
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, scope: "scope2", category: "Listrik PLN", unit: "kWh" }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan")
      toast({ title: "Berhasil!", description: `Emisi: ${json.data.emissionResult.toFixed(2)} kgCO2e` })
      reset()
      onSuccess?.()
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Terjadi kesalahan", variant: "destructive" })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Sumber Listrik / Wilayah PLN</Label>
          <Select onValueChange={(v) => setValue("electricitySource", v)}>
            <SelectTrigger><SelectValue placeholder="Pilih wilayah" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Jawa-Bali">Jawa-Bali (0.870 kgCO2e/kWh)</SelectItem>
              <SelectItem value="Sumatra">Sumatra (0.790 kgCO2e/kWh)</SelectItem>
            </SelectContent>
          </Select>
          {errors.electricitySource && <p className="text-xs text-red-500">{errors.electricitySource.message}</p>}
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
          <Label>Konsumsi Listrik (kWh)</Label>
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
