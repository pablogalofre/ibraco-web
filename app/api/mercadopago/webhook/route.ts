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

function separarNombres(nombreCompleto: string) {
  const partes = String(nombreCompleto || "")
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
  const partes = String(apellidoCompleto || "")
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

function getQ10DocumentType(documentType: string) {
  const type = String(documentType || "")
    .trim()
    .toUpperCase();

  // Confirmado con API Q10
  if (type === "CC") {
    return "1";
  }

  throw new Error(
    `Tipo de identificación sin mapeo Q10: ${type}`
  );
}

function getQ10ResidenceCode(cityName: string) {
  const city = String(cityName || "")
    .trim()
    .toLowerCase();

  // Confirmado con API Q10
  if (
    city === "bogotá" ||
    city === "bogota" ||
    city.includes("bogotá") ||
    city.includes("bogota")
  ) {
    return "11001";
  }

  throw new Error(
    `Ciudad sin mapeo Q10: ${cityName}`
  );
}

async function getCourseForOrder(order: any) {
  if (order.course_id) {
    const {
      data: courseById,
      error: courseByIdError,
    } = await supabaseAdmin
      .from("courses")
      .select(
        `
        id,
        slug,
        name,
        cycle,
        campus,
        modality,
        q10_program_code,
        q10_period_id,
        q10_site_journey_id
        `
      )
      .eq("id", order.course_id)
      .maybeSingle();

    if (courseByIdError) {
      throw courseByIdError;
    }

    if (courseById) {
      return courseById;
    }
  }

  if (order.course_slug) {
    const {
      data: courseBySlug,
      error: courseBySlugError,
    } = await supabaseAdmin
      .from("courses")
      .select(
        `
        id,
        slug,
        name,
        cycle,
        campus,
        modality,
        q10_program_code,
        q10_period_id,
        q10_site_journey_id
        `
      )
      .eq("slug", order.course_slug)
      .maybeSingle();

    if (courseBySlugError) {
      throw courseBySlugError;
    }

    if (courseBySlug) {
      return courseBySlug;
    }
  }

  return null;
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
    // 1. CONSULTAR LA ORDEN REAL EN MERCADO PAGO
    // ==========================================

    const response = await fetch(
      `https://api.mercadopago.com/v1/orders/${mercadoPagoOrderId}`,
      {
        method: "GET",
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

    const {
      error: paymentUpdateError,
    } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status:
          paymentStatus,

        order_status:
          orderStatus,

        payment_reference:
          String(mercadoPagoOrderId),
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

    // ==========================================
    // 4. SI NO ESTÁ PAGADO, NO TOCAR Q10
    // ==========================================

    if (paymentStatus !== "paid") {
      return NextResponse.json({
        received: true,
        paymentStatus,
      });
    }

    // ==========================================
    // 5. BUSCAR PEDIDO COMPLETO
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
    // EVENTOS: QUEDAN PAGADOS Y NO PASAN A Q10
    // ==========================================

    if (order.product_type === "event") {
      console.log(
        "EVENTO PAGADO - NO SE ENVÍA A Q10:",
        {
          order: externalReference,
          event_id: order.event_id,
          event_name: order.event_name,
          quantity: order.quantity,
          amount: order.amount,
        }
      );

      const { error: eventQ10StatusError } =
        await supabaseAdmin
          .from("orders")
          .update({
            q10_status: "not_applicable",
          })
          .eq(
            "order_number",
            externalReference
          );

      if (eventQ10StatusError) {
        console.error(
          "EVENTO PAGADO PERO ERROR MARCANDO Q10 COMO NO APLICABLE:",
          eventQ10StatusError
        );

        return NextResponse.json(
          {
            error:
              "El pago del evento fue aprobado, pero no fue posible finalizar su registro interno.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        received: true,
        paymentStatus: "paid",
        productType: "event",
        q10Status: "not_applicable",
      });
    }

    // ==========================================
    // 6. EVITAR DUPLICADOS
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
        q10Status:
          "preinscribed",
      });
    }

    // ==========================================
    // 7. BUSCAR CONFIGURACIÓN Q10 DEL CURSO
    // ==========================================

    let course;

    try {
      course =
        await getCourseForOrder(order);
    } catch (courseError) {
      console.error(
        "ERROR BUSCANDO CURSO:",
        courseError
      );

      return NextResponse.json(
        {
          error:
            "Pago aprobado, pero no fue posible consultar la configuración del curso.",
        },
        {
          status: 500,
        }
      );
    }

    if (!course) {
      console.error(
        "CURSO NO ENCONTRADO PARA ORDER:",
        {
          course_id:
            order.course_id,
          course_slug:
            order.course_slug,
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
        reason:
          "course_not_found",
      });
    }

    // ==========================================
    // 8. VERIFICAR SI EL CURSO TIENE MAPEO Q10
    // ==========================================

    const q10ProgramCode =
      course.q10_program_code;

    const q10PeriodId =
      course.q10_period_id;

    const q10SiteJourneyId =
      course.q10_site_journey_id;

    const hasQ10Mapping =
      Boolean(q10ProgramCode) &&
      q10PeriodId !== null &&
      q10PeriodId !== undefined &&
      q10SiteJourneyId !== null &&
      q10SiteJourneyId !== undefined;

    if (!hasQ10Mapping) {
      console.log(
        "CURSO VENDIDO SIN MAPEO Q10:",
        {
          course_id:
            course.id,
          course:
            course.name,
          cycle:
            course.cycle,
          campus:
            course.campus,
          modality:
            course.modality,
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

      // IMPORTANTE:
      // La compra queda pagada.
      // No rompemos la tienda si Q10 todavía
      // no tiene creada esa oferta académica.
      return NextResponse.json({
        received: true,
        paymentStatus: "paid",
        q10Status:
          "pending_mapping",
        reason:
          "course_without_q10_mapping",
      });
    }

    // ==========================================
    // 9. BLOQUEO CONTRA WEBHOOKS DUPLICADOS
    // ==========================================

    const {
      data: lockedOrders,
      error: processingError,
    } = await supabaseAdmin
      .from("orders")
      .update({
        q10_status:
          "processing",
      })
      .eq(
        "order_number",
        externalReference
      )
      .in(
        "q10_status",
        [
          "pending",
          "error",
          "pending_mapping",
        ]
      )
      .select("order_number");

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

    if (
      !lockedOrders ||
      lockedOrders.length === 0
    ) {
      console.log(
        "Q10 YA ESTÁ SIENDO PROCESADO:",
        externalReference
      );

      return NextResponse.json({
        received: true,
        paymentStatus: "paid",
        q10Status:
          order.q10_status,
      });
    }

    // ==========================================
    // 10. PREPARAR DATOS DEL ESTUDIANTE
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
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "America/Bogota",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      ).format(new Date());

    // ==========================================
    // 11. CREAR PREINSCRIPCIÓN EN Q10
    //
    // EL MAPEO YA NO ESTÁ QUEMADO AQUÍ.
    // VIENE DEL CURSO EN SUPABASE:
    //
    // q10_program_code
    // q10_period_id
    // q10_site_journey_id
    // ==========================================

    try {
      const q10Response =
        await createQ10Preinscription(
          {
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
              getQ10DocumentType(
                order.document_type
              ),

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

            Telefono:
              order.phone ||
              undefined,

            Celular:
              order.phone ||
              undefined,

            Email:
              order.email,

            Direccion:
              order.address ||
              undefined,

            Lugar_residencia:
              getQ10ResidenceCode(
                order.city_name
              ),

            Codigo_programa:
              String(q10ProgramCode),

            Consecutivo_periodo:
              Number(q10PeriodId),

            Consecutivo_sedejornada:
              Number(
                q10SiteJourneyId
              ),
          }
        );

      console.log(
        "Q10 PREINSCRIPCIÓN EXITOSA:",
        {
          order:
            externalReference,
          course:
            course.name,
          q10ProgramCode,
          q10PeriodId,
          q10SiteJourneyId,
          response:
            q10Response,
        }
      );

      // ========================================
      // 12. GUARDAR RESPUESTA DE Q10
      // ========================================

      const {
        error: q10UpdateError,
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

        return NextResponse.json(
          {
            error:
              "Q10 creó la preinscripción, pero no fue posible guardar la respuesta.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        received: true,
        paymentStatus:
          "paid",
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

          q10_enrollment_response:
            {
              error:
                q10Error instanceof Error
                  ? q10Error.message
                  : "Error desconocido Q10",
            },
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