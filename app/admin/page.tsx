import courses from "../../data/courses.json";

export default function AdminPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f5e9",
        padding: "50px 7%",
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
            alignItems: "center",
            gap: "30px",
            marginBottom: "45px",
          }}
        >
          <div>
            <div
              style={{
                color: "#009c4b",
                fontWeight: 800,
                fontSize: "15px",
                marginBottom: "8px",
                textTransform: "uppercase",
              }}
            >
              Administración IBRACO
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "44px",
                lineHeight: 1,
                fontWeight: 900,
              }}
            >
              TIENDA DE CURSOS
            </h1>

            <p
              style={{
                fontSize: "18px",
                marginTop: "10px",
                marginBottom: 0,
              }}
            >
              Administra ciclos, horarios, precios y disponibilidad.
            </p>
          </div>

          <a
            href="/cursos"
            style={{
              background: "#111",
              color: "#fff",
              textDecoration: "none",
              padding: "15px 25px",
              borderRadius: "30px",
              fontWeight: 700,
            }}
          >
            Ver tienda
          </a>
        </div>

        {/* RESUMEN */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "22px",
              borderRadius: "20px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#666",
              }}
            >
              CURSOS CARGADOS
            </div>

            <strong style={{ fontSize: "32px" }}>{courses.length}</strong>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "22px",
              borderRadius: "20px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#666",
              }}
            >
              PUBLICADOS
            </div>

            <strong style={{ fontSize: "32px" }}>
              {courses.filter((course) => course.status === "published").length}
            </strong>
          </div>

          <div
            style={{
              background: "#fff",
              padding: "22px",
              borderRadius: "20px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#666",
              }}
            >
              BORRADORES
            </div>

            <strong style={{ fontSize: "32px" }}>
              {courses.filter((course) => course.status === "draft").length}
            </strong>
          </div>
        </div>

        {/* CURSOS */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "22px",
          }}
        >
          {courses.map((course) => (
            <article
              key={course.id}
              style={{
                background: "#fff",
                borderRadius: "22px",
                padding: "28px 32px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "25px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      color: "#009c4b",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    {course.cycle}
                  </span>

                  <span
                    style={{
                      background:
                        course.status === "published" ? "#dff5e8" : "#eee",
                      color:
                        course.status === "published" ? "#007b3d" : "#555",
                      padding: "5px 9px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                    }}
                  >
                    {course.status === "published"
                      ? "Publicado"
                      : "Borrador"}
                  </span>
                </div>

                <h2
                  style={{
                    margin: "0 0 5px",
                    fontSize: "27px",
                  }}
                >
                  {course.name} · {course.shift}
                </h2>

                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "16px",
                  }}
                >
                  {course.startDate} — {course.endDate}
                </p>

                {(course.modality || course.campus) && (
                  <p
                    style={{
                      margin: "0 0 6px",
                      color: "#555",
                    }}
                  >
                    {course.modality}
                    {course.modality && course.campus ? " · " : ""}
                    {course.campus}
                  </p>
                )}

                {course.days.length > 0 && (
                  <p
                    style={{
                      margin: 0,
                      color: "#555",
                    }}
                  >
                    {course.days.join(" y ")} · {course.startTime} –{" "}
                    {course.endTime}
                  </p>
                )}
              </div>

             <a
  href={`/admin/cursos/${course.id}`}
  style={{
    background: "#ffd800",
    color: "#000",
    textDecoration: "none",
    padding: "14px 25px",
    borderRadius: "30px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    flexShrink: 0,
    display: "inline-block",
  }}
>
  Editar
</a>
            </article>
          ))}
        </div>

        {/* CREAR */}
        <button
          type="button"
          style={{
            width: "100%",
            marginTop: "35px",
            background: "#009c4b",
            color: "#fff",
            border: "none",
            padding: "19px",
            borderRadius: "30px",
            fontSize: "17px",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          + Crear nuevo curso
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#777",
            fontSize: "13px",
            marginTop: "18px",
          }}
        >
          Panel administrativo · IBRACO
        </p>
      </div>
    </main>
  );
}