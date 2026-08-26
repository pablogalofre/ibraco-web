import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

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

    const { orderNumber } = body;

    if (!orderNumber) {
      return NextResponse.json(
        {
          error: "Falta el número del pedido.",
        },
        {
          status: 400,
        }
      );
    }

    // 1. Buscar el pedido real en Supabase
    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .single();

    if (orderError || !order) {
      console.error("ORDER LOOKUP ERROR:", orderError);

      return NextResponse.json(
        {
          error: "No encontramos el pedido.",
        },
        {
          status: 404,
        }
      );
    }

    // 2. Tomar siempre el precio desde Supabase
    const amount = Number(order.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          error: "El pedido no tiene un valor válido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Mercado Pago Orders API espera montos como string.
      En COP usamos el valor entero, por ejemplo:
      "1364000"
    */
    const amountString = Math.round(amount).toString();

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://ibraco-web.vercel.app";

    const title =
      `${order.course_name || "Curso IBRACO"} ${
        order.cycle || ""
      }`.trim();

    // 3. Payload de Checkout Pro / Orders API
    const mercadoPagoPayload = {
      type: "online",
      processing_mode: "manual",

      total_amount: amountString,

      external_reference: order.order_number,

      description: title,

      payer: {
        email: order.email,
      },

      /*
        Dejamos solamente los campos mínimos del item.
        En nuestra prueba Mercado Pago rechazó
        unit_measure y total_amount dentro del item,
        así que por ahora no los enviamos.
      */
      items: [
        {
          title,
          quantity: 1,
          unit_price: amountString,
        },
      ],

      config: {
          

        online: {
          success_url:
            `${baseUrl}/matricula/pago/exito`,

          failure_url:
            `${baseUrl}/matricula/pago/error`,

          pending_url:
            `${baseUrl}/matricula/pago/pendiente`,

          auto_return: "all",
        },
      },
    };

    // 4. Crear orden en Mercado Pago
    const mercadoPagoResponse = await fetch(
      "https://api.mercadopago.com/v1/orders",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${mercadoPagoAccessToken}`,

          "Content-Type": "application/json",

          Accept: "application/json",

          "X-Idempotency-Key": randomUUID(),
        },

        body: JSON.stringify(
          mercadoPagoPayload
        ),
      }
    );

    const mercadoPagoResult =
      await mercadoPagoResponse.json();

    if (!mercadoPagoResponse.ok) {
      console.error(
        "MERCADO PAGO ERROR:",
        JSON.stringify(
          mercadoPagoResult,
          null,
          2
        )
      );

      return NextResponse.json(
        {
          error:
            mercadoPagoResult?.message ||
            "Mercado Pago no pudo crear la orden.",

          details: mercadoPagoResult,
        },
        {
          status: mercadoPagoResponse.status,
        }
      );
    }

    // 5. Mercado Pago debe devolver checkout_url
    const checkoutUrl =
      mercadoPagoResult.checkout_url;

    if (!checkoutUrl) {
      console.error(
        "MERCADO PAGO RESPONSE WITHOUT CHECKOUT_URL:",
        mercadoPagoResult
      );

      return NextResponse.json(
        {
          error:
            "Mercado Pago creó la orden pero no devolvió checkout_url.",
          details: mercadoPagoResult,
        },
        {
          status: 500,
        }
      );
    }

    // 6. Guardar referencia de Mercado Pago en nuestro pedido
    const { error: updateError } =
      await supabaseAdmin
        .from("orders")
        .update({
          payment_provider: "mercadopago",
          payment_reference:
            mercadoPagoResult.id,
        })
        .eq(
          "order_number",
          order.order_number
        );

    if (updateError) {
      console.error(
        "ORDER UPDATE ERROR:",
        updateError
      );

      /*
        No detenemos el checkout.
        La orden de Mercado Pago ya fue creada.
      */
    }

    // 7. Devolver checkout al frontend
    return NextResponse.json({
      success: true,

      mercadoPagoOrderId:
        mercadoPagoResult.id,

      checkoutUrl,
    });
  } catch (error) {
    console.error(
      "CREATE MERCADO PAGO ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error inesperado creando el pago.",
      },
      {
        status: 500,
      }
    );
  }
}