import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Event = {
  id: number;
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
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatTime(time: string | null) {
  if (!time) return "";

  const [hour, minute] = time.split(":");
  return `${hour}:${minute}`;
}

function formatPrice(price: number | null) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price ?? 0);
}

export default async function EventosPage() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("event_date", { ascending: true });

  const events = (data ?? []) as Event[];

  if (error) {
    console.error("Error cargando eventos:", error);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f4e8",
        padding: "60px 24px 100px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              color: "#009b3a",
              fontSize: "14px",
              fontWeight: 900,
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            IBRACO
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(42px, 7vw, 76px)",
              lineHeight: 0.95,
              letterSpacing: "-3px",
              color: "#111",
            }}
          >
            Agenda cultural
          </h1>

          <p
            style={{
              marginTop: "24px",
              maxWidth: "680px",
              fontSize: "20px",
              lineHeight: 1.5,
              color: "#444",
            }}
          >
            Vive Brasil en Bogotá. Gastronomía, música, cultura y encuentros
            para disfrutar y compartir.
          </p>
        </header>

        {error && (
          <div
            style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "20px",
              marginBottom: "30px",
            }}
          >
            No fue posible cargar los eventos.
          </div>
        )}

        {!error && events.length === 0 && (
          <div
            style={{
              background: "#fff",
              padding: "40px",
              borderRadius: "24px",
              fontSize: "18px",
            }}
          >
            Próximamente tendremos nuevos eventos.
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "28px",
          }}
        >
          {events.map((event) => (
            <article
              key={event.id}
              style={{
                background: "#fff",
                borderRadius: "28px",
                overflow: "hidden",
                boxShadow: "0 12px 35px rgba(0,0,0,0.08)",
              }}
            >
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.name}
                  style={{
                    width: "100%",
                    height: "380px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "280px",
                    background:
                      "linear-gradient(135deg, #009b3a 0%, #ffdf00 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "70px",
                  }}
                >
                  🇧🇷
                </div>
              )}

              <div
                style={{
                  padding: "32px",
                }}
              >
                <div
                  style={{
                    color: "#009b3a",
                    fontWeight: 900,
                    fontSize: "14px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                  }}
                >
                  {formatDate(event.event_date)}
                </div>

                <h2
                  style={{
                    margin: "0 0 18px",
                    fontSize: "34px",
                    lineHeight: 1.05,
                    color: "#111",
                  }}
                >
                  {event.name}
                </h2>

                {event.description && (
                  <p
                    style={{
                      fontSize: "17px",
                      lineHeight: 1.6,
                      color: "#444",
                      marginBottom: "24px",
                    }}
                  >
                    {event.description}
                  </p>
                )}

                <div
                  style={{
                    borderTop: "1px solid #e8e8e8",
                    paddingTop: "22px",
                    fontSize: "16px",
                    lineHeight: 1.8,
                    color: "#222",
                  }}
                >
                  {(event.start_time || event.end_time) && (
                    <div>
                      <strong>Hora:</strong>{" "}
                      {formatTime(event.start_time)}
                      {event.end_time
                        ? ` – ${formatTime(event.end_time)}`
                        : ""}
                    </div>
                  )}

                  {event.venue && (
                    <div>
                      <strong>Lugar:</strong> {event.venue}
                    </div>
                  )}

                  {event.address && (
                    <div>
                      <strong>Dirección:</strong> {event.address}
                    </div>
                  )}

                  {event.capacity && (
                    <div>
                      <strong>Cupos:</strong> {event.capacity} personas
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "28px",
                    paddingTop: "24px",
                    borderTop: "1px solid #e8e8e8",
                  }}
                >
                  <div
                    style={{
                      fontSize: "30px",
                      fontWeight: 900,
                      marginBottom: "18px",
                    }}
                  >
                    {formatPrice(event.price)}
                  </div>

                  <a
                    href={`/eventos/${event.slug}`}
                    style={{
                      display: "block",
                      width: "100%",
                      boxSizing: "border-box",
                      textAlign: "center",
                      textDecoration: "none",
                      background: "#ffdf00",
                      color: "#111",
                      padding: "18px 24px",
                      borderRadius: "999px",
                      fontSize: "16px",
                      fontWeight: 900,
                    }}
                  >
                    RESERVAR
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <a
        href="https://wa.me/573125841068?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20la%20Feijoada%20da%20Independ%C3%AAncia%20del%2012%20de%20septiembre."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        title="WhatsApp"
        style={{
          position: "fixed",
          right: "28px",
          bottom: "28px",
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          background: "#1ed760",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          fontSize: "30px",
          fontWeight: 900,
          boxShadow: "0 10px 28px rgba(0,0,0,0.22)",
          zIndex: 9999,
          border: "3px solid rgba(255,255,255,0.35)",
        }}
      >
        ☘
      </a>
    </main>
  );
}