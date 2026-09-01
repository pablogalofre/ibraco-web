import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createQ10Preinscription } from "@/app/lib/q10";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const mercadoPagoAccessToken =
  process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!supabaseUrl) {
  throw new Error(
    "Falta NEXT_PUBLIC_SUPABASE_URL"
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    "Falta SUPABASE_SERVICE_ROLE_KEY"
  );
}

if (!mercadoPagoAccessToken) {
  throw new Error(
    "Falta MERCADOPAGO_ACCESS_TOKEN"
  );
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

function separarNombres(nombreCompleto: string) {
  const partes = nombreCompleto
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    primero: partes[0] || "",
    segundo:
      partes.length > 1
        ? partes.slice(1).join(" ")
        : undefined,
  };
}

function separarApellidos(apellidoCompleto: string) {
  const partes = apellidoCompleto
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    primero: partes[0] || "",
    segundo:
      partes.length > 1
        ? partes.slice(1).join(" ")
        : undefined,
  };
}

function esIntensivoCiclo6(order: any) {
  const nombre = String(
    order.course_name || ""
  ).toLowerCase();

  const ciclo = String(
    order.cycle || ""
  ).toLowerCase();

  return (
    nombre.includes("intensivo") &&
    !nombre.includes("semi") &&
    (
      ciclo.includes("6") ||
      nombre.includes("ciclo 6")
    )
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log(
      "MERCADO PAGO WEBHOOK:",
      body
    );

    const mercadoPagoOrderId =
      body?.data?.id ||
      body?.id;

    if (!mercadoPagoOrderId) {
      return NextResponse.json({
        received: true,
      });
    }

    // ==========================================
    // 1. CONSULTAR ORDEN REAL EN MERCADO PAGO
    // ==========================================

    const response = await fetch(
      `https://api.mercadopago.com/v1/orders/${mercadoPagoOrderId}`,
      {
        headers: {
          Authorization:
            `Bearer ${mercadoPagoAccessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    const mpOrder =
      await response.json();

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

    // ==========================================
    // 2. DETERMINAR ESTADO DEL PAGO
    // ==========================================

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

    // ==========================================
    // 3. ACTUALIZAR PAGO EN SUPABASE
    // ==========================================

    const { error: paymentUpdateError } =
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status:
            paymentStatus,

          order_status:
            orderStatus,

          payment_reference:
            String(
              mercadoPagoOrderId
            ),
        })
        .eq(
          "order_number",
          externalReference
        );

    if (paymentUpdateError) {
      console.error(
        "ERROR ACTUALIZANDO ORDER:",
        paymentUpdateError
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

    // Si todavía no está pagado,
    // no hacemos nada en Q10.

    if (paymentStatus !== "paid") {
      return NextResponse.json({
        received: true,
        paymentStatus,
      });
    }

    // ==========================================
    // 4. BUSCAR PEDIDO COMPLETO EN SUPABASE
    // ==========================================

    const {
      data: order,
      error: orderError,
    } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq(
        "order_number",
        externalReference
      )
      .single();

    if (orderError || !order) {
      console.error(
        "NO SE ENCONTRÓ ORDER:",
        orderError
      );

      return NextResponse.json(
        {
          error:
            "Pago recibido, pero no encontramos el pedido.",
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // 5. EVITAR PREINSCRIPCIÓN DUPLICADA
    // ==========================================

    if (
      order.q10_status ===
      "preinscribed"
    ) {
      console.log(
        "Q10 YA PROCESADO:",
        externalReference
      );

      return NextResponse.json({
        received: true,
        paymentStatus: "paid",
        q10Status: "preinscribed",
      });
    }

    if (
      order.q10_status ===
      "processing"
    ) {
      console.log(
        "Q10 YA ESTÁ EN PROCESO:",
        externalReference
      );

      return NextResponse.json({
        received: true,
        paymentStatus: "paid",
        q10Status: "processing",
      });
    }

    // ==========================================
    // 6. SOLO ACTIVAMOS EL MAPEO
    //    YA VERIFICADO EN Q10
    // ==========================================

    if (!esIntensivoCiclo6(order)) {
      console.log(
        "CURSO SIN MAPEO Q10 AUTOMÁTICO:",
        {
          course:
            order.course_name,
          cycle:
            order.cycle,
        }
      );

      await supabaseAdmin
        .from("orders")
        .update({
          q10_status:
            "pending_mapping",
        })
        .eq(
          "order_number",
          externalReference
        );

      return NextResponse.json({
        received: true,
        paymentStatus: "paid",
        q10Status:
          "pending_mapping",
      });
    }

    // ==========================================
    // 7. MARCAR COMO PROCESSING
    // ==========================================

    const {
      error:
        processingError,
    } = await supabaseAdmin
      .from("orders")
      .update({
        q10_status:
          "processing",
      })
      .eq(
        "order_number",
        externalReference
      );

    if (processingError) {
      console.error(
        "ERROR MARCANDO Q10 PROCESSING:",
        processingError
      );

      return NextResponse.json(
        {
          error:
            "No fue posible preparar la preinscripción Q10.",
        },
        {
          status: 500,
        }
      );
    }

    // ==========================================
    // 8. PREPARAR DATOS DEL ESTUDIANTE
    // ==========================================

    const nombres =
      separarNombres(
        order.first_name || ""
      );

    const apellidos =
      separarApellidos(
        order.last_name || ""
      );

    const fechaPreinscripcion =
      new Date()
        .toISOString()
        .slice(0, 10);

    // ==========================================
    // 9. CREAR PREINSCRIPCIÓN EN Q10
    //
    // Mapeo verificado:
    //
    // Programa 01:
    // Portugués Intensivo
    //
    // Periodo 237:
    // 2026 Intensivo Ciclo 6
    //
    // Sede/Jornada 14:
    // Principal / Continua
    // ==========================================

    try {
      const q10Response =
        await createQ10Preinscription({
          Fecha_preinscripcion:
            fechaPreinscripcion,

          Primer_nombre:
            nombres.primero,

          Segundo_nombre:
            nombres.segundo,

          Primer_apellido:
            apellidos.primero,

          Segundo_apellido:
            apellidos.segundo,

          Codigo_tipo_identificacion:
            order.document_type,

          Numero_identificacion:
            String(
              order.document_number
            ),

          Genero:
            order.gender ||
            undefined,

          Fecha_nacimiento:
            order.birth_date ||
            undefined,

          Celular:
            order.phone ||
            undefined,

          Email:
            order.email,

          Direccion:
            order.address ||
            undefined,

          Codigo_programa:
            "01",

          Consecutivo_periodo:
            237,

          Consecutivo_sedejornada:
            14,
        });

      console.log(
        "Q10 PREINSCRIPCIÓN EXITOSA:",
        q10Response
      );

      // ========================================
      // 10. GUARDAR RESULTADO Q10
      // ========================================

      const {
        error:
          q10UpdateError,
      } = await supabaseAdmin
        .from("orders")
        .update({
          q10_status:
            "preinscribed",

          q10_enrollment_response:
            q10Response,
        })
        .eq(
          "order_number",
          externalReference
        );

      if (q10UpdateError) {
        console.error(
          "Q10 CREADO PERO ERROR GUARDANDO RESPUESTA:",
          q10UpdateError
        );
      }

      return NextResponse.json({
        received: true,
        paymentStatus: "paid",
        q10Status:
          "preinscribed",
      });
    } catch (q10Error) {
      console.error(
        "ERROR CREANDO PREINSCRIPCIÓN Q10:",
        q10Error
      );

      await supabaseAdmin
        .from("orders")
        .update({
          q10_status:
            "error",
        })
        .eq(
          "order_number",
          externalReference
        );

      return NextResponse.json(
        {
          error:
            "El pago fue aprobado, pero Q10 rechazó la preinscripción.",

          details:
            q10Error instanceof Error
              ? q10Error.message
              : "Error desconocido Q10",
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error(
      "WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error procesando webhook.",
      },
      {
        status: 500,
      }
    );
  }
}