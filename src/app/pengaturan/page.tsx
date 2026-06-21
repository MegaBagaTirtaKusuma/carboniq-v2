export default function PengaturanPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Pengaturan</h2>
        <p className="text-sm text-gray-500 mt-0.5">Konfigurasi aplikasi CarbonIQ</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Tentang CarbonIQ</h3>
          <p className="text-sm text-gray-500">Versi 2.0.0 — Carbon Emission Management System</p>
        </div>
        <div className="border-t border-gray-50 pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Informasi Sistem</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: "Database", value: "PostgreSQL via Supabase" },
              { label: "ORM", value: "Prisma" },
              { label: "Framework", value: "Next.js 15 App Router" },
              { label: "Metodologi", value: "GHG Protocol (Scope 1, 2, 3)" },
              { label: "Satuan Emisi", value: "kgCO2e / tCO2e" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-800 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-gray-50 pt-6">
          <h3 className="font-semibold text-gray-900 mb-2">Sumber Faktor Emisi</h3>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>• Scope 1: Faktor emisi bahan bakar Pertamina (kgCO2e/Liter)</li>
            <li>• Scope 2: Grid emission factor PLN per wilayah (kgCO2e/kWh)</li>
            <li>• Scope 3: DEFRA / ICAO emission factors (kgCO2e/Km)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
