import { NextResponse } from "next/server";
import { getQ10SitesJourneys } from "@/app/lib/q10";

export async function GET() {
  try {
    const result = await getQ10SitesJourneys(100, 1);

    const records = Array.isArray(result)
      ? result
      : Array.isArray(result?.Data)
        ? result.Data
        : Array.isArray(result?.data)
          ? result.data
          : [];

    const summary = records.map((item: any) => ({
      Consecutivo:
        item.Consecutivo ??
        item.Consecutivo_sedejornada ??
        null,
      Sede:
        item.Sede ??
        item.Nombre_sede ??
        null,
      Jornada:
        item.Jornada ??
        item.Nombre_jornada ??
        null,
      Nombre:
        item.Nombre ??
        item.Nombre_sedejornada ??
        null,
      Estado:
        item.Estado ?? null,
    }));

    return NextResponse.json({
      ok: true,
      cantidad: records.length,
      sedesJornadas: summary,
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