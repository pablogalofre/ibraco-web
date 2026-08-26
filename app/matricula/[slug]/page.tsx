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

    if (!course) {
      return;
    }

    if (!form.acceptedPrivacy) {
      setMessage(
        "Debes aceptar la política de tratamiento de datos para continuar."
      );
      return;
    }

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setMessage("Preparando tu matrícula...");

    try {
      /*
       * PASO 1
       * Crear el pedido en nuestra base de datos.
       */
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

      /*
       * PASO 2
       * Crear la orden de pago en Mercado Pago.
       */
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

      /*
       * PASO 3
       * Redirigir al estudiante a Checkout Pro.
       */
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

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #d8d8d8",
    background: "#fff",
    fontSize: "16px",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontWeight: 800,
    fontSize: "14px",
    marginBottom: "7px",
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8f5e9",
          padding: "60px 7%",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          Cargando curso...
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8f5e9",
          padding: "60px 7%",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <a
            href="/cursos"
            style={{
              color: "#009c4b",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            ← Volver a cursos
          </a>

          <h1>Curso no disponible</h1>

          <p>{message}</p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f5e9",
        padding: "40px 7% 80px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <a
          href="/cursos"
          style={{
            color: "#009c4b",
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          ← Volver a cursos
        </a>

        <div
          style={{
            margin: "30px 0 40px",
          }}
        >
          <div
            style={{
              color: "#009c4b",
              fontWeight: 900,
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            Matrícula IBRACO
          </div>

          <h1
            style={{
              fontSize: "44px",
              lineHeight: 1.05,
              margin: "8px 0 12px",
            }}
          >
            Completa tus datos
          </h1>

          <p
            style={{
              fontSize: "18px",
              margin: 0,
              color: "#555",
            }}
          >
            Revisa el curso seleccionado y completa la
            información del estudiante.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.5fr) minmax(320px, 0.8fr)",
            gap: "30px",
            alignItems: "start",
          }}
        >
          {/* FORMULARIO */}

          <form
            onSubmit={handleSubmit}
            style={{
              background: "#fff",
              borderRadius: "24px",
              padding: "35px",
            }}
          >
            <h2
              style={{
                fontSize: "27px",
                marginTop: 0,
                marginBottom: "25px",
              }}
            >
              Datos del estudiante
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "22px",
              }}
            >
              <div>
                <label style={labelStyle}>
                  Nombres *
                </label>

                <input
                  required
                  style={inputStyle}
                  value={form.firstName}
                  onChange={(e) =>
                    updateField(
                      "firstName",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Apellidos *
                </label>

                <input
                  required
                  style={inputStyle}
                  value={form.lastName}
                  onChange={(e) =>
                    updateField(
                      "lastName",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Tipo de identificación *
                </label>

                <select
                  required
                  style={inputStyle}
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
              </div>

              <div>
                <label style={labelStyle}>
                  Número de identificación *
                </label>

                <input
                  required
                  style={inputStyle}
                  value={form.documentNumber}
                  onChange={(e) =>
                    updateField(
                      "documentNumber",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Fecha de nacimiento *
                </label>

                <input
                  required
                  type="date"
                  style={inputStyle}
                  value={form.birthDate}
                  onChange={(e) =>
                    updateField(
                      "birthDate",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Sexo *
                </label>

                <select
                  required
                  style={inputStyle}
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
              </div>

              <div>
                <label style={labelStyle}>
                  Correo electrónico *
                </label>

                <input
                  required
                  type="email"
                  style={inputStyle}
                  value={form.email}
                  onChange={(e) =>
                    updateField(
                      "email",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Celular *
                </label>

                <input
                  required
                  type="tel"
                  style={inputStyle}
                  placeholder="Ej. 3125841068"
                  value={form.phone}
                  onChange={(e) =>
                    updateField(
                      "phone",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Ciudad *
                </label>

                <input
                  required
                  style={inputStyle}
                  placeholder="Ej. Bogotá"
                  value={form.city}
                  onChange={(e) =>
                    updateField(
                      "city",
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Dirección *
                </label>

                <input
                  required
                  style={inputStyle}
                  value={form.address}
                  onChange={(e) =>
                    updateField(
                      "address",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                marginTop: "28px",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              <input
                type="checkbox"
                checked={form.acceptedPrivacy}
                onChange={(e) =>
                  updateField(
                    "acceptedPrivacy",
                    e.target.checked
                  )
                }
                style={{
                  marginTop: "3px",
                  width: "18px",
                  height: "18px",
                }}
              />

              <span>
                Acepto el tratamiento de mis datos
                personales para gestionar mi proceso de
                matrícula en IBRACO.
              </span>
            </label>

            {message && (
              <div
                style={{
                  marginTop: "25px",
                  padding: "15px 18px",
                  borderRadius: "12px",
                  background: "#eef7f1",
                  color: "#087a3e",
                  fontWeight: 700,
                  lineHeight: 1.4,
                }}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                marginTop: "28px",
                padding: "17px 25px",
                borderRadius: "30px",
                border: "none",
                background: "#ffd800",
                color: "#111",
                fontWeight: 900,
                fontSize: "16px",
                cursor: submitting
                  ? "not-allowed"
                  : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting
                ? "Preparando pago..."
                : "Continuar al pago"}
            </button>
          </form>

          {/* RESUMEN */}

          <aside
            style={{
              background: "#fff",
              borderRadius: "24px",
              overflow: "hidden",
              position: "sticky",
              top: "25px",
            }}
          >
            {course.image_url && (
              <div
                style={{
                  padding: "20px",
                  background: "#f1f1f1",
                }}
              >
                <img
                  src={course.image_url}
                  alt={course.name}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block",
                    borderRadius: "14px",
                  }}
                />
              </div>
            )}

            <div
              style={{
                padding: "28px",
              }}
            >
              <div
                style={{
                  color: "#009c4b",
                  fontWeight: 900,
                  fontSize: "13px",
                  textTransform: "uppercase",
                }}
              >
                {course.cycle}
              </div>

              <h2
                style={{
                  margin: "7px 0 5px",
                  fontSize: "27px",
                }}
              >
                {course.name}
              </h2>

              {course.shift && (
                <p
                  style={{
                    marginTop: 0,
                    fontWeight: 700,
                  }}
                >
                  Jornada {course.shift}
                </p>
              )}

              <div
                style={{
                  borderTop: "1px solid #eee",
                  borderBottom: "1px solid #eee",
                  padding: "20px 0",
                  margin: "20px 0",
                  display: "grid",
                  gap: "10px",
                  fontSize: "14px",
                }}
              >
                {course.modality && (
                  <div>
                    <strong>
                      Modalidad:
                    </strong>{" "}
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
                    <strong>
                      Finaliza:
                    </strong>{" "}
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
                    <strong>
                      Horario:
                    </strong>{" "}
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

              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#666",
                }}
              >
                TOTAL
              </div>

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 900,
                  marginTop: "3px",
                }}
              >
                {formatPrice(course.price)}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}