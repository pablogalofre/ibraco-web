"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

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
  capacity: number | null;
  status: string | null;
  image_url: string | null;
};

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadCourse() {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error || !data) {
        console.error(error);
        setMessage("No fue posible cargar el curso.");
        setLoading(false);
        return;
      }

      setCourse(data);
      setLoading(false);
    }

    loadCourse();
  }, [slug]);

  function updateField<K extends keyof Course>(
    field: K,
    value: Course[K]
  ) {
    if (!course) return;

    setCourse({
      ...course,
      [field]: value,
    });
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    if (!course) return;

    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "La imagen debe ser JPG, PNG o WebP."
      );
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setMessage(
        "La imagen no puede pesar más de 5 MB."
      );
      event.target.value = "";
      return;
    }

    setUploading(true);
    setMessage("");

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath =
      `${course.slug}/` +
      `course-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("course-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error(uploadError);
      setMessage("No fue posible subir la imagen.");
      setUploading(false);
      event.target.value = "";
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("course-images")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    setCourse({
      ...course,
      image_url: imageUrl,
    });

    setMessage(
      "Imagen cargada. Pulsa Guardar cambios para asignarla al curso."
    );

    setUploading(false);
    event.target.value = "";
  }

  async function saveChanges() {
    if (!course) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("courses")
      .update({
        name: course.name,
        cycle: course.cycle,
        year: course.year,
        shift: course.shift,
        modality: course.modality,
        campus: course.campus,
        start_date: course.start_date,
        end_date: course.end_date,
        days: course.days,
        start_time: course.start_time || null,
        end_time: course.end_time || null,
        level: course.level,
        price: course.price,
        capacity: course.capacity,
        status: course.status,
        image_url: course.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug);

    if (error) {
      console.error(error);
      setMessage("No fue posible guardar los cambios.");
      setSaving(false);
      return;
    }

    setMessage("Cambios guardados correctamente.");
    setSaving(false);

    router.refresh();
  }

  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #d8d8d8",
    fontSize: "16px",
    background: "#fff",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontWeight: 700,
    marginBottom: "7px",
    fontSize: "14px",
  };

  if (loading) {
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
            maxWidth: "1000px",
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
          padding: "50px 7%",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          Curso no encontrado.
        </div>
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
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <a
          href="/admin"
          style={{
            color: "#009c4b",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Volver a cursos
        </a>

        <div style={{ margin: "30px 0" }}>
          <div
            style={{
              color: "#009c4b",
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            {course.cycle}
          </div>

          <h1
            style={{
              fontSize: "40px",
              margin: "6px 0",
            }}
          >
            Editar curso
          </h1>

          <p
            style={{
              fontSize: "18px",
              margin: 0,
            }}
          >
            {course.name} · {course.shift}
          </p>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "24px",
            padding: "35px",
          }}
        >
          {/* IMAGEN DEL CURSO */}

          <div
            style={{
              marginBottom: "35px",
              paddingBottom: "35px",
              borderBottom: "1px solid #eee",
            }}
          >
            <label style={labelStyle}>
              Imagen del curso
            </label>

            <p
              style={{
                marginTop: 0,
                marginBottom: "18px",
                color: "#666",
                fontSize: "14px",
              }}
            >
              Sube una imagen JPG, PNG o WebP desde tu
              computador. Máximo 5 MB.
            </p>

            {course.image_url ? (
              <div
                style={{
                  width: "100%",
                  height: "330px",
                  borderRadius: "20px",
                  overflow: "hidden",
                  marginBottom: "20px",
                  background: "#f3f3f3",
                }}
              >
                <img
                  src={course.image_url}
                  alt={`Imagen de ${course.name}`}
                  style={{
                    width: "100%",
                    height: "100%",
                   objectFit: "contain",
background: "#f3f3f3",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "230px",
                  borderRadius: "20px",
                  marginBottom: "20px",
                  background: "#f3f3f3",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#777",
                  fontWeight: 700,
                }}
              >
                Este curso todavía no tiene imagen
              </div>
            )}

            <label
              style={{
                display: "inline-block",
                background: "#ffd800",
                color: "#000",
                borderRadius: "30px",
                padding: "14px 24px",
                fontWeight: 800,
                cursor: uploading
                  ? "wait"
                  : "pointer",
              }}
            >
              {uploading
                ? "Subiendo imagen..."
                : course.image_url
                ? "Cambiar imagen"
                : "Seleccionar imagen"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadImage}
                disabled={uploading}
                style={{
                  display: "none",
                }}
              />
            </label>
          </div>

          {/* DATOS DEL CURSO */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "25px",
            }}
          >
            <div>
              <label style={labelStyle}>
                Nombre del curso
              </label>

              <input
                style={inputStyle}
                value={course.name ?? ""}
                onChange={(e) =>
                  updateField("name", e.target.value)
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Ciclo
              </label>

              <input
                style={inputStyle}
                value={course.cycle ?? ""}
                onChange={(e) =>
                  updateField("cycle", e.target.value)
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Año
              </label>

              <input
                type="number"
                style={inputStyle}
                value={course.year ?? 2026}
                onChange={(e) =>
                  updateField(
                    "year",
                    Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Jornada
              </label>

              <select
                style={inputStyle}
                value={course.shift ?? ""}
                onChange={(e) =>
                  updateField("shift", e.target.value)
                }
              >
                <option value="">
                  Seleccionar
                </option>

                <option value="Mañana">
                  Mañana
                </option>

                <option value="Tarde">
                  Tarde
                </option>

                <option value="Noche">
                  Noche
                </option>

                <option value="Sábado">
                  Sábado
                </option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Modalidad
              </label>

              <select
                style={inputStyle}
                value={course.modality ?? ""}
                onChange={(e) =>
                  updateField(
                    "modality",
                    e.target.value
                  )
                }
              >
                <option value="">
                  Seleccionar
                </option>

                <option value="Presencial">
                  Presencial
                </option>

                <option value="Online">
                  Online
                </option>

                <option value="Híbrido">
                  Híbrido
                </option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>
                Sede
              </label>

              <input
                style={inputStyle}
                value={course.campus ?? ""}
                placeholder="Ej. Sede Centro"
                onChange={(e) =>
                  updateField(
                    "campus",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Fecha de inicio
              </label>

              <input
                type="date"
                style={inputStyle}
                value={course.start_date ?? ""}
                onChange={(e) =>
                  updateField(
                    "start_date",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Fecha de finalización
              </label>

              <input
                type="date"
                style={inputStyle}
                value={course.end_date ?? ""}
                onChange={(e) =>
                  updateField(
                    "end_date",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Hora de inicio
              </label>

              <input
                type="time"
                style={inputStyle}
                value={
                  course.start_time
                    ? course.start_time.slice(0, 5)
                    : ""
                }
                onChange={(e) =>
                  updateField(
                    "start_time",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Hora de finalización
              </label>

              <input
                type="time"
                style={inputStyle}
                value={
                  course.end_time
                    ? course.end_time.slice(0, 5)
                    : ""
                }
                onChange={(e) =>
                  updateField(
                    "end_time",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Nivel
              </label>

              <input
                style={inputStyle}
                value={course.level ?? ""}
                placeholder="Ej. A1"
                onChange={(e) =>
                  updateField(
                    "level",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Precio
              </label>

              <input
                type="number"
                style={inputStyle}
                value={course.price ?? 0}
                onChange={(e) =>
                  updateField(
                    "price",
                    Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Cupos
              </label>

              <input
                type="number"
                style={inputStyle}
                value={course.capacity ?? ""}
                placeholder="Ej. 20"
                onChange={(e) =>
                  updateField(
                    "capacity",
                    e.target.value === ""
                      ? null
                      : Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>
                Estado
              </label>

              <select
                style={inputStyle}
                value={
                  course.status ?? "draft"
                }
                onChange={(e) =>
                  updateField(
                    "status",
                    e.target.value
                  )
                }
              >
                <option value="draft">
                  Borrador
                </option>

                <option value="published">
                  Publicado
                </option>
              </select>
            </div>

            <div
              style={{
                gridColumn: "1 / -1",
              }}
            >
              <label style={labelStyle}>
                Días de clase
              </label>

              <input
                style={inputStyle}
                value={
                  Array.isArray(course.days)
                    ? course.days.join(", ")
                    : ""
                }
                placeholder="Ej. Martes, Jueves"
                onChange={(e) =>
                  updateField(
                    "days",
                    e.target.value
                      .split(",")
                      .map((day) => day.trim())
                      .filter(Boolean)
                  )
                }
              />
            </div>
          </div>

          {message && (
            <div
              style={{
                marginTop: "25px",
                padding: "14px 18px",
                borderRadius: "12px",
                background:
                  message.includes(
                    "correctamente"
                  ) ||
                  message.includes(
                    "Imagen cargada"
                  )
                    ? "#e8f7ee"
                    : "#fdecec",
                color:
                  message.includes(
                    "correctamente"
                  ) ||
                  message.includes(
                    "Imagen cargada"
                  )
                    ? "#087a3e"
                    : "#9a1f1f",
                fontWeight: 700,
              }}
            >
              {message}
            </div>
          )}

          <div
            style={{
              borderTop: "1px solid #eee",
              marginTop: "35px",
              paddingTop: "25px",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            <a
              href="/admin"
              style={{
                padding: "15px 25px",
                borderRadius: "30px",
                border: "1px solid #ccc",
                color: "#111",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Cancelar
            </a>

            <button
              type="button"
              onClick={saveChanges}
              disabled={saving || uploading}
              style={{
                background:
                  saving || uploading
                    ? "#86cfa7"
                    : "#009c4b",
                color: "#fff",
                border: "none",
                padding: "15px 28px",
                borderRadius: "30px",
                fontWeight: 800,
                fontSize: "15px",
                cursor:
                  saving || uploading
                    ? "wait"
                    : "pointer",
              }}
            >
              {saving
                ? "Guardando..."
                : "Guardar cambios"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}