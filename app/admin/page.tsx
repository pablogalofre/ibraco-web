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
  image_url: string | null;
};

function normalizeCourseName(name: string | null) {
  if (!name) return "Portugués";

  return name
    .replace(/Português/gi, "Portugués")
    .replace(/Portugues/gi, "Portugués");
}

function buildCourseTitle(course: Course) {
  const parts = [
    normalizeCourseName(course.name),
    course.modality,
    course.campus,
    course.shift,
  ].filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  );

  return parts.join(" · ");
}

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
        console.error("Error cargando cursos:", error);
      }

      setCourses(data ?? []);
      setLoading(false);
    }

    loadAdmin();
  }, [router]);

  async function toggleCourseStatus(course: Course) {
    const newStatus =
      course.status === "published" ? "draft" : "published";

    const { error } = await supabase
      .from("courses")
      .update({ status: newStatus })
      .eq("id", course.id);

    if (error) {
      console.error("Error actualizando estado del curso:", error);
      alert("No fue posible cambiar el estado del curso.");
      return;
    }

    setCourses((currentCourses) =>
      currentCourses.map((item) =>
        item.id === course.id
          ? { ...item, status: newStatus }
          : item
      )
    );
  }

  async function deleteCourse(course: Course) {
    if (course.status === "published") {
      alert(
        "Primero debes despublicar este curso antes de eliminarlo."
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${normalizeCourseName(
        course.name
      )}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    const { count, error: ordersError } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("course_id", course.id);

    if (ordersError) {
      console.error(
        "Error verificando órdenes del curso:",
        ordersError
      );
      alert(
        "No fue posible verificar si el curso tiene compras. No se eliminó nada."
      );
      return;
    }

    if ((count ?? 0) > 0) {
      alert(
        "Este curso ya tiene una compra u orden asociada y no se puede eliminar."
      );
      return;
    }

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", course.id);

    if (error) {
      console.error("Error eliminando curso:", error);
      alert("No fue posible eliminar el curso.");
      return;
    }

    setCourses((currentCourses) =>
      currentCourses.filter((item) => item.id !== course.id)
    );
  }

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
              Administra ciclos, horarios, precios y disponibilidad.
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
                (course) => course.status === "published"
              ).length
            }
          />

          <SummaryCard
            label="BORRADORES"
            value={
              courses.filter(
                (course) => course.status === "draft"
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
          {courses.map((course) => {
            const courseTitle = buildCourseTitle(course);

            return (
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    flex: "1",
                  }}
                >
                  {course.image_url && (
                    <img
                      src={course.image_url}
                      alt={courseTitle || "Curso"}
                      style={{
                        width: "110px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "12px",
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <div style={{ flex: 1 }}>
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
                          textTransform: "uppercase",
                        }}
                      >
                        {course.cycle}
                      </span>

                      <span
                        style={{
                          background:
                            course.status === "published"
                              ? "#dff5e8"
                              : "#eee",
                          color:
                            course.status === "published"
                              ? "#007b3d"
                              : "#555",
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
                        margin: "0 0 8px",
                        fontSize: "27px",
                        lineHeight: 1.15,
                      }}
                    >
                      {courseTitle}
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
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexShrink: 0,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      toggleCourseStatus(course)
                    }
                    style={{
                      background:
                        course.status === "published"
                          ? "#fff"
                          : "#009c4b",
                      color:
                        course.status === "published"
                          ? "#111"
                          : "#fff",
                      border:
                        course.status === "published"
                          ? "1px solid #ccc"
                          : "1px solid #009c4b",
                      padding: "14px 20px",
                      borderRadius: "30px",
                      fontSize: "14px",
                      fontWeight: 800,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    {course.status === "published"
                      ? "Despublicar"
                      : "Publicar"}
                  </button>

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

                  <button
                    type="button"
                    onClick={() => deleteCourse(course)}
                    style={{
                      background: "#fff",
                      color: "#c62828",
                      border: "1px solid #c62828",
                      padding: "14px 20px",
                      borderRadius: "30px",
                      fontSize: "14px",
                      fontWeight: 800,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
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