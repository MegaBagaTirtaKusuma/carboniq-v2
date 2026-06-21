import { ActivityTable } from "@/components/tables/ActivityTable"

export default function DataEmisiPage() {
  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Data Emisi</h2>
        <p className="text-sm text-gray-500 mt-0.5">Riwayat seluruh aktivitas emisi yang telah dicatat</p>
      </div>
      <ActivityTable />
    </div>
  )
}
