import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emissionFactorSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = emissionFactorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const factor = await prisma.emissionFactor.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ data: factor });
  } catch (error) {
    console.error("PUT /api/emission-factors/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.emissionFactor.delete({ where: { id } });
    return NextResponse.json({ message: "Faktor emisi berhasil dihapus" });
  } catch (error) {
    console.error("DELETE /api/emission-factors/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus data" }, { status: 500 });
  }
}
