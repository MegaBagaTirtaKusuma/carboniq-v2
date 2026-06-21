"use client"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Activity {
  id: string; scope: string; category: string; vehicleType?: string; fuelType?: string
  electricitySource?: string; flightType?: string; startDate: string; quantity: number
  endDate: string; unit: string
}

const schema = z.object({
  vehicleType: z.string().optional(),
  fuelType: z.string().optional(),
  electricitySource: z.string().optional(),
  flightType: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  quantity: z.coerce.number().positive(),
})

type FormData = z.infer<typeof schema>

interface Props { activity: Activity; open: boolean; onClose: () => void; onSuccess: () => void }

export function EditActivityForm({ activity, open, onClose, onSuccess }: Props) {
  const { register, handleSubmit, setValue, reset, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      vehicleType: activity.vehicleType,
      fuelType: activity.fuelType,
      electricitySource: activity.electricitySource,
      flightType: activity.flightType,
      startDate: format(new Date(activity.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(activity.endDate), "yyyy-MM-dd"),
      quantity: activity.quantity,
    }
  })

  useEffect(() => {
    reset({
      vehicleType: activity.vehicleType || "",
      fuelType: activity.fuelType || "",
      electricitySource: activity.electricitySource || "",
      flightType: activity.flightType || "",
      startDate: format(new Date(activity.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(activity.endDate), "yyyy-MM-dd"),
      quantity: activity.quantity,
    })
  }, [activity, reset])

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: activity.scope,
          category: activity.category,
          unit: activity.unit,
          ...data,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Gagal memperbarui")
      toast({ title: "Berhasil!", description: `Emisi baru: ${json.data.emissionResult.toFixed(2)} kgCO2e` })
      onSuccess()
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Terjadi kesalahan", variant: "destructive" })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Data Emisi</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {activity.scope === "scope1" && (
            <>
              <div className="space-y-1.5">
                <Label>Jenis Kendaraan</Label>
                <Select defaultValue={activity.vehicleType} onValueChange={v => setValue("vehicleType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Motor">Motor</SelectItem><SelectItem value="Mobil">Mobil</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Jenis Bahan Bakar</Label>
                <Select defaultValue={activity.fuelType} onValueChange={v => setValue("fuelType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Pertalite">Pertalite</SelectItem><SelectItem value="Pertamax">Pertamax</SelectItem></SelectContent>
                </Select>
              </div>
            </>
          )}
          {activity.scope === "scope2" && (
            <div className="space-y-1.5">
              <Label>Sumber Listrik</Label>
              <Select defaultValue={activity.electricitySource} onValueChange={v => setValue("electricitySource", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Jawa-Bali">Jawa-Bali</SelectItem><SelectItem value="Sumatra">Sumatra</SelectItem></SelectContent>
              </Select>
            </div>
          )}
          {activity.scope === "scope3" && activity.category === "Perjalanan Bisnis" && (
            <div className="space-y-1.5">
              <Label>Jenis Penerbangan</Label>
              <Select defaultValue={activity.flightType} onValueChange={v => setValue("flightType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="Domestik">Domestik</SelectItem><SelectItem value="Internasional">Internasional</SelectItem></SelectContent>
              </Select>
            </div>
          )}
          {activity.scope === "scope3" && activity.category !== "Perjalanan Bisnis" && (
            <>
              <div className="space-y-1.5">
                <Label>Kendaraan</Label>
                <Select defaultValue={activity.vehicleType} onValueChange={v => setValue("vehicleType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Motor">Motor</SelectItem><SelectItem value="Mobil">Mobil</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Bahan Bakar</Label>
                <Select defaultValue={activity.fuelType} onValueChange={v => setValue("fuelType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Pertalite">Pertalite</SelectItem><SelectItem value="Pertamax">Pertamax</SelectItem></SelectContent>
                </Select>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Tanggal Mulai</Label><Input type="date" {...register("startDate")} /></div>
            <div className="space-y-1.5"><Label>Tanggal Selesai</Label><Input type="date" {...register("endDate")} /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Jumlah ({activity.unit})</Label>
            <Input type="number" step="0.01" {...register("quantity")} />
            {errors.quantity && <p className="text-xs text-red-500">Jumlah harus lebih dari 0</p>}
          </div>
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
