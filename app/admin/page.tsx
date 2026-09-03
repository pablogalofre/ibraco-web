"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      setLoading(false);
    }

    checkSession();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();

    router.replace("/admin/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f8f5e9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <strong>Cargando administración IBRACO...</strong>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f5e9",
        padding: "55px 7%",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1320px",
          margin: "0 auto",
        }}
      >
        {/* ENCABEZADO */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "30px",
            marginBottom: "50px",
          }}
        >
          <div>
            <div
              style={{
                color: "#009c4b",
                fontWeight: 800,
                fontSize: "15px",
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.03em",
              }}
            >
              Administración IBRACO
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "48px",
                lineHeight: 1,
                fontWeight: 900,
                maxWidth: "800px",
              }}
            >
              CENTRO DE ADMINISTRACIÓN
            </h1>

            <p
              style={{
                fontSize: "19px",
                marginTop: "14px",
                marginBottom: 0,
                maxWidth: "720px",
                lineHeight: 1.5,
                color: "#333",
              }}
            >
              Gestiona la operación comercial de IBRACO desde un solo lugar.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              background: "#fff",
              color: "#111",
              border: "1px solid #ccc",
              padding: "15px 25px",
              borderRadius: "30px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </div>

        {/* MÓDULOS PRINCIPALES */}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            marginBottom: "52px",
          }}
        >
          <AdminCard
            eyebrow="OFERTA ACADÉMICA"
            title="Cursos"
            description="Administra cursos, horarios, modalidades, sedes, precios, publicación y configuración académica."
            href="/admin/cursos"
            buttonText="Administrar cursos"
            accent="#009c4b"
          />

          <AdminCard
            eyebrow="AGENDA CULTURAL"
            title="Eventos"
            description="Crea y administra eventos, fechas, cupos, imágenes, precios y disponibilidad para la Agenda Cultural."
            href="/admin/eventos"
            buttonText="Administrar eventos"
            accent="#ffd800"
          />

          <AdminCard
            eyebrow="VENTAS Y PAGOS"
            title="Contabilidad"
            description="Consulta órdenes, ventas, pagos, clientes y reportes financieros de cursos y eventos."
            href="/admin/contabilidad"
            buttonText="Ir a contabilidad"
            accent="#111111"
          />
        </section>

        {/* ACCESOS PÚBLICOS */}

        <section
          style={{
            background: "#fff",
            borderRadius: "28px",
            padding: "34px",
            marginBottom: "52px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "25px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  color: "#009c4b",
                  fontWeight: 800,
                  fontSize: "13px",
                  textTransform: "uppercase",
                  marginBottom: "7px",
                }}
              >
                Vista pública
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "28px",
                  fontWeight: 900,
                }}
              >
                Revisa lo que están viendo tus clientes
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <a
                href="/cursos"
                style={{
                  background: "#009c4b",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "14px 22px",
                  borderRadius: "30px",
                  fontWeight: 800,
                }}
              >
                Ver tienda de cursos
              </a>

              <a
                href="/agenda-cultural"
                style={{
                  background: "#ffd800",
                  color: "#111",
                  textDecoration: "none",
                  padding: "14px 22px",
                  borderRadius: "30px",
                  fontWeight: 800,
                }}
              >
                Ver Agenda Cultural
              </a>

              <a
                href="/"
                style={{
                  background: "#111",
                  color: "#fff",
                  textDecoration: "none",
                  padding: "14px 22px",
                  borderRadius: "30px",
                  fontWeight: 800,
                }}
              >
                Ver sitio IBRACO
              </a>
            </div>
          </div>
        </section>

        {/* FUTUROS INDICADORES */}

        <section
          style={{
            border: "2px dashed #d8d3c4",
            borderRadius: "28px",
            padding: "36px",
          }}
        >
          <div
            style={{
              color: "#777",
              fontSize: "13px",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            Próxima etapa
          </div>

          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "30px",
              fontWeight: 900,
            }}
          >
            Indicadores comerciales
          </h2>

          <p
            style={{
              margin: 0,
              color: "#555",
              fontSize: "17px",
              lineHeight: 1.6,
              maxWidth: "850px",
            }}
          >
            Este espacio queda preparado para integrar más adelante Google
            Analytics, Meta, Mercado Pago y otros indicadores de ventas,
            tráfico, campañas y conversión.
          </p>
        </section>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            fontSize: "13px",
            marginTop: "28px",
          }}
        >
          Centro de Administración · IBRACO
        </p>
      </div>
    </main>
  );
}

function AdminCard({
  eyebrow,
  title,
  description,
  href,
  buttonText,
  accent,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  accent: string;
}) {
  const darkButton = accent === "#111111";

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: "28px",
        padding: "34px",
        minHeight: "330px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderTop: `7px solid ${accent}`,
      }}
    >
      <div>
        <div
          style={{
            color: accent === "#ffd800" ? "#777" : accent,
            fontWeight: 800,
            fontSize: "13px",
            textTransform: "uppercase",
            marginBottom: "14px",
          }}
        >
          {eyebrow}
        </div>

        <h2
          style={{
            margin: "0 0 15px",
            fontSize: "34px",
            fontWeight: 900,
          }}
        >
          {title}
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: "17px",
            lineHeight: 1.55,
            color: "#444",
          }}
        >
          {description}
        </p>
      </div>

      <a
        href={href}
        style={{
          display: "block",
          marginTop: "30px",
          background: accent,
          color: darkButton ? "#fff" : "#111",
          textDecoration: "none",
          padding: "15px 20px",
          borderRadius: "30px",
          fontWeight: 800,
          textAlign: "center",
        }}
      >
        {buttonText}
      </a>
    </article>
  );
}