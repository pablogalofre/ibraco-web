import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Falta NEXT_PUBLIC_SUPABASE_URL en .env.local"
  );
}

if (!supabaseServiceKey) {
  throw new Error(
    "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local"
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

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function cleanEmail(value: unknown) {
  return cleanText(value).toLowerCase();
}

async function createCourseOrder(body: any) {
  const { course, student } = body;

  if (!course?.id || !course?.slug) {
    return NextResponse.json(
      {
        error:
          "El curso seleccionado no es válido.",
      },
      {
        status: 400,
      }
    );
  }

  if (
    !student?.firstName ||
    !student?.lastName ||
    !student?.email ||
    !student?.phone ||
    !student?.documentType ||
    !student?.documentNumber
  ) {
    return NextResponse.json(
      {
        error:
          "Faltan datos obligatorios del estudiante.",
      },
      {
        status: 400,
      }
    );
  }

  if (student.acceptedPrivacy !== true) {
    return NextResponse.json(
      {
        error:
          "Debes aceptar la política de tratamiento de datos para continuar.",
      },
      {
        status: 400,
      }
    );
  }

  const amount = Number(course.price) || 0;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      {
        error:
          "El curso no tiene un precio válido.",
      },
      {
        status: 400,
      }
    );
  }

  const orderNumber =
    `IBR-${Date.now()}-${course.id}`;

  const orderPayload = {
    order_number: orderNumber,
    order_status: "pending",

    product_type: "course",
    quantity: 1,
    unit_price: amount,

    event_id: null,
    event_name: null,

    course_id: course.id,
    course_slug: course.slug,
    course_name: course.name ?? null,
    cycle: course.cycle ?? null,
    year: course.year ?? null,
    shift: course.shift ?? null,
    modality: course.modality ?? null,
    campus: course.campus ?? null,
    level: course.level ?? null,
    start_date: course.start_date ?? null,
    end_date: course.end_date ?? null,
    days: Array.isArray(course.days)
      ? course.days
      : [],
    start_time:
      course.start_time || null,
    end_time:
      course.end_time || null,

    first_name:
      cleanText(student.firstName),
    last_name:
      cleanText(student.lastName),
    email:
      cleanEmail(student.email),
    phone:
      cleanText(student.phone),

    document_type:
      student.documentType,
    document_number:
      cleanText(student.documentNumber),

    birth_date:
      student.birthDate || null,
    gender:
      student.gender || null,

    address:
      cleanText(student.address) || null,
    city_name:
      cleanText(student.city) || null,

    amount,
    currency: "COP",

    payment_status: "pending",
    q10_status: "pending",
    hubspot_status: "pending",

    accepted_privacy: true,
    source: "ibraco-web",
  };

  const { data, error } =
    await supabaseAdmin
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

  if (error) {
    console.error(
      "SUPABASE COURSE INSERT ERROR:",
      {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      }
    );

    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    success: true,
    productType: "course",
    order: data,
  });
}

