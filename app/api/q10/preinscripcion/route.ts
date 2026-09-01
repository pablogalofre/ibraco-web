import { NextResponse } from "next/server";
import { createQ10Preinscription } from "@/app/lib/q10";

export async function POST(request: Request) {
  const secret = request.headers.get("x-q10-test-secret");

  if (
    !process.env.Q10_TEST_SECRET ||
    secret !== process.env.Q10_TEST_SECRET
  ) {
    return NextResponse.json(
      { ok: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const result = await createQ10Preinscription(body);

    return NextResponse.json({
      ok: true,
      q10Response: result,
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