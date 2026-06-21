import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing factors
  await prisma.emissionFactor.deleteMany();

  // Scope 1 - Bahan Bakar
  await prisma.emissionFactor.createMany({
    data: [
      {
        scope: "scope1",
        category: "Kendaraan Operasional",
        factorType: "Pertalite",
        factorValue: 2.309,
        unit: "kgCO2e/Liter",
      },
      {
        scope: "scope1",
        category: "Kendaraan Operasional",
        factorType: "Pertamax",
        factorValue: 2.305,
        unit: "kgCO2e/Liter",
      },
    ],
  });

  // Scope 2 - Listrik
  await prisma.emissionFactor.createMany({
    data: [
      {
        scope: "scope2",
        category: "Listrik PLN",
        factorType: "Jawa-Bali",
        factorValue: 0.87,
        unit: "kgCO2e/kWh",
      },
      {
        scope: "scope2",
        category: "Listrik PLN",
        factorType: "Sumatra",
        factorValue: 0.79,
        unit: "kgCO2e/kWh",
      },
    ],
  });

  // Scope 3 - Perjalanan Bisnis
  await prisma.emissionFactor.createMany({
    data: [
      {
        scope: "scope3",
        category: "Perjalanan Bisnis",
        factorType: "Domestik",
        factorValue: 0.255,
        unit: "kgCO2e/Km",
      },
      {
        scope: "scope3",
        category: "Perjalanan Bisnis",
        factorType: "Internasional",
        factorValue: 0.195,
        unit: "kgCO2e/Km",
      },
      // Scope 3 - Perjalanan Karyawan
      {
        scope: "scope3",
        category: "Perjalanan Karyawan",
        factorType: "Pertalite",
        factorValue: 2.309,
        unit: "kgCO2e/Km",
      },
      {
        scope: "scope3",
        category: "Perjalanan Karyawan",
        factorType: "Pertamax",
        factorValue: 2.305,
        unit: "kgCO2e/Km",
      },
      // Scope 3 - Penggunaan Produk
      {
        scope: "scope3",
        category: "Penggunaan Produk yang Dijual",
        factorType: "Pertalite",
        factorValue: 2.309,
        unit: "kgCO2e/Km",
      },
      {
        scope: "scope3",
        category: "Penggunaan Produk yang Dijual",
        factorType: "Pertamax",
        factorValue: 2.305,
        unit: "kgCO2e/Km",
      },
    ],
  });

  // Scope 3 - Barang & Jasa yang Dibeli (spend-based, kgCO2e/Rupiah)
  await prisma.emissionFactor.createMany({
    data: [
      {
        scope: "scope3",
        category: "Barang & Jasa yang Dibeli",
        factorType: "Tangible",
        factorValue: 0.00000035, // 0.35 kgCO2e per seribu rupiah (placeholder, ubah sesuai sektor)
        unit: "kgCO2e/Rupiah",
      },
      {
        scope: "scope3",
        category: "Barang & Jasa yang Dibeli",
        factorType: "Intangible",
        factorValue: 0.00000020,
        unit: "kgCO2e/Rupiah",
      },
    ],
  });

  // Scope 3 - Barang Modal (kgCO2e/Unit)
  await prisma.emissionFactor.createMany({
    data: [
      {
        scope: "scope3",
        category: "Barang Modal",
        factorType: "Laptop",
        factorValue: 316.0, // ~316 kgCO2e per unit laptop (rata-rata lifecycle)
        unit: "kgCO2e/Unit",
      },
      {
        scope: "scope3",
        category: "Barang Modal",
        factorType: "Meja",
        factorValue: 45.0,
        unit: "kgCO2e/Unit",
      },
      {
        scope: "scope3",
        category: "Barang Modal",
        factorType: "Kursi",
        factorValue: 30.0,
        unit: "kgCO2e/Unit",
      },
      {
        scope: "scope3",
        category: "Barang Modal",
        factorType: "Server",
        factorValue: 1400.0,
        unit: "kgCO2e/Unit",
      },
      {
        scope: "scope3",
        category: "Barang Modal",
        factorType: "AC",
        factorValue: 200.0,
        unit: "kgCO2e/Unit",
      },
      {
        scope: "scope3",
        category: "Barang Modal",
        factorType: "Lainnya",
        factorValue: 50.0,
        unit: "kgCO2e/Unit",
      },
    ],
  });

  // Scope 3 - Emisi Terkait Bahan Bakar dan Energi (T&D losses, kgCO2e/kWh)
  await prisma.emissionFactor.createMany({
    data: [
      {
        scope: "scope3",
        category: "Emisi Terkait Bahan Bakar dan Energi",
        factorType: "PLN",          // fuelType
        factorValue: 0.085,         // T&D loss factor ~9.8% of grid emission factor Jawa-Bali
        unit: "kgCO2e/kWh",
      },
    ],
  });

  console.log("✅ Seed selesai!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
