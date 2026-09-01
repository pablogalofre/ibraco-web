import { NextResponse } from "next/server";

export async function GET() {
  const subscriptionKey = process.env.Q10_SUBSCRIPTION_KEY;

  if (!subscriptionKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Falta Q10_SUBSCRIPTION_KEY",
      },
      { status: 500 }
    );
  }

  try {
    const url = new URL(
      "https://api.q10.com/v1/administrativos"
    );

    url.searchParams.set("Limit", "1");
    url.searchParams.set("Offset", "0");

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        "Api-key": subscriptionKey,
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

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