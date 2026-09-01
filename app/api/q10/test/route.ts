import { NextResponse } from "next/server";
import { getQ10Programs } from "@/app/lib/q10";

export async function GET() {
  try {
    const result = await getQ10Programs(100, 1);

    const records = Array.isArray(result)
      ? result
      : Array.isArray(result?.Data)
        ? result.Data
        : Array.isArray(result?.data)
          ? result.data
          : [];

    const summary = records.map((item: any) => ({
      Codigo: item.Codigo ?? item.Codigo_programa ?? null,
      Nombre: item.Nombre ?? item.Nombre_programa ?? null,
      Estado: item.Estado ?? null,
      Aplica_preinscripciones:
        item.Aplica_preinscripciones ??
        item.Aplica_para_preinscripciones ??
        null,
    }));

    return NextResponse.json({
      ok: true,
      cantidad: records.length,
      programas: summary,
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