import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const mercadoPagoAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!supabaseUrl) {
  throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseServiceKey) {
  throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
}

if (!mercadoPagoAccessToken) {
  throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN");
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("MERCADO PAGO WEBHOOK:", body);

    const mercadoPagoOrderId =
      body?.data?.id ||
      body?.id;

    if (!mercadoPagoOrderId) {
      return NextResponse.json({
        received: true,
      });
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/orders/${mercadoPagoOrderId}`,
      {
        headers: {
          Authorization: `Bearer ${mercadoPagoAccessToken}`,
          Accept: "application/json",
        },
      }
    );

    const mpOrder = await response.json();

    if (!response.ok) {
      console.error(
        "ERROR CONSULTANDO ORDER MP:",
        mpOrder
      );

      return NextResponse.json(
        {
          error:
            "No fue posible consultar la orden en Mercado Pago.",
        },
        {
          status: 500,
        }
      );
    }

    const externalReference =
      mpOrder.external_reference;

    if (!externalReference) {
      console.error(
        "ORDER MP SIN EXTERNAL REFERENCE:",
        mpOrder
      );

      return NextResponse.json({
        received: true,
      });
    }

    const mpStatus =
      mpOrder.status || "unknown";

    let paymentStatus = "pending";
    let orderStatus = "pending";

    if (
      mpStatus === "processed" ||
      mpStatus === "approved"
    ) {
      paymentStatus = "paid";
      orderStatus = "paid";
    }

    if (
      mpStatus === "failed" ||
      mpStatus === "cancelled" ||
      mpStatus === "rejected"
    ) {
      paymentStatus = "failed";
      orderStatus = "payment_failed";
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: paymentStatus,
        order_status: orderStatus,
        payment_reference:
          mercadoPagoOrderId,
      })
      .eq(
        "order_number",
        externalReference
      );

    if (error) {
      console.error(
        "ERROR ACTUALIZANDO ORDER:",
        error
      );

      return NextResponse.json(
        {
          error:
            "No fue posible actualizar el pedido.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Error procesando webhook.",
      },
      {
        status: 500,
      }
    );
  }
}