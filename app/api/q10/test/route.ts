import { NextResponse } from "next/server";
import { getQ10Periods } from "@/app/lib/q10";

export async function GET() {
  try {
    const periods = await getQ10Periods(100, 1);

    return NextResponse.json({
      ok: true,
      periods,
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