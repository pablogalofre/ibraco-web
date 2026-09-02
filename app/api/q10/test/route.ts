import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.Q10_API_KEY;

    if (!apiKey) {
      throw new Error("Falta Q10_API_KEY");
    }

    const posiblesEndpoints = [
      "https://api.q10.com/v1/tiposidentificacion",
      "https://api.q10.com/v1/tipos-identificacion",
      "https://api.q10.com/v1/tiposidentificaciones",
    ];

    const resultados = [];

    for (const url of posiblesEndpoints) {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Api-Key": apiKey,
          "Ocp-Apim-Subscription-Key": apiKey,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const text = await response.text();

      resultados.push({
        url,
        status: response.status,
        respuesta: text,
      });
    }

    return NextResponse.json({
      ok: true,
      resultados,
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