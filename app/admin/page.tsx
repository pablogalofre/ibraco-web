export default function AdminPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f3e8",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
          }}
        >
          <div>
            <p
              style={{
                color: "#008c4a",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Administración IBRACO
            </p>

            <h1
              style={{
                fontSize: "48px",
                margin: 0,
                color: "#111",
              }}
            >
              Tienda de cursos
            </h1>

            <p style={{ fontSize: "18px", color: "#555" }}>
              Administra ciclos, horarios, precios y disponibilidad.
            </p>
          </div>

          <a
            href="/cursos"
            style={{
              background: "#111",
              color: "#fff",
              padding: "14px 22px",
              borderRadius: "30px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Ver tienda
          </a>
        </div>

        <section
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  color: "#008c4a",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                CICLO 7
              </p>

              <h2>Portugués Intensivo · Mañana</h2>

              <p>24 de septiembre — 6 de noviembre de 2026</p>
            </div>

            <button
              style={{
                background: "#ffe000",
                border: "none",
                padding: "12px 20px",
                borderRadius: "25px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Editar
            </button>
          </div>
        </section>

        <section
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  color: "#008c4a",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                CICLO 7
              </p>

              <h2>Portugués Intensivo · Noche</h2>

              <p>24 de septiembre — 9 de noviembre de 2026</p>
            </div>

            <button
              style={{
                background: "#ffe000",
                border: "none",
                padding: "12px 20px",
                borderRadius: "25px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Editar
            </button>
          </div>
        </section>

        <section
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  color: "#008c4a",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                CICLO 8
              </p>

              <h2>Portugués Intensivo · Mañana</h2>

              <p>10 de noviembre — 16 de diciembre de 2026</p>
            </div>

            <button
              style={{
                background: "#ffe000",
                border: "none",
                padding: "12px 20px",
                borderRadius: "25px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Editar
            </button>
          </div>
        </section>

        <section
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "30px",
            marginBottom: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  color: "#008c4a",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                CICLO 8
              </p>

              <h2>Portugués Intensivo · Noche</h2>

              <p>10 de noviembre — 16 de diciembre de 2026</p>
            </div>

            <button
              style={{
                background: "#ffe000",
                border: "none",
                padding: "12px 20px",
                borderRadius: "25px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Editar
            </button>
          </div>
        </section>

        <button
          style={{
            width: "100%",
            background: "#008c4a",
            color: "#fff",
            border: "none",
            padding: "18px",
            borderRadius: "30px",
            fontSize: "17px",
            fontWeight: 700,
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          + Crear nuevo curso
        </button>
      </div>
    </main>
  );
}