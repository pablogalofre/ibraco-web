import { NextResponse } from "next/server";

export async function GET() {
  const subscriptionKey = process.env.Q10_SUBSCRIPTION_KEY;

  if (!subscriptionKey) {
    return NextResponse.json(
      { ok: false, error: "Falta Q10_SUBSCRIPTION_KEY" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://api.q10.com/v1/administrativos?Limit=1&Offset=0",
      {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": subscriptionKey,
          Accept: "application/json",
        },
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
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}