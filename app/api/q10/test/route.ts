import { NextResponse } from "next/server";
import { getQ10Preinscriptions } from "../../../lib/q10";

export async function GET() {
  try {
    const periodo = 242;
    const consecutivoBuscado = 12321;

    const resultado = await getQ10Preinscriptions(
      periodo,
      100,
      1
    );

    const registros = Array.isArray(resultado)
      ? resultado
      : Array.isArray(resultado?.Data)
      ? resultado.Data
      : Array.isArray(resultado?.data)
      ? resultado.data
      : [];

    const encontrado = registros.find(
      (registro: any) =>
        Number(registro?.Consecutivo) === consecutivoBuscado
    );

    return NextResponse.json({
      ok: true,
      periodo,
      consecutivoBuscado,
      totalRecibidos: registros.length,
      encontrado: encontrado ?? null,
    });
  } catch (error) {
    console.error("ERROR CONSULTANDO PREINSCRIPCIONES Q10:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Error consultando Q10",
      },
      { status: 500 }
    );
  }
}