"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type NewCourse = {
  slug: string;
  name: string;
  cycle: string;
  year: number;
  shift: string;
  modality: string;
  campus: string;
  start_date: string;
  end_date: string;
  days: string[];
  start_time: string;
  end_time: string;
  level: string;
  price: number;
  capacity: number | null;
  status: string;
  image_url: string | null;
};

const initialCourse: NewCourse = {
  slug: "",
  name: "",
  cycle: "",
  year: 2026,
  shift: "",
  modality: "",
  campus: "",
  start_date: "",
  end_date: "",
  days: [],
  start_time: "",
  end_time: "",
  level: "",
  price: 0,
  capacity: null,
  status: "draft",
  image_url: null,
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function NewCoursePage() {
  const router = useRouter();

  const [course, setCourse] = useState<NewCourse>(initialCourse);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  function updateField<K extends keyof NewCourse>(
    field: K,
    value: NewCourse[K]
  ) {
    setCourse((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateName(value: string) {
    setCourse((current) => ({
      ...current,
      name: value,
      slug: current.slug || makeSlug(value),
    }));
  }

  async function uploadImage(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage("La imagen debe ser JPG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("La imagen no puede pesar más de 5 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const baseSlug =
        course.slug || makeSlug(course.name) || "curso";

      const filePath =
        `${baseSlug}/course-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("course-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("ERROR SUBIENDO IMAGEN:", uploadError);
        setMessage("No fue posible subir la imagen.");
        return;
      }

      const { data } = supabase.storage
        .from("course-images")
        .getPublicUrl(filePath);

      setCourse((current) => ({
        ...current,
        image_url: data.publicUrl,
      }));

      setMessage("Imagen cargada correctamente.");
    } catch (error) {
      console.error(error);
      setMessage("No fue posible subir la imagen.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!course.name.trim()) {
      setMessage("Debes escribir el nombre del curso.");
      return;
    }

    if (!course.slug.trim()) {
      setMessage("Debes definir el slug del curso.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const { data, error } = await supabase
        .from("courses")
        .insert({
          slug: course.slug,
          name: course.name,
          cycle: course.cycle || null,
          year: course.year,
          shift: course.shift || null,
          modality: course.modality || null,
          campus: course.campus || null,
          start_date: course.start_date || null,
          end_date: course.end_date || null,
          days: course.days,
          start_time: course.start_time || null,
          end_time: course.end_time || null,
          level: course.level || null,
          price: course.price,
          capacity: course.capacity,
          status: course.status,
          image_url: course.image_url,
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error("ERROR CREANDO CURSO:", error);
        setMessage(
          error?.message ||
            "No fue posible crear el curso."
        );
        return;
      }

      router.push(`/admin/cursos/${data.id}`);
    } catch (error) {
      console.error(error);
      setMessage("No fue posible crear el curso.");
    } finally {
      setSaving(false);
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
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          ← Volver al administrador
        </a>

        <div style={{ margin: "30px 0" }}>
          <div
            style={{
              color: "#009c4b",
              fontWeight: 900,
              textTransform: "uppercase",
              fontSize: "14px",
            }}
          >
            Administración IBRACO
          </div>

          <h1
            style={{
              margin: "7px 0 10px",
              fontSize: "42px",
              lineHeight: 1,
            }}
          >
            Crear nuevo curso
          </h1>

          <p
            style={{
              margin: 0,
              color: "#555",
              fontSize: "17px",
            }}
          >
            Completa la información y publícalo cuando esté listo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            borderRadius: "24px",
            padding: "35px",
          }}
        >
          <div
            style={{
              marginBottom: "35px",
              paddingBottom: "35px",
              borderBottom: "1px solid #eee",
            }}
          >
            <label style={labelStyle}>Imagen del curso</label>

            {course.image_url ? (
              <div
                style={{
                  width: "100%",
                  height: "320px",
                  background: "#f3f3f3",
                  borderRadius: "20px",
                  overflow: "hidden",
                  marginBottom: "18px",
                }}
              >
                <img
                  src={course.image_url}
                  alt="Imagen del curso"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "220px",
                  background: "#f3f3f3",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#777",
                  fontWeight: 700,
                  marginBottom: "18px",
                }}
              >
                Sin imagen
              </div>
            )}

            <label
              style={{
                display: "inline-block",
                background: "#ffd800",
                color: "#111",
                padding: "14px 24px",
                borderRadius: "999px",
                fontWeight: 800,
                cursor: uploading ? "wait" : "pointer",
              }}
            >
              {uploading
                ? "Subiendo..."
                : course.image_url
                  ? "Cambiar imagen"
                  : "Seleccionar imagen"}

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadImage}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "22px",
            }}
          >
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input
                required
                style={inputStyle}
                value={course.name}
                onChange={(e) =>
                  updateName(e.target.value)
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Slug *</label>
              <input
                required
                style={inputStyle}
                value={course.slug}
                onChange={(e) =>
                  updateField(
                    "slug",
                    makeSlug(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Ciclo</label>
              <input
                style={inputStyle}
                value={course.cycle}
                onChange={(e) =>
                  updateField("cycle", e.target.value)
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Año</label>
              <input
                type="number"
                style={inputStyle}
                value={course.year}
                onChange={(e) =>
                  updateField(
                    "year",
                    Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Jornada</label>
              <select
                style={inputStyle}
                value={course.shift}
                onChange={(e) =>
                  updateField("shift", e.target.value)
                }
              >
                <option value="">Seleccionar</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
                
              </select>
            </div>

            <div>
              <label style={labelStyle}>Modalidad</label>
              <select
                style={inputStyle}
                value={course.modality}
                onChange={(e) =>
                  updateField(
                    "modality",
                    e.target.value
                  )
                }
              >
                <option value="">Seleccionar</option>
                <option value="Presencial">
                  Presencial
                </option>
                <option value="Virtual">Virtual</option>
               <option value="Virtual">Virtual</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Sede</label>
              <input
                style={inputStyle}
                value={course.campus}
                onChange={(e) =>
                  updateField("campus", e.target.value)
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Nivel</label>
              <input
                style={inputStyle}
                value={course.level}
                onChange={(e) =>
                  updateField("level", e.target.value)
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
                value={course.start_date}
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
                value={course.end_date}
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
                value={course.start_time}
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
                value={course.end_time}
                onChange={(e) =>
                  updateField(
                    "end_time",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Precio</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                value={course.price}
                onChange={(e) =>
                  updateField(
                    "price",
                    Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label style={labelStyle}>Cupos</label>
              <input
                type="number"
                min="0"
                style={inputStyle}
                value={course.capacity ?? ""}
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

           <div
  style={{
    gridColumn: "1 / -1",
  }}
>
 
</div>
            <div>
              <label style={labelStyle}>Estado</label>
              <select
                style={inputStyle}
                value={course.status}
                onChange={(e) =>
                  updateField("status", e.target.value)
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
          </div>

          {message && (
            <div
              style={{
                marginTop: "24px",
                padding: "14px 18px",
                borderRadius: "12px",
                background: "#eef7f1",
                color: "#087a3e",
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
              flexWrap: "wrap",
            }}
          >
            <a
              href="/admin"
              style={{
                padding: "15px 25px",
                borderRadius: "999px",
                border: "1px solid #ccc",
                color: "#111",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Cancelar
            </a>

            <button
              type="submit"
              disabled={saving || uploading}
              style={{
                background: "#009c4b",
                color: "#fff",
                border: "none",
                padding: "15px 28px",
                borderRadius: "999px",
                fontWeight: 800,
                fontSize: "15px",
                cursor:
                  saving || uploading
                    ? "wait"
                    : "pointer",
                opacity:
                  saving || uploading ? 0.7 : 1,
              }}
            >
              {saving
                ? "Creando curso..."
                : "Crear curso"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}