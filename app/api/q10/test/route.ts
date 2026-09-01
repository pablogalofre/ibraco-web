import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.Q10_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Falta Q10_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://api.q10.com/v1/estudiantes/1000000000",
      {
        method: "GET",
        headers: {
          "Api-Key": apiKey,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const text = await response.text();

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      q10Response: text,
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