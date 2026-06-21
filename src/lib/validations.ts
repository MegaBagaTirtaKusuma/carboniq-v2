import { z } from "zod";

export const activitySchema = z.object({
  scope: z.enum(["scope1", "scope2", "scope3"]),
  category: z.string().min(1, "Kategori wajib diisi"),
  vehicleType: z.string().optional(),
  fuelType: z.string().optional(),
  electricitySource: z.string().optional(),
  flightType: z.string().optional(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  quantity: z.coerce.number().positive("Jumlah harus lebih dari 0"),
  unit: z.string().min(1, "Satuan wajib diisi"),
});

export type ActivityInput = z.infer<typeof activitySchema>;

export const emissionFactorSchema = z.object({
  scope: z.enum(["scope1", "scope2", "scope3"]),
  category: z.string().min(1, "Kategori wajib diisi"),
  factorType: z.string().min(1, "Tipe faktor wajib diisi"),
  factorValue: z.coerce.number().positive("Nilai faktor harus lebih dari 0"),
  unit: z.string().min(1, "Satuan wajib diisi"),
});

export type EmissionFactorInput = z.infer<typeof emissionFactorSchema>;
