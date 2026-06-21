import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emissionFactorSchema } from "@/lib/validations";

export async function GET() {
  try {
    const factors = await prisma.emissionFactor.findMany({ orderBy: { scope: "asc" } });
    return NextResponse.json({ data: factors });
  } catch (error) {
    console.error("GET /api/emission-factors error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = emissionFactorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const factor = await prisma.emissionFactor.create({ data: parsed.data });
    return NextResponse.json({ data: factor }, { status: 201 });
  } catch (error) {
    console.error("POST /api/emission-factors error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
  }
}
