"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type EventRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  address: string | null;
  price: number | null;
  capacity: number | null;
  status: string | null;
  image_url: string | null;
  category: string | null;
  registration_type: string | null;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d9d5c9",
  borderRadius: "14px",
  padding: "14px 15px",
  fontSize: "15px",
  background: "#fff",
  color: "#111",
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatTime(value: string | null) {
  if (!value) return "";
  return value.slice(0, 5);
}

function money(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function EventoDetallePage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      if (!slug) return;

      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        console.error("Error cargando evento:", error);
        setErrorMessage("No fue posible cargar el evento.");
        setLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Este evento no está disponible.");
        setLoading(false);
        return;
      }

      setEvent(data as EventRow);
      setLoading(false);
    }

    loadEvent();
  }, [slug]);

  const unitPrice = Number(event?.price ?? 0);

  const total = useMemo(
    () => unitPrice * quantity,
    [unitPrice, quantity]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!event) return;

    setErrorMessage("");

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
      setErrorMessage(
        "Completa nombre, apellido, correo y celular."
      );
      return;
    }

    if (!acceptedPrivacy) {
      setErrorMessage(
        "Debes aceptar el tratamiento de datos para continuar."
      );
      return;
    }

    if (quantity < 1 || quantity > 10) {
      setErrorMessage(
        "La cantidad debe estar entre 1 y 10 entradas."
      );
      return;
    }

    setSubmitting(true);

    try {
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productType: "event",
          event: {
            id: event.id,
          },
          quantity,
          buyer: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone.trim(),
            acceptedPrivacy: true,
          },
        }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(
          orderResult?.error ||
            "No fue posible crear la reserva."
        );
      }

      const orderNumber =
        orderResult?.order?.order_number;

      if (!orderNumber) {
        throw new Error(
          "La reserva se creó sin número de pedido."
        );
      }

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
        throw new Error(
          paymentResult?.error ||
            "No fue posible iniciar Mercado Pago."
        );
      }

      if (!paymentResult?.checkoutUrl) {
        throw new Error(
          "Mercado Pago no devolvió el enlace de pago."
        );
      }

      window.location.href =
        paymentResult.checkoutUrl;
    } catch (error) {
      console.error(
        "EVENT CHECKOUT ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar la compra."
      );

      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={shellStyle}>
          <div style={messageCardStyle}>
            Cargando evento...
          </div>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main style={pageStyle}>
        <div style={shellStyle}>
          <div style={messageCardStyle}>
            {errorMessage ||
              "Este evento no está disponible."}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={shellStyle}>
        <a href="/eventos" style={backLinkStyle}>
          ← Volver a la agenda
        </a>

        <div style={layoutStyle}>
          <section style={eventCardStyle}>
            <div style={posterFrameStyle}>
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.name}
                  style={posterImageStyle}
                />
              ) : (
                <div style={emptyPosterStyle}>
                  🇧🇷
                </div>
              )}
            </div>

            <div style={eventContentStyle}>
              <div style={categoryStyle}>
                {event.category || "Cultura"}
              </div>

              <h1 style={eventTitleStyle}>
                {event.name}
              </h1>

              <div style={dateStyle}>
                {formatDate(event.event_date)}
                {(event.start_time ||
                  event.end_time) && (
                  <>
                    {" "}
                    · {formatTime(event.start_time)}
                    {event.end_time
                      ? ` – ${formatTime(
                          event.end_time
                        )}`
                      : ""}
                  </>
                )}
              </div>

              {event.description && (
                <p style={descriptionStyle}>
                  {event.description}
                </p>
              )}

              <div style={detailsBoxStyle}>
                {event.venue && (
                  <div>
                    <strong>Lugar:</strong>{" "}
                    {event.venue}
                  </div>
                )}

                {event.address && (
                  <div>
                    <strong>Dirección:</strong>{" "}
                    {event.address}
                  </div>
                )}

                {event.capacity && (
                  <div>
                    <strong>Cupo total:</strong>{" "}
                    {event.capacity} personas
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside style={checkoutCardStyle}>
            <div style={eyebrowStyle}>
              RESERVA TU CUPO
            </div>

            <h2 style={checkoutTitleStyle}>
              Compra tus entradas
            </h2>

            <p style={checkoutIntroStyle}>
              Completa tus datos. Después te
              llevaremos a Mercado Pago para
              finalizar la compra.
            </p>

            <form onSubmit={handleSubmit}>
              <div style={formGridStyle}>
                <Field label="Nombre">
                  <input
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    autoComplete="given-name"
                    style={inputStyle}
                    required
                  />
                </Field>

                <Field label="Apellido">
                  <input
                    value={lastName}
                    onChange={(e) =>
                      setLastName(e.target.value)
                    }
                    autoComplete="family-name"
                    style={inputStyle}
                    required
                  />
                </Field>

                <Field label="Correo electrónico">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    autoComplete="email"
                    style={inputStyle}
                    required
                  />
                </Field>

                <Field label="Celular / WhatsApp">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    autoComplete="tel"
                    style={inputStyle}
                    required
                  />
                </Field>
              </div>

              <div style={quantitySectionStyle}>
                <div>
                  <div style={fieldLabelStyle}>
                    Cantidad de entradas
                  </div>
                  <div style={helperTextStyle}>
                    Máximo 10 por compra
                  </div>
                </div>

                <div style={quantityControlStyle}>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    style={quantityButtonStyle}
                  >
                    −
                  </button>

                  <strong
                    style={{
                      minWidth: "36px",
                      textAlign: "center",
                      fontSize: "20px",
                    }}
                  >
                    {quantity}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(10, current + 1)
                      )
                    }
                    style={quantityButtonStyle}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={summaryStyle}>
                <div style={summaryRowStyle}>
                  <span>
                    {quantity} entrada
                    {quantity === 1 ? "" : "s"}
                  </span>

                  <span>
                    {money(unitPrice)} c/u
                  </span>
                </div>

                <div style={totalRowStyle}>
                  <span>Total</span>
                  <strong>{money(total)}</strong>
                </div>
              </div>

              <label style={privacyStyle}>
                <input
                  type="checkbox"
                  checked={acceptedPrivacy}
                  onChange={(e) =>
                    setAcceptedPrivacy(
                      e.target.checked
                    )
                  }
                />

                <span>
                  Acepto el tratamiento de mis
                  datos personales para gestionar
                  esta compra y la participación
                  en el evento.
                </span>
              </label>

              {errorMessage && (
                <div style={errorStyle}>
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...payButtonStyle,
                  opacity: submitting ? 0.6 : 1,
                  cursor: submitting
                    ? "wait"
                    : "pointer",
                }}
              >
                {submitting
                  ? "Preparando pago..."
                  : `CONTINUAR AL PAGO · ${money(
                      total
                    )}`}
              </button>

              <div style={secureTextStyle}>
                Pago procesado por Mercado Pago.
              </div>
            </form>
          </aside>
        </div>
      </div>
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
    <label>
      <div style={fieldLabelStyle}>
        {label}
      </div>
      {children}
    </label>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f6f1e4",
  padding: "34px 22px 80px",
  fontFamily:
    "Arial, Helvetica, sans-serif",
  color: "#111",
};

