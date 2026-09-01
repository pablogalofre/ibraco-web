import { NextResponse } from "next/server";
import { getQ10Periods } from "@/app/lib/q10";

export async function GET() {
  try {
    const periods = await getQ10Periods();

    const records = Array.isArray(periods)
      ? periods
      : [];

    const filtered = records
      .filter((item: any) => {
        const nombre = String(item.Nombre ?? "");
        return nombre.includes("2026");
      })
      .sort((a: any, b: any) => {
        const aValue =
          a.Consecutivo ??
          a.Ordenamiento ??
          0;

        const bValue =
          b.Consecutivo ??
          b.Ordenamiento ??
          0;

        return bValue - aValue;
      })
      .map((item: any) => ({
        Consecutivo:
          item.Consecutivo ?? null,
        Ordenamiento:
          item.Ordenamiento ?? null,
        Nombre:
          item.Nombre ?? null,
        Fecha_inicio:
          item.Fecha_inicio ?? null,
        Fecha_fin:
          item.Fecha_fin ?? null,
        Estado:
          item.Estado ?? null,
      }));

    return NextResponse.json({
      ok: true,
      cantidadTotal: records.length,
      cantidad2026: filtered.length,
      periodos2026: filtered,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error desconocido",
      },
      { status: 500 }
    );
  }
}