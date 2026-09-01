import { NextResponse } from "next/server";
import { getQ10Preinscriptions } from "@/app/lib/q10";

export async function GET() {
  try {
    const result = await getQ10Preinscriptions(240, 100, 1);

    const records = Array.isArray(result)
      ? result
      : Array.isArray(result?.Data)
        ? result.Data
        : Array.isArray(result?.data)
          ? result.data
          : [];

    const summary = records.map((item: any) => ({
      Consecutivo: item.Consecutivo ?? null,
      Fecha_preinscripcion: item.Fecha_preinscripcion ?? null,
      Programas: item.Programas ?? null,
    }));

    return NextResponse.json({
      ok: true,
      periodo: 240,
      cantidad: records.length,
      preinscripciones: summary,
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