const shellStyle: React.CSSProperties = {
  maxWidth: "1280px",
  margin: "0 auto",
};

const backLinkStyle: React.CSSProperties = {
  display: "inline-block",
  marginBottom: "22px",
  color: "#333",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: "14px",
};

const layoutStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1.1fr) minmax(360px, .72fr)",
  gap: "24px",
  alignItems: "start",
};

const eventCardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "28px",
  overflow: "hidden",
  boxShadow:
    "0 14px 40px rgba(0,0,0,.06)",
};

const posterFrameStyle: React.CSSProperties = {
  background: "#f1eee5",
  minHeight: "420px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const posterImageStyle: React.CSSProperties = {
  width: "100%",
  maxHeight: "680px",
  objectFit: "contain",
  display: "block",
};

const emptyPosterStyle: React.CSSProperties = {
  minHeight: "420px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "72px",
};

const eventContentStyle: React.CSSProperties = {
  padding: "30px",
};

const categoryStyle: React.CSSProperties = {
  color: "#009b3a",
  fontWeight: 900,
  fontSize: "12px",
  letterSpacing: "1px",
  textTransform: "uppercase",
};

const eventTitleStyle: React.CSSProperties = {
  margin: "9px 0 10px",
  fontSize: "clamp(34px, 5vw, 54px)",
  lineHeight: 0.98,
  letterSpacing: "-1.7px",
};

const dateStyle: React.CSSProperties = {
  color: "#555",
  fontWeight: 800,
  fontSize: "15px",
};

const descriptionStyle: React.CSSProperties = {
  margin: "22px 0",
  fontSize: "17px",
  lineHeight: 1.65,
  color: "#3f3f3f",
};

const detailsBoxStyle: React.CSSProperties = {
  borderTop: "1px solid #ece8de",
  paddingTop: "20px",
  display: "grid",
  gap: "8px",
  fontSize: "15px",
  lineHeight: 1.5,
};

const checkoutCardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "28px",
  padding: "28px",
  boxShadow:
    "0 14px 40px rgba(0,0,0,.06)",
  position: "sticky",
  top: "20px",
};

const eyebrowStyle: React.CSSProperties = {
  color: "#009b3a",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "1.3px",
};

const checkoutTitleStyle: React.CSSProperties = {
  margin: "8px 0 10px",
  fontSize: "30px",
  lineHeight: 1,
};

const checkoutIntroStyle: React.CSSProperties = {
  color: "#666",
  lineHeight: 1.5,
  fontSize: "14px",
  marginBottom: "22px",
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
};

const fieldLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 900,
  color: "#333",
  marginBottom: "7px",
};

const helperTextStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#777",
};

const quantitySectionStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  marginTop: "22px",
  padding: "18px",
  borderRadius: "18px",
  background: "#faf8f2",
};

const quantityControlStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const quantityButtonStyle: React.CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "999px",
  border: "1px solid #d8d3c5",
  background: "#fff",
  fontSize: "22px",
  lineHeight: 1,
  cursor: "pointer",
};

const summaryStyle: React.CSSProperties = {
  marginTop: "18px",
  borderTop: "1px solid #ece8de",
  borderBottom: "1px solid #ece8de",
  padding: "18px 0",
};

const summaryRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  color: "#666",
  fontSize: "14px",
};

const totalRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  alignItems: "center",
  marginTop: "9px",
  fontSize: "24px",
};

const privacyStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  marginTop: "18px",
  color: "#555",
  fontSize: "12px",
  lineHeight: 1.5,
};

const errorStyle: React.CSSProperties = {
  marginTop: "16px",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "#fdecec",
  color: "#a52222",
  fontSize: "13px",
  fontWeight: 700,
};

const payButtonStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "20px",
  border: 0,
  borderRadius: "999px",
  padding: "17px 20px",
  background: "#ffdf00",
  color: "#111",
  fontSize: "15px",
  fontWeight: 900,
};

const secureTextStyle: React.CSSProperties = {
  textAlign: "center",
  marginTop: "10px",
  color: "#888",
  fontSize: "11px",
};

const messageCardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "22px",
  padding: "30px",
};
