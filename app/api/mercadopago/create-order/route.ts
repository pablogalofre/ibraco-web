import {packageSale} from '@/app/lib/packages-server';
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const mercadoPagoAccessToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN;

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

    // ==========================================
    // 1. BUSCAR EL PEDIDO REAL EN SUPABASE
    // ==========================================

    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("order_number", orderNumber)
        .single();

    if (orderError || !order) {
      console.error(
        "ORDER LOOKUP ERROR:",
        orderError
      );

      return NextResponse.json(
        {
          error: "No encontramos el pedido.",
        },
        {
          status: 404,
        }
      );
    }

    let packageContext: Awaited<ReturnType<typeof packageSale>> | null = null;
    if (order.product_type === 'package') {
      packageContext = await packageSale(order.order_number,body.packageToken);
      const s=packageContext.sale;
      if(s.eligibility!=='approved') return NextResponse.json({error:'La reserva requiere validación de IBRACO antes del pago'},{status:409});
      if(Date.now()>=Date.parse(s.pay_until)) return NextResponse.json({error:'El plazo de pago terminó'},{status:409});
      if(['paid','refunded'].includes(order.payment_status)) return NextResponse.json({error:'Este pedido ya tiene un pago confirmado o en revisión'},{status:409});
      if(s.checkout_url) return NextResponse.json({checkoutUrl:s.checkout_url});
    }

    // ==========================================
    // 2. DEFINIR TIPO DE PRODUCTO
    // ==========================================

    const productType =
      order.product_type === "event"
        ? "event"
        : order.product_type === "package" ? "package" : "course";

    // ==========================================
    // 3. TOMAR LOS VALORES SIEMPRE DESDE SUPABASE
    // ==========================================

    const amount = Number(order.amount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "El pedido no tiene un valor válido para Mercado Pago.",
        },
        {
          status: 400,
        }
      );
    }

    const quantity =
      productType === "event"
        ? Math.max(
            1,
            Math.floor(
              Number(order.quantity) || 1
            )
          )
        : 1;

    const unitPrice =
      productType === "event"
        ? Number(order.unit_price)
        : amount;

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "El pedido no tiene un precio unitario válido.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Verificación de consistencia:
      para eventos, el total guardado debe ser
      cantidad × precio unitario.
    */
    if (productType === "event") {
      const expectedAmount =
        unitPrice * quantity;

      if (
        Math.round(expectedAmount) !==
        Math.round(amount)
      ) {
        console.error(
          "EVENT ORDER AMOUNT MISMATCH:",
          {
            orderNumber:
              order.order_number,
            quantity,
            unitPrice,
            amount,
            expectedAmount,
          }
        );

        return NextResponse.json(
          {
            error:
              "El valor total del evento no coincide con la cantidad de entradas.",
          },
          {
            status: 409,
          }
        );
      }
    }

    /*
      Mercado Pago Orders API espera los montos
      como string. En COP usamos valores enteros.
    */
    const amountString =
      Math.round(amount).toString();

    const unitPriceString =
      Math.round(unitPrice).toString();

    // ==========================================
    // 4. TÍTULO Y URLs SEGÚN EL PRODUCTO
    // ==========================================

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://ibraco-web.vercel.app";

    const title =
      productType === "event"
        ? String(
            order.event_name ||
              "Evento IBRACO"
          ).trim()
        : `${order.course_name || "Curso IBRACO"} ${
            order.cycle || ""
          }`.trim();

    const successUrl =
      productType === "package" ? `${baseUrl}/promociones/reserva?pedido=${encodeURIComponent(order.order_number)}` : productType === "event"
        ? `${baseUrl}/eventos/pago/exito`
        : `${baseUrl}/matricula/pago/exito`;

    const failureUrl =
      productType === "package" ? `${baseUrl}/promociones/reserva?pedido=${encodeURIComponent(order.order_number)}` : productType === "event"
        ? `${baseUrl}/eventos/pago/error`
        : `${baseUrl}/matricula/pago/error`;

    const pendingUrl =
      productType === "package" ? `${baseUrl}/promociones/reserva?pedido=${encodeURIComponent(order.order_number)}` : productType === "event"
        ? `${baseUrl}/eventos/pago/pendiente`
        : `${baseUrl}/matricula/pago/pendiente`;

    // ==========================================
    // 5. PAYLOAD MERCADO PAGO
    // ==========================================

    const mercadoPagoPayload = {
      type: "online",
      processing_mode: "manual",

      total_amount: amountString,

      external_reference:
        order.order_number,

      description: title,

      payer: {
        email: order.email,
      },

      /*
        Para cursos:
        quantity = 1
        unit_price = total del curso

        Para eventos:
        quantity = entradas
        unit_price = precio por persona

        El total_amount sigue siendo siempre
        el total real guardado en orders.amount.
      */
      items: [
        {
          title,
          quantity,
          unit_price: unitPriceString,
        },
      ],

      config: {
        online: {
          success_url: successUrl,
          failure_url: failureUrl,
          pending_url: pendingUrl,
          auto_return: "all",
        },
      },
    };

    // ==========================================
    // 6. CREAR ORDEN EN MERCADO PAGO
    // ==========================================

    const mercadoPagoResponse =
      await fetch(
        "https://api.mercadopago.com/v1/orders",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${mercadoPagoAccessToken}`,

            "Content-Type":
              "application/json",

            Accept:
              "application/json",

            "X-Idempotency-Key":
              productType === "package" ? order.order_number.replace("IBR-P-", "") : randomUUID(),
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

          details:
            mercadoPagoResult,
        },
        {
          status:
            mercadoPagoResponse.status,
        }
      );
    }

    // ==========================================
    // 7. OBTENER URL DE CHECKOUT
    // ==========================================

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

          details:
            mercadoPagoResult,
        },
        {
          status: 500,
        }
      );
    }

    if (packageContext) {
      const saved=await supabaseAdmin.from('package_sales').update({mp_order_id:String(mercadoPagoResult.id),checkout_url:checkoutUrl}).eq('order_id',order.id);
      if(saved.error) return NextResponse.json({error:'No fue posible registrar la referencia. Reintenta el pago desde tu reserva.'},{status:503});
    }
    // ==========================================
    // 8. GUARDAR REFERENCIA DE MERCADO PAGO
    // ==========================================

    const { error: updateError } =
      await supabaseAdmin
        .from("orders")
        .update({
          payment_provider:
            "mercadopago",

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
        La orden en Mercado Pago ya existe
        y todavía queremos permitir el pago.
      */
    }

    // ==========================================
    // 9. DEVOLVER CHECKOUT AL FRONTEND
    // ==========================================

    return NextResponse.json({
      success: true,

      productType,

      quantity,

      unitPrice,

      amount,

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

