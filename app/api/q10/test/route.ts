import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createQ10Preinscription } from "@/app/lib/q10";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseServiceKey) {
  throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
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

export async function GET() {
  try {
    // ==========================================
    // PRUEBA CONTROLADA: SOLO ORDEN 88
    // ==========================================

    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", 88)
        .single();

    if (orderError || !order) {
      throw new Error(
        `No encontramos la orden 88: ${
          orderError?.message || "sin datos"
        }`
      );
    }

    if (order.payment_status !== "paid") {
      throw new Error(
        "La orden 88 no figura como pagada."
      );
    }

    // Evitar una segunda creación
    if (order.q10_status === "preinscribed") {
      return NextResponse.json({
        ok: true,
        alreadyProcessed: true,
        orderId: 88,
        q10Status: "preinscribed",
        q10Response:
          order.q10_enrollment_response,
      });
    }

    // Solo permitimos ejecutar esta prueba
    // desde estados recuperables.
    if (
      ![
        "pending",
        "error",
        "pending_mapping",
      ].includes(order.q10_status)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            `La orden 88 tiene estado Q10 "${order.q10_status}" y no será procesada.`,
        },
        { status: 409 }
      );
    }

    const { data: course, error: courseError } =
      await supabaseAdmin
        .from("courses")
        .select(
          `
          id,
          name,
          q10_program_code,
          q10_period_id,
          q10_site_journey_id
          `
        )
        .eq("id", order.course_id)
        .single();

    if (courseError || !course) {
      throw new Error(
        `No encontramos el curso: ${
          courseError?.message || "sin datos"
        }`
      );
    }

    if (
      !course.q10_program_code ||
      course.q10_period_id === null ||
      course.q10_period_id === undefined ||
      course.q10_site_journey_id === null ||
      course.q10_site_journey_id === undefined
    ) {
      throw new Error(
        "El curso todavía no tiene el mapeo Q10 completo."
      );
    }

    // ==========================================
    // BLOQUEAR LA ORDEN ANTES DE ENVIAR A Q10
    // ==========================================

    const {
      data: lockedOrders,
      error: lockError,
    } = await supabaseAdmin
      .from("orders")
      .update({
        q10_status: "processing",
      })
      .eq("id", 88)
      .in("q10_status", [
        "pending",
        "error",
        "pending_mapping",
      ])
      .select("id");

    if (lockError) {
      throw new Error(
        `No pudimos bloquear la orden: ${lockError.message}`
      );
    }

    if (
      !lockedOrders ||
      lockedOrders.length === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "La orden ya está siendo procesada o cambió de estado.",
        },
        { status: 409 }
      );
    }

    const nombres =
      separarNombres(order.first_name || "");

    const apellidos =
      separarApellidos(order.last_name || "");

    const fechaPreinscripcion =
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date());

    const payload = {
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
        String(order.document_number),

      Genero:
        order.gender || undefined,

      Fecha_nacimiento:
        order.birth_date || undefined,

      Telefono:
        order.phone || undefined,

      Celular:
        order.phone || undefined,

      Email:
        order.email,

      Direccion:
        order.address || undefined,

      Lugar_residencia:
        getQ10ResidenceCode(
          order.city_name
        ),

      Codigo_programa:
        String(course.q10_program_code),

      Consecutivo_periodo:
        Number(course.q10_period_id),

      Consecutivo_sedejornada:
        Number(
          course.q10_site_journey_id
        ),
    };

    // ==========================================
    // ENVÍO REAL A Q10
    // ==========================================

    try {
      const q10Response =
        await createQ10Preinscription(payload);

      const { error: updateError } =
        await supabaseAdmin
          .from("orders")
          .update({
            q10_status: "preinscribed",
            q10_enrollment_response:
              q10Response,
          })
          .eq("id", 88);

      if (updateError) {
        throw new Error(
          `Q10 creó la preinscripción, pero Supabase no pudo guardar la respuesta: ${updateError.message}`
        );
      }

      return NextResponse.json({
        ok: true,
        orderId: 88,
        q10Status: "preinscribed",
        q10Response,
      });
    } catch (q10Error) {
      const message =
        q10Error instanceof Error
          ? q10Error.message
          : "Error desconocido Q10";

      await supabaseAdmin
        .from("orders")
        .update({
          q10_status: "error",
          q10_enrollment_response: {
            error: message,
          },
        })
        .eq("id", 88);

      return NextResponse.json(
        {
          ok: false,
          orderId: 88,
          q10Status: "error",
          error: message,
        },
        { status: 500 }
      );
    }
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