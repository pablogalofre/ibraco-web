"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type Course = {
  id: number;
  name: string;
  cycle: string | null;
  status: string | null;
  shift: string | null;
  level: string | null;
  modality: string | null;
  campus: string | null;
  days: string[] | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
};

export default function AdminPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdmin() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("start_date", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Error cargando cursos:",
          error
        );
      }

      setCourses(data ?? []);
      setLoading(false);
    }

    loadAdmin();
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
        <strong>
          Cargando administración IBRACO...
        </strong>
      </main>
    );
  }

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
            flexWrap: "wrap",
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
              Administra ciclos, horarios,
              precios y disponibilidad.
            </p>
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
        </div>

        {/* RESUMEN */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <SummaryCard
            label="CURSOS CARGADOS"
            value={courses.length}
          />

          <SummaryCard
            label="PUBLICADOS"
            value={
              courses.filter(
                (course) =>
                  course.status === "published"
              ).length
            }
          />

          <SummaryCard
            label="BORRADORES"
            value={
              courses.filter(
                (course) =>
                  course.status === "draft"
              ).length
            }
          />
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
                flexWrap: "wrap",
                gap: "25px",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      color: "#009c4b",
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                    }}
                  >
                    {course.cycle}
                  </span>

                  <span
                    style={{
                      background:
                        course.status ===
                        "published"
                          ? "#dff5e8"
                          : "#eee",
                      color:
                        course.status ===
                        "published"
                          ? "#007b3d"
                          : "#555",
                      padding: "5px 9px",
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: 800,
                      textTransform:
                        "uppercase",
                    }}
                  >
                    {course.status ===
                    "published"
                      ? "Publicado"
                      : "Borrador"}
                  </span>
                </div>

                <h2
                  style={{
                    margin: "0 0 8px",
                    fontSize: "27px",
                  }}
                >
                  {course.name}
                </h2>

                {course.level && (
                  <p
                    style={{
                      margin: "0 0 6px",
                      fontWeight: 700,
                    }}
                  >
                    {course.level}
                  </p>
                )}

                <p
                  style={{
                    margin: "0 0 6px",
                    fontSize: "16px",
                  }}
                >
                  {course.start_date || "—"} —{" "}
                  {course.end_date || "—"}
                </p>

                {(course.modality ||
                  course.campus) && (
                  <p
                    style={{
                      margin: "0 0 6px",
                      color: "#555",
                    }}
                  >
                    {course.modality}

                    {course.modality &&
                    course.campus
                      ? " · "
                      : ""}

                    {course.campus}
                  </p>
                )}

                {course.days &&
                  course.days.length > 0 && (
                    <p
                      style={{
                        margin: 0,
                        color: "#555",
                      }}
                    >
                      {course.days.join(", ")}
                      {" · "}
                      {course.start_time || ""}
                      {" – "}
                      {course.end_time || ""}
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

        <a
          href="/admin/cursos/nuevo"
          style={{
            display: "block",
            width: "100%",
            marginTop: "35px",
            background: "#009c4b",
            color: "#fff",
            textDecoration: "none",
            textAlign: "center",
            padding: "19px",
            borderRadius: "30px",
            fontSize: "17px",
            fontWeight: 800,
            boxSizing: "border-box",
          }}
        >
          + Crear nuevo curso
        </a>

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

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
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
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <strong style={{ fontSize: "32px" }}>
        {value}
      </strong>
    </div>
  );
}