async function createEventOrder(body: any) {
  const { event, buyer } = body;

  const eventId =
    cleanText(event?.id);

  if (!eventId) {
    return NextResponse.json(
      {
        error:
          "El evento seleccionado no es válido.",
      },
      {
        status: 400,
      }
    );
  }

  const firstName =
    cleanText(buyer?.firstName);

  const lastName =
    cleanText(buyer?.lastName);

  const email =
    cleanEmail(buyer?.email);

  const phone =
    cleanText(buyer?.phone);

  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone
  ) {
    return NextResponse.json(
      {
        error:
          "Debes completar nombre, apellido, correo y teléfono.",
      },
      {
        status: 400,
      }
    );
  }

  if (buyer?.acceptedPrivacy !== true) {
    return NextResponse.json(
      {
        error:
          "Debes aceptar la política de tratamiento de datos para continuar.",
      },
      {
        status: 400,
      }
    );
  }

  const quantity =
    Math.floor(Number(body.quantity));

  if (
    !Number.isFinite(quantity) ||
    quantity < 1 ||
    quantity > 10
  ) {
    return NextResponse.json(
      {
        error:
          "La cantidad de entradas debe estar entre 1 y 10.",
      },
      {
        status: 400,
      }
    );
  }

  /*
    IMPORTANTE:
    No confiamos en el nombre, precio,
    capacidad ni estado enviados por el navegador.
    Consultamos el evento real en Supabase.
  */
  const {
    data: realEvent,
    error: eventError,
  } = await supabaseAdmin
    .from("events")
    .select(
      `
      id,
      slug,
      name,
      event_date,
      start_time,
      end_time,
      venue,
      address,
      price,
      capacity,
      status
      `
    )
    .eq("id", eventId)
    .maybeSingle();

  if (eventError) {
    console.error(
      "EVENT LOOKUP ERROR:",
      {
        code: eventError.code,
        message: eventError.message,
        details: eventError.details,
        hint: eventError.hint,
      }
    );

    return NextResponse.json(
      {
        error:
          "No fue posible consultar el evento.",
        code: eventError.code,
        details: eventError.details,
      },
      {
        status: 500,
      }
    );
  }

  if (!realEvent) {
    return NextResponse.json(
      {
        error:
          "El evento ya no está disponible.",
      },
      {
        status: 404,
      }
    );
  }

  if (realEvent.status !== "published") {
    return NextResponse.json(
      {
        error:
          "Este evento no está disponible para compra.",
      },
      {
        status: 409,
      }
    );
  }

  /*
    Para eventos pagos usamos siempre
    el precio real almacenado en Supabase.
  */
  const unitPrice =
    Number(realEvent.price);

  if (
    !Number.isFinite(unitPrice) ||
    unitPrice <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "El evento no tiene un precio válido.",
      },
      {
        status: 400,
      }
    );
  }

  const capacity =
    Number(realEvent.capacity);

  if (
    !Number.isFinite(capacity) ||
    capacity <= 0
  ) {
    return NextResponse.json(
      {
        error:
          "El evento no tiene cupos disponibles.",
      },
      {
        status: 409,
      }
    );
  }

  /*
    Para no dejar cupos bloqueados por intentos
    abandonados, una orden pendiente solo reserva
    cupo durante 15 minutos.
  */
  const pendingSince =
    new Date(
      Date.now() - 15 * 60 * 1000
    ).toISOString();

  const {
    data: activeOrders,
    error: activeOrdersError,
  } = await supabaseAdmin
    .from("orders")
    .select(
      `
      quantity,
      payment_status,
      created_at
      `
    )
    .eq("product_type", "event")
    .eq("event_id", realEvent.id)
    .in(
      "payment_status",
      ["paid", "pending"]
    );

  if (activeOrdersError) {
    console.error(
      "EVENT CAPACITY LOOKUP ERROR:",
      {
        code: activeOrdersError.code,
        message: activeOrdersError.message,
        details: activeOrdersError.details,
        hint: activeOrdersError.hint,
      }
    );

    return NextResponse.json(
      {
        error:
          "No fue posible verificar los cupos disponibles.",
      },
      {
        status: 500,
      }
    );
  }

  const reservedSeats =
    (activeOrders ?? []).reduce(
      (total, order: any) => {
        const orderQuantity =
          Number(order.quantity) || 1;

        if (
          order.payment_status === "paid"
        ) {
          return total + orderQuantity;
        }

        if (
          order.payment_status === "pending" &&
          order.created_at >= pendingSince
        ) {
          return total + orderQuantity;
        }

        return total;
      },
      0
    );

  const availableSeats =
    Math.max(
      0,
      capacity - reservedSeats
    );

  if (quantity > availableSeats) {
    return NextResponse.json(
      {
        error:
          availableSeats > 0
            ? `Solo quedan ${availableSeats} cupos disponibles.`
            : "Este evento ya no tiene cupos disponibles.",
        availableSeats,
      },
      {
        status: 409,
      }
    );
  }

  const amount =
    unitPrice * quantity;

  const shortEventId =
    String(realEvent.id)
      .replace(/-/g, "")
      .slice(0, 8);

  const orderNumber =
    `IBR-EVT-${Date.now()}-${shortEventId}`;

  const orderPayload = {
    order_number: orderNumber,
    order_status: "pending",

    product_type: "event",
    event_id: realEvent.id,
    event_name: realEvent.name,
    quantity,
    unit_price: unitPrice,

    /*
      Campos de curso vacíos:
      esta orden NO representa matrícula.
    */
    course_id: null,
    course_slug: null,
    course_name: null,
    cycle: null,
    year: null,
    shift: null,
    modality: null,
    campus: null,
    level: null,
    start_date:
      realEvent.event_date || null,
    end_date:
      realEvent.event_date || null,
    days: [],
    start_time:
      realEvent.start_time || null,
    end_time:
      realEvent.end_time || null,

    first_name: firstName,
    last_name: lastName,
    email,
    phone,

    document_type:
      cleanText(buyer?.documentType) ||
      null,

    document_number:
      cleanText(buyer?.documentNumber) ||
      null,

    birth_date: null,
    gender: null,

    address: null,
    city_name: null,

    amount,
    currency: "COP",

    payment_status: "pending",

    /*
      Los eventos no deben generar
      preinscripción académica en Q10.
    */
    q10_status: "not_applicable",

    hubspot_status: "pending",

    accepted_privacy: true,
    source: "ibraco-web-events",
  };

  const {
    data: createdOrder,
    error: insertError,
  } = await supabaseAdmin
    .from("orders")
    .insert(orderPayload)
    .select()
    .single();

  if (insertError) {
    console.error(
      "SUPABASE EVENT INSERT ERROR:",
      {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      }
    );

    return NextResponse.json(
      {
        error: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json({
    success: true,
    productType: "event",
    availableSeats:
      availableSeats - quantity,
    order: createdOrder,
  });
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    /*
      Mantiene compatibilidad total con el
      checkout actual de cursos.

      Para eventos el frontend envía:
      productType: "event"
    */
    if (
      body?.productType === "event"
    ) {
      return await createEventOrder(body);
    }

    return await createCourseOrder(body);
  } catch (error) {
    console.error(
      "ORDERS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error inesperado al crear el pedido.",
      },
      {
        status: 500,
      }
    );
  }
}