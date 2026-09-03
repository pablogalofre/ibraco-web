"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  organizer: string | null;
  contact_email: string | null;
};

const categories = [
  "Gastronomía",
  "Música",
  "Cine",
  "Taller",
  "Conferencia",
  "Fiesta",
  "Exposición",
  "Cultura",
  "Otro",
];

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyForm = {
  name: "",
  category: "Cultura",
  description: "",
  event_date: "",
  start_time: "",
  end_time: "",
  venue: "",
  address: "",
  price: "0",
  capacity: "100",
  image_url: "",
  registration_type: "paid",
  organizer: "",
  contact_email: "",
  status: "draft",
};

export default function AdminEventosPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editingEvent = useMemo(
    () => events.find((event) => event.id === editingId) ?? null,
    [events, editingId]
  );

   async function loadEvents() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.replace("/admin/login");
      return;
    }

    const { data: adminProfile, error: profileError } =
      await supabase
        .from("admin_profiles")
        .select("can_events, is_superadmin")
        .eq("user_id", session.user.id)
        .single();

    if (
      profileError ||
      !adminProfile ||
      (!adminProfile.can_events &&
        !adminProfile.is_superadmin)
    ) {
      router.replace("/admin");
      return;
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error cargando eventos:", error);
      alert("No fue posible cargar los eventos.");
      setLoading(false);
      return;
    }

    setEvents((data ?? []) as EventRow[]);
    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("La imagen debe ser JPG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede superar 5 MB.");
      event.target.value = "";
      return;
    }

    setUploadingImage(true);

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const baseName =
        slugify(form.name || "evento") || "evento";

      const fileName =
        `${baseName}-${Date.now()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("event-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        console.error(
          "Error subiendo imagen:",
          uploadError
        );
        alert("No fue posible subir la imagen.");
        return;
      }

      const { data: publicUrlData } =
        supabase.storage
          .from("event-images")
          .getPublicUrl(fileName);

      const publicUrl =
        publicUrlData.publicUrl;

      setForm((current) => ({
        ...current,
        image_url: publicUrl,
      }));
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(event: EventRow) {
    setEditingId(event.id);

    setForm({
      name: event.name ?? "",
      category: event.category ?? "Cultura",
      description: event.description ?? "",
      event_date: event.event_date ?? "",
      start_time:
        event.start_time?.slice(0, 5) ?? "",
      end_time:
        event.end_time?.slice(0, 5) ?? "",
      venue: event.venue ?? "",
      address: event.address ?? "",
      price: String(event.price ?? 0),
      capacity: String(event.capacity ?? 100),
      image_url: event.image_url ?? "",
      registration_type:
        event.registration_type ?? "paid",
      organizer: event.organizer ?? "",
      contact_email:
        event.contact_email ?? "",
      status: event.status ?? "draft",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveEvent(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert(
        "Debes escribir el nombre del evento."
      );
      return;
    }

    if (!form.event_date) {
      alert(
        "Debes seleccionar la fecha del evento."
      );
      return;
    }

    const price =
      form.registration_type === "free"
        ? 0
        : Number(form.price);

    const capacity = Number(form.capacity);

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {
      alert("El precio no es válido.");
      return;
    }

    if (
      !Number.isFinite(capacity) ||
      capacity <= 0
    ) {
      alert(
        "La capacidad debe ser mayor que 0."
      );
      return;
    }

    setSaving(true);

    const payload = {
      slug:
        editingEvent?.slug ||
        slugify(form.name),
      name: form.name.trim(),
      category: form.category,
      description:
        form.description.trim() || null,
      event_date: form.event_date,
      start_time:
        form.start_time || null,
      end_time:
        form.end_time || null,
      venue:
        form.venue.trim() || null,
      address:
        form.address.trim() || null,
      price,
      capacity,
      image_url:
        form.image_url.trim() || null,
      registration_type:
        form.registration_type,
      organizer:
        form.organizer.trim() || null,
      contact_email:
        form.contact_email.trim() || null,
      status: form.status,
    };

    let error;

    if (editingId) {
      const result = await supabase
        .from("events")
        .update(payload)
        .eq("id", editingId);

      error = result.error;
    } else {
      const result = await supabase
        .from("events")
        .insert(payload);

      error = result.error;
    }

    setSaving(false);

    if (error) {
      console.error(
        "Error guardando evento:",
        error
      );

      if (error.code === "23505") {
        alert(
          "Ya existe un evento con un nombre parecido. Cambia un poco el nombre."
        );
        return;
      }

      alert(
        "No fue posible guardar el evento."
      );
      return;
    }

    resetForm();
    await loadEvents();
  }

  async function toggleStatus(
    event: EventRow
  ) {
    const newStatus =
      event.status === "published"
        ? "draft"
        : "published";

    const { error } = await supabase
      .from("events")
      .update({
        status: newStatus,
      })
      .eq("id", event.id);

    if (error) {
      console.error(
        "Error cambiando estado:",
        error
      );
      alert(
        "No fue posible cambiar el estado."
      );
      return;
    }

    await loadEvents();
  }

  async function deleteEvent(
    event: EventRow
  ) {
    if (event.status === "published") {
      alert(
        "Primero debes despublicar el evento."
      );
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar "${event.name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    const {
      count,
      error: ordersError,
    } = await supabase
      .from("orders")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("event_id", event.id);

    if (ordersError) {
      console.error(
        "Error verificando órdenes del evento:",
        ordersError
      );

      alert(
        "No fue posible verificar si el evento tiene compras. No se eliminó nada."
      );

      return;
    }

    if ((count ?? 0) > 0) {
      alert(
        "Este evento ya tiene una compra asociada y no se puede eliminar."
      );
      return;
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id);

    if (error) {
      console.error(
        "Error eliminando evento:",
        error
      );
      alert(
        "No fue posible eliminar el evento."
      );
      return;
    }

    await loadEvents();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f5e9",
        padding: "40px 24px 80px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1380px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "35px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                color: "#009c4b",
                fontWeight: 900,
                fontSize: "14px",
                letterSpacing: "1px",
                marginBottom: "8px",
              }}
            >
              ADMINISTRACIÓN IBRACO
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "44px",
                lineHeight: 1,
              }}
            >
              Eventos
            </h1>

            <p
              style={{
                marginTop: "12px",
                color: "#555",
                fontSize: "17px",
              }}
            >
              Crea y administra la agenda
              cultural de IBRACO.
            </p>
          </div>

          <a
            href="/eventos"
            target="_blank"
            style={{
              background: "#111",
              color: "#fff",
              textDecoration: "none",
              padding: "14px 22px",
              borderRadius: "30px",
              fontWeight: 800,
            }}
          >
            Ver agenda pública
          </a>
        </div>

        <section
          style={{
            background: "#fff",
            borderRadius: "28px",
            padding: "36px",
            marginBottom: "45px",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "25px",
              fontSize: "28px",
            }}
          >
            {editingId
              ? `Editar: ${
                  editingEvent?.name ??
                  "evento"
                }`
              : "Nuevo evento"}
          </h2>

          <form onSubmit={saveEvent}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px",
              }}
            >
              <Field label="Nombre del evento">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Ej. Feijoada da Independência"
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="Categoría">
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  {categories.map(
                    (category) => (
                      <option
                        value={category}
                        key={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field label="Tipo de inscripción">
                <select
                  name="registration_type"
                  value={
                    form.registration_type
                  }
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="paid">
                    Evento pago
                  </option>
                  <option value="free">
                    Inscripción gratuita
                  </option>
                </select>
              </Field>

              <Field label="Estado">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="draft">
                    Borrador
                  </option>
                  <option value="published">
                    Publicado
                  </option>
                </select>
              </Field>

              <Field label="Fecha">
                <input
                  name="event_date"
                  type="date"
                  value={form.event_date}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </Field>

              <Field label="Hora inicio">
                <input
                  name="start_time"
                  type="time"
                  value={form.start_time}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Hora final">
                <input
                  name="end_time"
                  type="time"
                  value={form.end_time}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Cupo máximo">
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>

              <Field label="Precio por persona">
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  disabled={
                    form.registration_type ===
                    "free"
                  }
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    opacity:
                      form.registration_type ===
                      "free"
                        ? 0.5
                        : 1,
                  }}
                />
              </Field>

              <Field label="Lugar">
                <input
                  name="venue"
                  value={form.venue}
                  onChange={handleChange}
                  placeholder="Ej. Auditorio Vinicius de Moraes"
                  style={inputStyle}
                />
              </Field>

              <Field label="Dirección">
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Ej. Calle 104 No. 15-31"
                  style={inputStyle}
                />
              </Field>

              <Field label="Organizador">
                <input
                  name="organizer"
                  value={form.organizer}
                  onChange={handleChange}
                  placeholder="Ej. IBRACO & Prosa"
                  style={inputStyle}
                />
              </Field>

              <Field label="Correo de contacto">
                <input
                  name="contact_email"
                  type="email"
                  value={
                    form.contact_email
                  }
                  onChange={handleChange}
                  placeholder="cultural@ibraco.org.co"
                  style={inputStyle}
                />
              </Field>

              <Field label="Imagen del evento">
                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "inline-flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      minHeight: "48px",
                      borderRadius: "14px",
                      background: "#ffd600",
                      color: "#111",
                      fontWeight: 900,
                      cursor:
                        uploadingImage
                          ? "wait"
                          : "pointer",
                      padding:
                        "0 18px",
                    }}
                  >
                    {uploadingImage
                      ? "Subiendo..."
                      : form.image_url
                      ? "Cambiar imagen"
                      : "Seleccionar imagen"}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={
                        handleImageUpload
                      }
                      disabled={
                        uploadingImage
                      }
                      style={{
                        display: "none",
                      }}
                    />
                  </label>

                  {form.image_url && (
                    <>
                      <img
                        src={
                          form.image_url
                        }
                        alt="Vista previa del evento"
                        style={{
                          width: "100%",
                          maxHeight:
                            "360px",
                          objectFit:
                            "contain",
                          borderRadius:
                            "14px",
                          border:
                            "1px solid #eee",
                          background: "#f6f2e7",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setForm(
                            (current) => ({
                              ...current,
                              image_url:
                                "",
                            })
                          )
                        }
                        style={{
                          border:
                            "1px solid #ddd",
                          background:
                            "#fff",
                          color: "#555",
                          borderRadius:
                            "12px",
                          padding:
                            "10px 12px",
                          cursor:
                            "pointer",
                          fontWeight:
                            800,
                        }}
                      >
                        Quitar imagen
                      </button>
                    </>
                  )}
                </div>
              </Field>

              <Field label="URL de imagen (opcional)">
                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="También puedes pegar una URL"
                  style={inputStyle}
                />
              </Field>
            </div>

            <div
              style={{
                marginTop: "18px",
              }}
            >
              <Field label="Descripción">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe qué incluye el evento..."
                  style={{
                    ...inputStyle,
                    resize: "vertical",
                  }}
                />
              </Field>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "25px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={
                  saving ||
                  uploadingImage
                }
                style={{
                  background: "#009c4b",
                  color: "#fff",
                  border: 0,
                  padding: "15px 26px",
                  borderRadius: "30px",
                  fontWeight: 900,
                  fontSize: "15px",
                  cursor: "pointer",
                  opacity:
                    saving ||
                    uploadingImage
                      ? 0.6
                      : 1,
                }}
              >
                {saving
                  ? "Guardando..."
                  : editingId
                  ? "Guardar cambios"
                  : "Crear evento"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    background: "#eee",
                    color: "#111",
                    border: 0,
                    padding:
                      "15px 26px",
                    borderRadius:
                      "30px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <h2
            style={{
              fontSize: "30px",
              marginBottom: "22px",
            }}
          >
            Eventos creados
          </h2>

          {loading ? (
            <div>
              Cargando eventos...
            </div>
          ) : events.length === 0 ? (
            <div>
              No hay eventos creados.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "20px",
              }}
            >
              {events.map(
                (event) => (
                  <article
                    key={event.id}
                    style={{
                      background:
                        "#fff",
                      border: "1px solid #ece8dc",
                      boxShadow: "0 10px 28px rgba(0,0,0,0.04)",
                      borderRadius:
                        "24px",
                      padding: "24px",
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(0, 1fr) auto",
                      gap: "20px",
                      alignItems:
                        "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display:
                            "flex",
                          gap: "8px",
                          flexWrap:
                            "wrap",
                          marginBottom:
                            "10px",
                        }}
                      >
                        <span
                          style={{
                            background:
                              event.status ===
                              "published"
                                ? "#dff5e6"
                                : "#eee",
                            color:
                              event.status ===
                              "published"
                                ? "#087d3b"
                                : "#555",
                            padding:
                              "6px 10px",
                            borderRadius:
                              "20px",
                            fontWeight:
                              900,
                            fontSize:
                              "12px",
                          }}
                        >
                          {event.status ===
                          "published"
                            ? "PUBLICADO"
                            : "BORRADOR"}
                        </span>

                        <span
                          style={{
                            background:
                              "#fff5c2",
                            padding:
                              "6px 10px",
                            borderRadius:
                              "20px",
                            fontWeight:
                              800,
                            fontSize:
                              "12px",
                          }}
                        >
                          {event.category ??
                            "Cultura"}
                        </span>
                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "16px",
                        }}
                      >
                        {event.image_url && (
                          <img
                            src={
                              event.image_url
                            }
                            alt={
                              event.name
                            }
                            style={{
                              width:
                                "90px",
                              height:
                                "90px",
                              objectFit:
                                "contain",
                              borderRadius:
                                "14px",
                              flexShrink:
                                0,
                            }}
                          />
                        )}

                        <div>
                          <h3
                            style={{
                              margin:
                                "0 0 8px",
                              fontSize:
                                "25px",
                            }}
                          >
                            {
                              event.name
                            }
                          </h3>

                          <div
                            style={{
                              color:
                                "#555",
                              lineHeight:
                                1.6,
                            }}
                          >
                            {
                              event.event_date
                            }{" "}
                            ·{" "}
                            {event.start_time
                              ? event.start_time.slice(
                                  0,
                                  5
                                )
                              : "--:--"}
                            {event.end_time
                              ? ` – ${event.end_time.slice(
                                  0,
                                  5
                                )}`
                              : ""}
                            <br />

                            {event.venue ??
                              "Sin lugar"}{" "}
                            ·{" "}
                            {event.capacity ??
                              0}{" "}
                            cupos ·{" "}
                            {event.registration_type ===
                            "free"
                              ? "Gratuito"
                              : `$${Number(
                                  event.price ??
                                    0
                                ).toLocaleString(
                                  "es-CO"
                                )}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        gap: "10px",
                        flexWrap:
                          "wrap",
                        justifyContent:
                          "flex-end",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleStatus(
                            event
                          )
                        }
                        style={
                          actionButton
                        }
                      >
                        {event.status ===
                        "published"
                          ? "Despublicar"
                          : "Publicar"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            event
                          )
                        }
                        style={{
                          ...actionButton,
                          background:
                            "#ffd600",
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteEvent(
                            event
                          )
                        }
                        style={{
                          ...actionButton,
                          background:
                            "#fff",
                          color:
                            "#c62828",
                          border:
                            "1px solid #c62828",
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
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
    <label
      style={{
        display: "block",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 900,
          marginBottom: "7px",
          color: "#333",
        }}
      >
        {label}
      </div>

      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #ddd",
  borderRadius: "14px",
  padding: "13px 14px",
  fontSize: "15px",
  background: "#fff",
  color: "#111",
};

const actionButton: React.CSSProperties = {
  border: 0,
  borderRadius: "25px",
  padding: "12px 18px",
  fontWeight: 900,
  cursor: "pointer",
};