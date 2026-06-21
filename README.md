# CarbonIQ v2 — Carbon Emission Management System

Sistem manajemen emisi karbon berbasis GHG Protocol untuk mahasiswa, UMKM, dan perusahaan.

## Tech Stack

- **Next.js 15** App Router + TypeScript
- **Prisma ORM** + PostgreSQL (Supabase)
- **Tailwind CSS** + Shadcn UI components
- **Recharts** untuk visualisasi data
- **jsPDF** + jspdf-autotable untuk export PDF
- **React Hook Form** + Zod validation

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Setup environment
```bash
cp .env.example .env.local
# Edit .env.local dengan DATABASE_URL dari Supabase
```

### 3. Database setup
```bash
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema ke database
npm run db:seed       # Seed faktor emisi default
```

### 4. Run development server
```bash
npm run dev
```

## Deploy ke Vercel

1. Push repo ke GitHub
2. Connect ke Vercel
3. Tambahkan environment variable `DATABASE_URL` dari Supabase
4. Deploy!

## Fitur

- ✅ Input emisi Scope 1 (Kendaraan — Pertalite/Pertamax)
- ✅ Input emisi Scope 2 (Listrik PLN — Jawa-Bali/Sumatra)
- ✅ Input emisi Scope 3 (Perjalanan Bisnis, Karyawan, Produk)
- ✅ Perhitungan otomatis deterministik dari faktor emisi
- ✅ Dashboard dengan KPI cards + charts (Pie & Bar)
- ✅ Data table dengan search, filter, pagination, edit, soft delete
- ✅ Manajemen faktor emisi (CRUD)
- ✅ Export laporan PDF
- ✅ Responsive mobile & desktop

## Struktur Folder

```
src/
├── app/
│   ├── api/
│   │   ├── activities/        # CRUD aktivitas emisi
│   │   ├── emission-factors/  # CRUD faktor emisi
│   │   └── dashboard/         # Summary & analytics
│   ├── dashboard/
│   ├── input-emisi/
│   ├── data-emisi/
│   ├── laporan/
│   ├── faktor-emisi/
│   └── pengaturan/
├── components/
│   ├── dashboard/     # KPI cards, charts
│   ├── forms/         # Scope1/2/3 forms
│   ├── layout/        # Sidebar, Header
│   ├── tables/        # DataTable, EditForm
│   └── ui/            # Shadcn UI components
├── hooks/             # useToast
└── lib/
    ├── prisma.ts      # Prisma client singleton
    ├── calculations.ts # Logika perhitungan emisi
    ├── validations.ts  # Zod schemas
    └── utils.ts        # cn utility
```
