"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type NewCourse = {
  name: string;
  cycle: string;
  year: number;
  campus: string;
  days: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  course_type: string;
  price: number;
  capacity: number | null;
  status: "draft" | "published";
  image_url: string | null;
};

const initialCourse: NewCourse = {
  name: "",
  cycle: "",
  year: 2026,
  campus: "",
  days: "",
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  course_type: "",
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

/*
 * Conservamos "shift" en Supabase por compatibilidad
 * con el resto de la tienda, pero ya no se lo pedimos
 * al administrador.
 */
function inferShift(startTime: string) {
  if (!startTime) return "";

  const hour = Number(startTime.split(":")[0]);

  if (hour < 12) return "Mañana";
  if (hour < 17) return "Tarde";

  return "Noche";
}

export default function NewCoursePage() {
  const router = useRouter();
  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/admin/login");
      }
    }

    checkSession();
  }, [router]);
  const [course, setCourse] =
    useState<NewCourse>(initialCourse);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [messageType, setMessageType] =
    useState<"success" | "error">("success");

  function updateField<K extends keyof NewCourse>(
    field: K,
    value: NewCourse[K]
  ) {
    setCourse((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function showError(text: string) {
    setMessageType("error");
    setMessage(text);
  }

  function showSuccess(text: string) {
    setMessageType("success");
    setMessage(text);
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
      showError(
        "La imagen debe estar en formato JPG, PNG o WebP."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError(
        "La imagen no puede pesar más de 5 MB."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() || "jpg";

      const baseSlug =
        makeSlug(course.name) || "curso";

      const filePath =
        `${baseSlug}/course-${Date.now()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("course-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        console.error(
          "ERROR SUBIENDO IMAGEN:",
          uploadError
        );

        showError(
          "No fue posible subir la imagen."
        );

        return;
      }

      const { data } = supabase.storage
        .from("course-images")
        .getPublicUrl(filePath);

      setCourse((current) => ({
        ...current,
        image_url: data.publicUrl,
      }));

      showSuccess(
        "Imagen cargada correctamente."
      );
    } catch (error) {
      console.error(error);

      showError(
        "No fue posible subir la imagen."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) return;

    const cleanName = course.name.trim();
    const cleanCycle = course.cycle.trim();

    if (!cleanName) {
      showError(
        "Debes escribir el nombre del curso."
      );
      return;
    }

    if (!cleanCycle) {
      showError("Debes indicar el ciclo.");
      return;
    }

    if (!course.course_type) {
      showError(
        "Debes seleccionar el tipo de curso."
      );
      return;
    }

    if (!course.days) {
      showError(
        "Debes seleccionar los días de clase."
      );
      return;
    }

    if (!course.campus) {
      showError("Debes seleccionar la sede.");
      return;
    }

    if (!course.start_date) {
      showError(
        "Debes seleccionar la fecha de inicio."
      );
      return;
    }

    if (!course.end_date) {
      showError(
        "Debes seleccionar la fecha de finalización."
      );
      return;
    }

    if (course.end_date < course.start_date) {
      showError(
        "La fecha de finalización no puede ser anterior a la fecha de inicio."
      );
      return;
    }

    if (!course.start_time) {
      showError(
        "Debes seleccionar la hora de inicio."
      );
      return;
    }

    if (!course.end_time) {
      showError(
        "Debes seleccionar la hora de finalización."
      );
      return;
    }

    if (course.end_time <= course.start_time) {
      showError(
        "La hora de finalización debe ser posterior a la hora de inicio."
      );
      return;
    }

    if (course.price < 0) {
      showError(
        "El precio no puede ser negativo."
      );
      return;
    }

    const generatedSlug = makeSlug(
      [
        cleanName,
        cleanCycle,
        course.course_type,
        course.days,
        course.campus,
        course.start_time,
        course.year,
        course.start_date,
      ].join("-")
    );

    const inferredModality =
      course.campus === "Virtual"
        ? "Virtual"
        : "Presencial";

    const inferredShift =
      inferShift(course.start_time);

    try {
      setSaving(true);
      setMessage("");

      const { data, error } = await supabase
        .from("courses")
        .insert({
          slug: generatedSlug,
          name: cleanName,
          cycle: cleanCycle,
          year: course.year,

          /*
           * Campos existentes de Supabase:
           * level = Tipo de curso
           * shift = calculado por hora
           */
          level: course.course_type,
          shift: inferredShift,

          modality: inferredModality,
          campus: course.campus,

          /*
           * Guardamos days como arreglo para mantener
           * compatibilidad con la estructura existente.
           */
          days: [course.days],

          start_date: course.start_date,
          end_date: course.end_date,
          start_time: course.start_time,
          end_time: course.end_time,

          price: course.price,
          capacity: course.capacity,
          status: course.status,
          image_url: course.image_url,
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error(
          "ERROR CREANDO CURSO:",
          error
        );

        if (
          error?.message
            ?.toLowerCase()
            .includes("duplicate")
        ) {
          showError(
            "Ya existe un curso con estos datos. Revisa ciclo, días, sede, horario o fecha."
          );
        } else {
          showError(
            error?.message ||
              "No fue posible crear el curso."
          );
        }

        return;
      }

      router.push(
        `/admin/cursos/${data.id}`
      );
    } catch (error) {
      console.error(error);

      showError(
        "No fue posible crear el curso."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <main className="new-course-page">
        <div className="new-course-shell">
          <a
            href="/admin"
            className="back-link"
          >
            ← Volver al administrador
          </a>

          <header className="page-heading">
            <div className="eyebrow">
              Administración IBRACO
            </div>

            <h1>Crear nuevo curso</h1>

            <p>
              Crea una nueva apertura indicando
              tipo de curso, días, sede, fechas
              y horario.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="course-form"
          >
            {/* IMAGEN */}

            <section className="image-section">
              <label className="field-label">
                Imagen del curso
              </label>

              <p className="field-help">
                JPG, PNG o WebP. Máximo 5 MB.
              </p>

              {course.image_url ? (
                <div className="image-preview">
                  <img
                    src={course.image_url}
                    alt="Imagen del curso"
                  />
                </div>
              ) : (
                <div className="empty-image">
                  Sin imagen
                </div>
              )}

              <label className="upload-button">
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
                />
              </label>
            </section>

            {/* DATOS */}

            <div className="form-grid">
              <Field label="Nombre del curso *">
                <input
                  required
                  value={course.name}
                  onChange={(e) =>
                    updateField(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Ej. Portugués"
                />
              </Field>

              <Field label="Ciclo *">
                <input
                  required
                  value={course.cycle}
                  onChange={(e) =>
                    updateField(
                      "cycle",
                      e.target.value
                    )
                  }
                  placeholder="Ej. Ciclo 7"
                />
              </Field>

              <Field label="Año *">
                <input
                  required
                  type="number"
                  min="2026"
                  value={course.year}
                  onChange={(e) =>
                    updateField(
                      "year",
                      Number(e.target.value)
                    )
                  }
                />
              </Field>

              <Field label="Tipo de curso *">
                <select
                  required
                  value={course.course_type}
                  onChange={(e) =>
                    updateField(
                      "course_type",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Seleccionar
                  </option>

                  <option value="Intensivo">
                    Intensivo
                  </option>

                  <option value="Semi-intensivo">
                    Semi-intensivo
                  </option>
                </select>
              </Field>

              <Field label="Días de clase *">
                <select
                  required
                  value={course.days}
                  onChange={(e) =>
                    updateField(
                      "days",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Seleccionar
                  </option>

                  <option value="Lunes a viernes">
                    Lunes a viernes
                  </option>

                  <option value="Lunes a jueves">
                    Lunes a jueves
                  </option>

                  <option value="Lunes y miércoles">
                    Lunes y miércoles
                  </option>

                  <option value="Martes y jueves">
                    Martes y jueves
                  </option>

                  <option value="Miércoles y viernes">
                    Miércoles y viernes
                  </option>

                  <option value="Sábado">
                    Sábado
                  </option>
                </select>
              </Field>

              <Field label="Sede *">
                <select
                  required
                  value={course.campus}
                  onChange={(e) =>
                    updateField(
                      "campus",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Seleccionar
                  </option>

                  <option value="Cualquier sede">
                    Cualquier sede
                  </option>

                  <option value="Sede Centro">
                    Sede Centro
                  </option>

                  <option value="Sede Norte">
                    Sede Norte
                  </option>

                  <option value="Virtual">
                    Virtual
                  </option>
                </select>
              </Field>

              <Field label="Cupos">
                <input
                  type="number"
                  min="0"
                  value={
                    course.capacity ?? ""
                  }
                  onChange={(e) =>
                    updateField(
                      "capacity",
                      e.target.value === ""
                        ? null
                        : Number(
                            e.target.value
                          )
                    )
                  }
                  placeholder="Ej. 20"
                />
              </Field>

              <Field label="Fecha de inicio *">
                <input
                  required
                  type="date"
                  value={course.start_date}
                  onChange={(e) =>
                    updateField(
                      "start_date",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Fecha de finalización *">
                <input
                  required
                  type="date"
                  value={course.end_date}
                  onChange={(e) =>
                    updateField(
                      "end_date",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Hora de inicio *">
                <input
                  required
                  type="time"
                  value={course.start_time}
                  onChange={(e) =>
                    updateField(
                      "start_time",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Hora de finalización *">
                <input
                  required
                  type="time"
                  value={course.end_time}
                  onChange={(e) =>
                    updateField(
                      "end_time",
                      e.target.value
                    )
                  }
                />
              </Field>

              <Field label="Precio COP *">
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={course.price}
                  onChange={(e) =>
                    updateField(
                      "price",
                      Number(e.target.value)
                    )
                  }
                />
              </Field>

              <Field
                label="Estado"
                helper="Borrador no aparece en la tienda. Publicado sí aparece."
              >
                <select
                  value={course.status}
                  onChange={(e) =>
                    updateField(
                      "status",
                      e.target.value as
                        | "draft"
                        | "published"
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
              </Field>
            </div>

            {message && (
              <div
                className={`message ${
                  messageType === "error"
                    ? "message-error"
                    : "message-success"
                }`}
              >
                {message}
              </div>
            )}

            <div className="form-actions">
              <a
                href="/admin"
                className="cancel-button"
              >
                Cancelar
              </a>

              <button
                type="submit"
                disabled={
                  saving || uploading
                }
                className="save-button"
              >
                {saving
                  ? "Creando curso..."
                  : course.status ===
                      "published"
                    ? "Crear y publicar"
                    : "Guardar borrador"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .new-course-page {
          min-height: 100vh;
          background: #f8f5e9;
          padding: 50px 7%;
          font-family: Arial, sans-serif;
          color: #111;
        }

        .new-course-shell {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
        }

        .back-link {
          color: #009c4b;
          font-weight: 800;
          text-decoration: none;
        }

        .page-heading {
          margin: 30px 0;
        }

        .eyebrow {
          color: #009c4b;
          font-weight: 900;
          text-transform: uppercase;
          font-size: 14px;
        }

        .page-heading h1 {
          margin: 7px 0 10px;
          font-size: 42px;
          line-height: 1;
        }

        .page-heading p {
          margin: 0;
          color: #555;
          font-size: 17px;
          line-height: 1.5;
          max-width: 650px;
        }

        .course-form {
          background: #fff;
          border-radius: 24px;
          padding: 35px;
        }

        .image-section {
          margin-bottom: 35px;
          padding-bottom: 35px;
          border-bottom: 1px solid #eee;
        }

        .field-label {
          display: block;
          font-weight: 800;
          font-size: 14px;
          margin-bottom: 7px;
        }

        .field-help {
          margin: 0 0 15px;
          color: #777;
          font-size: 13px;
          line-height: 1.4;
        }

        .image-preview,
        .empty-image {
          width: 100%;
          height: 320px;
          background: #f3f3f3;
          border-radius: 20px;
          margin-bottom: 18px;
        }

        .image-preview {
          overflow: hidden;
        }

        .image-preview img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
        }

        .empty-image {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #777;
          font-weight: 700;
        }

        .upload-button {
          display: inline-block;
          background: #ffd800;
          color: #111;
          padding: 14px 24px;
          border-radius: 999px;
          font-weight: 800;
          cursor: pointer;
        }

        .upload-button input {
          display: none;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 22px;
        }

        .field {
          min-width: 0;
        }

        .field input,
        .field select {
          width: 100%;
          min-width: 0;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #d8d8d8;
          background: #fff;
          color: #111;
          font-size: 16px;
        }

        .field input:focus,
        .field select:focus {
          outline: 2px solid
            rgba(0, 156, 75, 0.16);
          border-color: #009c4b;
        }

        .message {
          margin-top: 24px;
          padding: 14px 18px;
          border-radius: 12px;
          font-weight: 700;
          line-height: 1.45;
        }

        .message-success {
          background: #eef7f1;
          color: #087a3e;
        }

        .message-error {
          background: #fdecec;
          color: #a2251b;
        }

        .form-actions {
          border-top: 1px solid #eee;
          margin-top: 35px;
          padding-top: 25px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .cancel-button {
          padding: 15px 25px;
          border-radius: 999px;
          border: 1px solid #ccc;
          color: #111;
          text-decoration: none;
          font-weight: 700;
        }

        .save-button {
          background: #009c4b;
          color: #fff;
          border: none;
          padding: 15px 28px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
        }

        .save-button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        @media (max-width: 700px) {
          .new-course-page {
            padding: 28px 16px 50px;
          }

          .page-heading h1 {
            font-size: 34px;
          }

          .course-form {
            padding: 22px 16px;
            border-radius: 20px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .image-preview,
          .empty-image {
            height: 220px;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .cancel-button,
          .save-button {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
}

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label className="field-label">
        {label}
      </label>

      {helper && (
        <p className="field-help">
          {helper}
        </p>
      )}

      {children}
    </div>
  );
}