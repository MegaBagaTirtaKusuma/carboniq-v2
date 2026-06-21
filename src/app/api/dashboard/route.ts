import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    const scope1Total = activities.filter(a => a.scope === "scope1").reduce((s, a) => s + a.emissionResult, 0);
    const scope2Total = activities.filter(a => a.scope === "scope2").reduce((s, a) => s + a.emissionResult, 0);
    const scope3Total = activities.filter(a => a.scope === "scope3").reduce((s, a) => s + a.emissionResult, 0);
    const grandTotal = scope1Total + scope2Total + scope3Total;

    // Monthly trend (last 6 months)
    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const month = date.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      const monthActivities = activities.filter(a => {
        const d = new Date(a.startDate);
        return d >= date && d < nextDate;
      });
      return {
        month,
        scope1: parseFloat(monthActivities.filter(a => a.scope === "scope1").reduce((s, a) => s + a.emissionResult, 0).toFixed(2)),
        scope2: parseFloat(monthActivities.filter(a => a.scope === "scope2").reduce((s, a) => s + a.emissionResult, 0).toFixed(2)),
        scope3: parseFloat(monthActivities.filter(a => a.scope === "scope3").reduce((s, a) => s + a.emissionResult, 0).toFixed(2)),
      };
    });

    const recent = activities.slice(0, 5);

    return NextResponse.json({
      totals: {
        scope1: parseFloat(scope1Total.toFixed(2)),
        scope2: parseFloat(scope2Total.toFixed(2)),
        scope3: parseFloat(scope3Total.toFixed(2)),
        total: parseFloat(grandTotal.toFixed(2)),
      },
      monthlyTrend: monthlyData,
      recentActivities: recent,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Gagal mengambil data dashboard" }, { status: 500 });
  }
}
