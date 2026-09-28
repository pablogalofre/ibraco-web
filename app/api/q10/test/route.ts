import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      message: "Endpoint de prueba deshabilitado.",
    },
    {
      status: 410,
    }
  );
}