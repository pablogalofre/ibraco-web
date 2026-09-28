import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    // SOLO ORDEN 88
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

    // IMPORTANTE:
    // NO SE ENVÍA NADA A Q10.
    // SOLO MOSTRAMOS LO QUE SE ENVIARÍA.

    return NextResponse.json({
      ok: true,
      dryRun: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        payment_status:
          order.payment_status,
        q10_status:
          order.q10_status,
      },
      course: {
        id: course.id,
        name: course.name,
      },
      payload,
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
      {
        status: 500,
      }
    );
  }
}