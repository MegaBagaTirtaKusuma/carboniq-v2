import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { activitySchema } from "@/lib/validations";
import { calculateEmission } from "@/lib/calculations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope");
    const search = searchParams.get("search");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (scope) where.scope = scope;
    if (search) {
      where.OR = [
        { category: { contains: search, mode: "insensitive" } },
        { vehicleType: { contains: search, mode: "insensitive" } },
        { fuelType: { contains: search, mode: "insensitive" } },
      ];
    }
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) (where.startDate as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.startDate as Record<string, unknown>).lte = new Date(endDate);
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.activity.count({ where }),
    ]);

    return NextResponse.json({
      data: activities,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("GET /api/activities error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  console.log("DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 50))
  try {
    const body = await request.json();
    const parsed = activitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    // Find emission factor — priority logic per category
    const factorQuery: Record<string, string> = { scope: data.scope, category: data.category };

    if (data.category === "Barang & Jasa yang Dibeli" || data.category === "Barang Modal") {
      // vehicleType stores asset type / item name (Tangible, Laptop, Meja, etc.)
      if (data.vehicleType) factorQuery.factorType = data.vehicleType;
    } else if (data.category === "Emisi Terkait Bahan Bakar dan Energi") {
      // fuelType = "PLN", electricitySource = wilayah (Jawa-Bali / Sumatra) — factor keyed by fuelType
      if (data.fuelType) factorQuery.factorType = data.fuelType;
    } else if (data.fuelType) {
      factorQuery.factorType = data.fuelType;
    } else if (data.electricitySource) {
      factorQuery.factorType = data.electricitySource;
    } else if (data.flightType) {
      factorQuery.factorType = data.flightType;
    }

    const emissionFactor = await prisma.emissionFactor.findFirst({ where: factorQuery });

    if (!emissionFactor) {
      return NextResponse.json({ error: "Faktor emisi tidak ditemukan" }, { status: 404 });
    }

    const emissionResult = calculateEmission(data.quantity, emissionFactor.factorValue);

    const activity = await prisma.activity.create({
      data: {
        scope: data.scope,
        category: data.category,
        vehicleType: data.vehicleType,
        fuelType: data.fuelType,
        electricitySource: data.electricitySource,
        flightType: data.flightType,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        quantity: data.quantity,
        unit: data.unit,
        emissionFactor: emissionFactor.factorValue,
        emissionResult,
      },
    });

    return NextResponse.json({ data: activity }, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}
