import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { activitySchema } from "@/lib/validations";
import { calculateEmission } from "@/lib/calculations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = activitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const factorQuery: Record<string, string> = { scope: data.scope, category: data.category };

    if (data.category === "Barang & Jasa yang Dibeli" || data.category === "Barang Modal") {
      if (data.vehicleType) factorQuery.factorType = data.vehicleType;
    } else if (data.category === "Emisi Terkait Bahan Bakar dan Energi") {
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

    const activity = await prisma.activity.update({
      where: { id },
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

    return NextResponse.json({ data: activity });
  } catch (error) {
    console.error("PUT /api/activities/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ message: "Data berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/activities/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
