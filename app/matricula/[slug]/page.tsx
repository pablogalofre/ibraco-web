"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Course = {
  id: number;
  slug: string;
  name: string;
  cycle: string | null;
  year: number | null;
  shift: string | null;
  modality: string | null;
  campus: string | null;
  start_date: string | null;
  end_date: string | null;
  days: string[] | null;
  start_time: string | null;
  end_time: string | null;
  level: string | null;
  price: number | null;
  status: string | null;
  image_url: string | null;
};

type FormData = {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  gender: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  acceptedPrivacy: boolean;
};

const initialForm: FormData = {
  firstName: "",
  lastName: "",
  documentType: "",
  documentNumber: "",
  birthDate: "",
  gender: "",
  email: "",
  phone: "",
  city: "",
  address: "",
  acceptedPrivacy: false,
};

function formatPrice(price: number | null) {
  if (!price) return "Precio por confirmar";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatTime(time: string | null) {
  if (!time) return "";
  return time.slice(0, 5);
}

export default function MatriculaPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (error || !data) {
        console.error(error);
        setMessage(
          "No encontramos este curso o ya no está disponible."
        );
        setLoading(false);
        return;
      }

      setCourse(data);
      setLoading(false);
    }

    loadCourse();
  }, [slug]);

  function updateField<K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!course) return;

    if (!form.acceptedPrivacy) {
      setMessage(
        "Debes aceptar la política de tratamiento de datos para continuar."
      );
      return;
    }

    if (submitting) return;

    setSubmitting(true);
    setMessage("Preparando tu matrícula...");

    try {
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course,
          student: form,
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        console.error("ORDER ERROR:", orderResult);

        setMessage(
          orderResult.error ||
            "No fue posible crear el pedido."
        );

        setSubmitting(false);
        return;
      }

      if (!orderResult.order?.order_number) {
        console.error(
          "ORDER WITHOUT NUMBER:",
          orderResult
        );

        setMessage(
          "El pedido fue creado, pero no obtuvimos su número."
        );

        setSubmitting(false);
        return;
      }

      const orderNumber =
        orderResult.order.order_number;

      setMessage(
        "Pedido creado. Conectando con Mercado Pago..."
      );

      const paymentResponse = await fetch(
        "/api/mercadopago/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderNumber,
          }),
        }
      );

      const paymentResult =
        await paymentResponse.json();

      if (!paymentResponse.ok) {
        console.error(
          "MERCADO PAGO ERROR:",
          paymentResult
        );

        setMessage(
          paymentResult.error ||
            "El pedido fue creado, pero no pudimos iniciar el pago."
        );

        setSubmitting(false);
        return;
      }

      if (!paymentResult.checkoutUrl) {
        console.error(
          "MERCADO PAGO WITHOUT CHECKOUT URL:",
          paymentResult
        );

        setMessage(
          "El pedido fue creado, pero Mercado Pago no devolvió el enlace de pago."
        );

        setSubmitting(false);
        return;
      }

      setMessage(
        "Todo listo. Te estamos llevando a Mercado Pago..."
      );

      window.location.href =
        paymentResult.checkoutUrl;
    } catch (error) {
      console.error("CHECKOUT ERROR:", error);

      setMessage(
        "Ocurrió un error preparando el pago. Inténtalo nuevamente."
      );

      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="matricula-page">
        <div className="matricula-shell">
          Cargando curso...
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="matricula-page">
        <div className="matricula-shell">
          <a href="/cursos" className="back-link">
            ← Volver a cursos
          </a>

          <h1>Curso no disponible</h1>
          <p>{message}</p>
        </div>

        <ResponsiveStyles />
      </main>
    );
  }

  return (
    <main className="matricula-page">
      <div className="matricula-shell">
        <a href="/cursos" className="back-link">
          ← Volver a cursos
        </a>

        <div className="matricula-heading">
          <div className="eyebrow">
            Matrícula IBRACO
          </div>

          <h1>Completa tus datos</h1>

          <p>
            Revisa el curso seleccionado y completa la
            información del estudiante.
          </p>
        </div>

        <div className="matricula-layout">
          {/* FORMULARIO */}

          <form
            onSubmit={handleSubmit}
            className="student-form"
          >
            <h2>Datos del estudiante</h2>

            <div className="form-grid">
              <Field label="Nombres *">
                <input
                  required
                  value={form.firstName}
                  onChange={(e) =>
                    updateField(
                      "firstName",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Apellidos *">
                <input
                  required
                  value={form.lastName}
                  onChange={(e) =>
                    updateField(
                      "lastName",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Tipo de identificación *">
                <select
                  required
                  value={form.documentType}
                  onChange={(e) =>
                    updateField(
                      "documentType",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Seleccionar
                  </option>
                  <option value="CC">
                    Cédula de ciudadanía
                  </option>
                  <option value="TI">
                    Tarjeta de identidad
                  </option>
                  <option value="CE">
                    Cédula de extranjería
                  </option>
                  <option value="PA">
                    Pasaporte
                  </option>
                  <option value="PEP">
                    PEP
                  </option>
                </select>
              </Field>

              <Field label="Número de identificación *">
                <input
                  required
                  value={form.documentNumber}
                  onChange={(e) =>
                    updateField(
                      "documentNumber",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Fecha de nacimiento *">
                <input
                  required
                  type="date"
                  value={form.birthDate}
                  onChange={(e) =>
                    updateField(
                      "birthDate",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Sexo *">
                <select
                  required
                  value={form.gender}
                  onChange={(e) =>
                    updateField(
                      "gender",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Seleccionar
                  </option>
                  <option value="M">
                    Masculino
                  </option>
                  <option value="F">
                    Femenino
                  </option>
                </select>
              </Field>

              <Field label="Correo electrónico *">
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateField(
                      "email",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Celular *">
                <input
                  required
                  type="tel"
                  placeholder="Ej. 3125841068"
                  value={form.phone}
                  onChange={(e) =>
                    updateField(
                      "phone",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Ciudad *">
                <input
                  required
                  placeholder="Ej. Bogotá"
                  value={form.city}
                  onChange={(e) =>
                    updateField(
                      "city",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Dirección *">
                <input
                  required
                  value={form.address}
                  onChange={(e) =>
                    updateField(
                      "address",
                      e.target.value
                    )
                  }
                />
              </Field>
            </div>

            <label className="privacy-row">
              <input
                type="checkbox"
                checked={form.acceptedPrivacy}
                onChange={(e) =>
                  updateField(
                    "acceptedPrivacy",
                    e.target.checked
                  )
                }
              />

              <span>
                Acepto el tratamiento de mis datos
                personales para gestionar mi proceso de
                matrícula en IBRACO.
              </span>
            </label>

            {message && (
              <div className="status-message">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="pay-button"
            >
              {submitting
                ? "Preparando pago..."
                : "Continuar al pago"}
            </button>
          </form>

          {/* RESUMEN */}

          <aside className="course-summary">
            {course.image_url && (
              <div className="course-image-wrap">
                <img
                  src={course.image_url}
                  alt={course.name}
                  className="course-image"
                />
              </div>
            )}

            <div className="course-summary-content">
              <div className="course-cycle">
                {course.cycle}
              </div>

              <h2>{course.name}</h2>

              {course.shift && (
                <p className="course-shift">
                  Jornada {course.shift}
                </p>
              )}

              <div className="course-details">
                {course.modality && (
                  <div>
                    <strong>Modalidad:</strong>{" "}
                    {course.modality}
                  </div>
                )}

                {course.campus && (
                  <div>
                    <strong>Sede:</strong>{" "}
                    {course.campus}
                  </div>
                )}

                {course.start_date && (
                  <div>
                    <strong>Inicio:</strong>{" "}
                    {formatDate(
                      course.start_date
                    )}
                  </div>
                )}

                {course.end_date && (
                  <div>
                    <strong>Finaliza:</strong>{" "}
                    {formatDate(
                      course.end_date
                    )}
                  </div>
                )}

                {course.days &&
                  course.days.length > 0 && (
                    <div>
                      <strong>Días:</strong>{" "}
                      {course.days.join(", ")}
                    </div>
                  )}

                {(course.start_time ||
                  course.end_time) && (
                  <div>
                    <strong>Horario:</strong>{" "}
                    {formatTime(
                      course.start_time
                    )}

                    {course.start_time &&
                    course.end_time
                      ? " – "
                      : ""}

                    {formatTime(
                      course.end_time
                    )}
                  </div>
                )}
              </div>

              <div className="total-label">
                TOTAL
              </div>

              <div className="total-price">
                {formatPrice(course.price)}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <ResponsiveStyles />
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}

function ResponsiveStyles() {
  return (
    <style>{`
      * {
        box-sizing: border-box;
      }

      html,
      body {
        max-width: 100%;
        overflow-x: hidden;
      }

      .matricula-page {
        min-height: 100vh;
        background: #f8f5e9;
        padding: 40px 7% 80px;
        font-family: Arial, sans-serif;
        color: #111;
      }

      .matricula-shell {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
      }

      .back-link {
        color: #009c4b;
        font-weight: 800;
        text-decoration: none;
      }

      .matricula-heading {
        margin: 30px 0 40px;
      }

      .eyebrow {
        color: #009c4b;
        font-weight: 900;
        text-transform: uppercase;
        font-size: 14px;
      }

      .matricula-heading h1 {
        font-size: clamp(36px, 5vw, 44px);
        line-height: 1.05;
        margin: 8px 0 12px;
      }

      .matricula-heading p {
        font-size: 18px;
        margin: 0;
        color: #555;
        max-width: 700px;
      }

      .matricula-layout {
        display: grid;
        grid-template-columns:
          minmax(0, 1.5fr)
          minmax(300px, 0.8fr);
        gap: 30px;
        align-items: start;
        width: 100%;
      }

      .student-form,
      .course-summary {
        min-width: 0;
      }

      .student-form {
        background: #fff;
        border-radius: 24px;
        padding: 35px;
        width: 100%;
      }

      .student-form h2 {
        font-size: 27px;
        margin-top: 0;
        margin-bottom: 25px;
      }

      .form-grid {
        display: grid;
        grid-template-columns:
          repeat(2, minmax(0, 1fr));
        gap: 22px;
        width: 100%;
      }

      .field {
        min-width: 0;
      }

      .field label {
        display: block;
        font-weight: 800;
        font-size: 14px;
        margin-bottom: 7px;
      }

      .field input,
      .field select {
        display: block;
        width: 100%;
        min-width: 0;
        max-width: 100%;
        padding: 14px 16px;
        border-radius: 12px;
        border: 1px solid #d8d8d8;
        background: #fff;
        font-size: 16px;
        color: #111;
      }

      .privacy-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-top: 28px;
        font-size: 14px;
        line-height: 1.5;
      }

      .privacy-row input {
        flex: 0 0 18px;
        width: 18px;
        height: 18px;
        margin-top: 3px;
      }

      .privacy-row span {
        min-width: 0;
      }

      .status-message {
        margin-top: 25px;
        padding: 15px 18px;
        border-radius: 12px;
        background: #eef7f1;
        color: #087a3e;
        font-weight: 700;
        line-height: 1.4;
      }

      .pay-button {
        display: block;
        width: 100%;
        margin-top: 28px;
        padding: 17px 25px;
        border-radius: 30px;
        border: none;
        background: #ffd800;
        color: #111;
        font-weight: 900;
        font-size: 16px;
        cursor: pointer;
      }

      .pay-button:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }

      .course-summary {
        background: #fff;
        border-radius: 24px;
        overflow: hidden;
        position: sticky;
        top: 25px;
        width: 100%;
      }

      .course-image-wrap {
        padding: 20px;
        background: #f1f1f1;
      }

      .course-image {
        width: 100%;
        height: auto;
        max-width: 100%;
        display: block;
        border-radius: 14px;
      }

      .course-summary-content {
        padding: 28px;
      }

      .course-cycle {
        color: #009c4b;
        font-weight: 900;
        font-size: 13px;
        text-transform: uppercase;
      }

      .course-summary h2 {
        margin: 7px 0 5px;
        font-size: 27px;
        line-height: 1.1;
        overflow-wrap: anywhere;
      }

      .course-shift {
        margin-top: 0;
        font-weight: 700;
      }

      .course-details {
        border-top: 1px solid #eee;
        border-bottom: 1px solid #eee;
        padding: 20px 0;
        margin: 20px 0;
        display: grid;
        gap: 10px;
        font-size: 14px;
      }

      .total-label {
        font-size: 13px;
        font-weight: 700;
        color: #666;
      }

      .total-price {
        font-size: 30px;
        font-weight: 900;
        margin-top: 3px;
      }

      @media (max-width: 900px) {
        .matricula-page {
          padding:
            28px 24px
            calc(60px + env(safe-area-inset-bottom));
        }

        .matricula-layout {
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .course-summary {
          position: static;
          order: -1;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }

        .matricula-heading {
          margin: 24px 0 28px;
        }

        .student-form {
          padding: 26px;
        }

        .course-summary-content {
          padding: 24px;
        }
      }

      @media (max-width: 600px) {
        .matricula-page {
          padding:
            22px 16px
            calc(50px + env(safe-area-inset-bottom));
        }

        .matricula-heading h1 {
          font-size: 34px;
          line-height: 1;
        }

        .matricula-heading p {
          font-size: 16px;
          line-height: 1.45;
        }

        .student-form {
          border-radius: 20px;
          padding: 20px 16px 22px;
        }

        .student-form h2 {
          font-size: 23px;
          margin-bottom: 22px;
        }

        .form-grid {
          gap: 18px;
        }

        .field input,
        .field select {
          font-size: 16px;
          padding: 14px 13px;
        }

        .course-summary {
          border-radius: 20px;
        }

        .course-image-wrap {
          padding: 12px;
        }

        .course-summary-content {
          padding: 22px 18px 24px;
        }

        .course-summary h2 {
          font-size: 27px;
        }

        .total-price {
          font-size: 36px;
        }

        .privacy-row {
          font-size: 13px;
        }

        .pay-button {
          min-height: 54px;
          border-radius: 28px;
          padding: 15px 18px;
          font-size: 17px;
          white-space: normal;
        }
      }

      @media (max-width: 380px) {
        .matricula-page {
          padding-left: 12px;
          padding-right: 12px;
        }

        .matricula-heading h1 {
          font-size: 31px;
        }

        .student-form {
          padding-left: 14px;
          padding-right: 14px;
        }

        .course-summary h2 {
          font-size: 24px;
        }

        .total-price {
          font-size: 32px;
        }
      }
    `}</style>
  );
}