import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local");
}

if (!supabaseServiceKey) {
  throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local");
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

    const { course, student } = body;

    if (!course?.id || !course?.slug) {
      return NextResponse.json(
        {
          error: "El curso seleccionado no es válido.",
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
          error: "Faltan datos obligatorios del estudiante.",
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

    const orderNumber = `IBR-${Date.now()}-${course.id}`;

    const orderPayload = {
      order_number: orderNumber,
      order_status: "pending",

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
      days: Array.isArray(course.days) ? course.days : [],
      start_time: course.start_time || null,
      end_time: course.end_time || null,

      first_name: student.firstName.trim(),
      last_name: student.lastName.trim(),
      email: student.email.trim().toLowerCase(),
      phone: student.phone.trim(),

      document_type: student.documentType,
      document_number: student.documentNumber.trim(),

      birth_date: student.birthDate || null,
      gender: student.gender || null,

      address: student.address?.trim() || null,
      city_name: student.city?.trim() || null,

      amount: Number(course.price) || 0,
      currency: "COP",

      payment_status: "pending",
      q10_status: "pending",
      hubspot_status: "pending",

      accepted_privacy: true,
      source: "ibraco-web",
    };

    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (error) {
      console.error("SUPABASE INSERT ERROR:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

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
      order: data,
    });
  } catch (error) {
    console.error("ORDERS API ERROR:", error);

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