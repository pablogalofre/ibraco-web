
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  cover_image_url: string | null;
  seo_title: string | null;
  meta_description: string | null;
  status: "draft" | "published";
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
};

type Access = "loading" | "allowed" | "denied";

const CATEGORIES = [
  "Aprender portugués",
  "Celpe-Bras",
  "Cultura brasileña",
  "Portugués para negocios",
  "Estudiar y viajar",
  "Comunidad IBRACO",
];


const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  border: "1px solid #e3e3df",
  borderRadius: 12,
  background: "#fff",
  color: "#111",
  font: "inherit",
  fontSize: 15,
  lineHeight: 1.5,
  boxSizing: "border-box",
  outlineColor: "#009c4b",
};
;


const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 700,
  fontSize: 14,
  marginBottom: 8,
  color: "#292929",
};


function makeSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function BlogAdminPage() {
  const router = useRouter();

  const [access, setAccess] = useState<Access>("loading");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notice, setNotice] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [coverImage, setCoverImage] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setPosts((data ?? []) as Post[]);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!active) return;

        if (authError || !user) {
          router.replace("/admin/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("admin_profiles")
          .select("can_content, is_superadmin")
          .eq("user_id", user.id)
          .single();

        if (!active) return;

        if (
          profileError ||
          !profile ||
          (!profile.can_content && !profile.is_superadmin)
        ) {
          setAccess("denied");
          return;
        }

        setAccess("allowed");
        await loadPosts();
      } catch (err) {
        if (active) {
          setErrorMessage(
            err instanceof Error ? err.message : "Error cargando artículos."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, [router, loadPosts]);

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setExcerpt("");
    setContent("");
    setCategory(CATEGORIES[0]);
    setCoverImage("");
    setSeoTitle("");
    setMetaDescription("");
    setFeatured(false);
    setStatus("draft");
    setPublishedAt(null);
    setNotice("");
    setErrorMessage("");
  }

  function editPost(post: Post) {
    setEditingId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt ?? "");
    setContent(post.content ?? "");
    setCategory(post.category ?? CATEGORIES[0]);
    setCoverImage(post.cover_image_url ?? "");
    setSeoTitle(post.seo_title ?? "");
    setMetaDescription(post.meta_description ?? "");
    setFeatured(post.is_featured);
    setStatus(post.status);
    setPublishedAt(post.published_at);
    setNotice("");
    setErrorMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function savePost(nextStatus: "draft" | "published") {
    if (saving) return;

    setErrorMessage("");
    setNotice("");

    const cleanTitle = title.trim();
    const cleanSlug = makeSlug(slug || title);

    if (!cleanTitle || !cleanSlug) {
      setErrorMessage("El título y la URL del artículo son obligatorios.");
      return;
    }

    if (!content.trim()) {
      setErrorMessage("Escribe el contenido del artículo.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: cleanTitle,
        slug: cleanSlug,
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        category,
        cover_image_url: coverImage.trim() || null,
        seo_title: seoTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        is_featured: featured,
        status: nextStatus,
        published_at:
          nextStatus === "published"
            ? publishedAt ?? new Date().toISOString()
            : null,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          throw new Error("Tu sesión ha expirado. Ingresa nuevamente.");
        }

        const { error } = await supabase.from("blog_posts").insert({
          ...payload,
          created_by: user.id,
        });

        if (error) throw error;
      }

      await loadPosts();
      resetForm();

      setNotice(
        nextStatus === "published"
          ? "Artículo publicado en Supabase. Falta conectarlo con el blog público."
          : "Borrador guardado correctamente."
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "No se pudo guardar el artículo."
      );
    } finally {
      setSaving(false);
    }
  }

  if (access === "loading") {
    return <main style={{ padding: 48 }}>Verificando permisos...</main>;
  }

  if (access === "denied") {
    return (
      <main style={{ padding: 48 }}>
        <h1>Acceso no autorizado</h1>
        <p>No tienes permiso para administrar el blog.</p>
        <Link href="/admin">Volver al administrador</Link>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8f5e9",
        padding: "110px 5% 80px",
        color: "#111",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link
          href="/admin/contenidos"
          style={{ color: "#087c40", fontWeight: 800 }}
        >
          ← Volver a SEO
        </Link>

        <p
          style={{
            color: "#087c40",
            fontWeight: 800,
            marginTop: 32,
          }}
        >
          MARKETING Y CONTENIDOS
        </p>

        <h1
  style={{
    fontSize: "clamp(28px, 3.5vw, 42px)",
    lineHeight: 1.15,
    margin: "12px 0 18px",
    letterSpacing: "-0.03em",
  }}
>
          Artículos del blog
        </h1>

        <p>
          Crea, edita y publica contenido para el blog de IBRACO.
        </p>

        {notice && (
          <p
            role="status"
            style={{
              background: "#e7f7eb",
              color: "#08682e",
              padding: 15,
              borderRadius: 10,
            }}
          >
            {notice}
          </p>
        )}

        {errorMessage && (
          <p
            role="alert"
            style={{
              background: "#fff0ed",
              color: "#9b2419",
              padding: 15,
              borderRadius: 10,
            }}
          >
            {errorMessage}
          </p>
        )}

        <section
          style={{
            background: "#fff",
            padding: "clamp(20px, 4vw, 36px)",
            borderRadius: 20,
            marginTop: 28,
          }}
        >
          <h2>{editingId ? "Editar artículo" : "Nuevo artículo"}</h2>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void savePost("draft");
            }}
            style={{ display: "grid", gap: 20 }}
          >
            <div>
              <label htmlFor="blog-title" style={labelStyle}>
                Título del artículo *
              </label>
              <input
                id="blog-title"
                value={title}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  if (!editingId && slug === makeSlug(title)) {
                    setSlug(makeSlug(nextTitle));
                  }
                  setTitle(nextTitle);
                }}
                style={inputStyle}
                maxLength={180}
                placeholder="Ej. Cómo aprender portugués desde cero"
              />
            </div>

            <div>
              <label htmlFor="blog-slug" style={labelStyle}>
                URL del artículo *
              </label>
              <input
                id="blog-slug"
                value={slug}
                onChange={(event) => setSlug(makeSlug(event.target.value))}
                style={inputStyle}
                placeholder="como-aprender-portugues"
              />
              <small>
                Dirección prevista: /blog/{slug || "nombre-del-articulo"}
              </small>
            </div>

            <div>
              <label htmlFor="blog-category" style={labelStyle}>
                Categoría
              </label>
              <select
                id="blog-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                style={inputStyle}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="blog-excerpt" style={labelStyle}>
                Resumen
              </label>
              <textarea
                id="blog-excerpt"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={3}
                style={inputStyle}
                placeholder="Breve presentación del artículo"
              />
            </div>

            <div>
              <label htmlFor="blog-content" style={labelStyle}>
                Contenido del artículo *
              </label>
              <textarea
                id="blog-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={15}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  lineHeight: 1.7,
                }}
                placeholder="Escribe aquí el artículo..."
              />
              <small>
                Primera versión: editor de texto. Más adelante añadiremos
                formato enriquecido e imágenes dentro del artículo.
              </small>
            </div>

            <div>
              <label htmlFor="blog-image" style={labelStyle}>
                URL de imagen de portada
              </label>
              <input
                id="blog-image"
                value={coverImage}
                onChange={(event) => setCoverImage(event.target.value)}
                style={inputStyle}
                placeholder="https://..."
              />
              <small>
                Por ahora se utiliza una URL de imagen. La carga directa
                de archivos se incorporará después.
              </small>
            </div>

            <h2 style={{ marginBottom: 0 }}>Posicionamiento SEO</h2>

            <div>
              <label htmlFor="blog-seo-title" style={labelStyle}>
                Título SEO
              </label>
              <input
                id="blog-seo-title"
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
                style={inputStyle}
                maxLength={180}
                placeholder="Título para Google"
              />
              <small>{seoTitle.length} caracteres</small>
            </div>

            <div>
              <label htmlFor="blog-meta" style={labelStyle}>
                Metadescripción
              </label>
              <textarea
                id="blog-meta"
                value={metaDescription}
                onChange={(event) => setMetaDescription(event.target.value)}
                style={inputStyle}
                maxLength={500}
                rows={3}
                placeholder="Descripción para Google"
              />
              <small>{metaDescription.length} caracteres</small>
            </div>

            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
              />
              Destacar este artículo
            </label>

            {editingId && (
              <p>
                Estado actual:{" "}
                <strong>
                  {status === "published" ? "Publicado" : "Borrador"}
                </strong>
              </p>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 12,
                marginTop: 10,
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "15px 24px",
                  border: 0,
                  borderRadius: 30,
                  background: "#333",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {saving ? "Guardando..." : "Guardar borrador"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => void savePost("published")}
                style={{
                  padding: "15px 24px",
                  border: 0,
                  borderRadius: 30,
                  background: "#009c4b",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {saving ? "Guardando..." : "Publicar artículo"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={resetForm}
                style={{
                  padding: "15px 24px",
                  border: "1px solid #ccc",
                  borderRadius: 30,
                  background: "#fff",
                  color: "#111",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Nuevo / Limpiar
              </button>
            </div>
          </form>
        </section>

        <section
          style={{
            background: "#fff",
            padding: "clamp(20px, 4vw, 36px)",
            borderRadius: 20,
            marginTop: 28,
          }}
        >
          <h2>Artículos guardados</h2>

          {loading ? (
            <p>Cargando artículos...</p>
          ) : posts.length === 0 ? (
            <p>Todavía no hay artículos. Crea el primero arriba.</p>
          ) : (
            <div style={{ display: "grid", gap: 14 }}>
              {posts.map((post) => (
                <article
                  key={post.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 18,
                  }}
                >
                  <strong style={{ fontSize: 18 }}>{post.title}</strong>

                  <p style={{ color: "#555" }}>
                    {post.category ?? "Sin categoría"} ·{" "}
                    {post.status === "published"
                      ? "Publicado"
                      : "Borrador"}
                  </p>

                  <p style={{ fontSize: 13, color: "#666" }}>
                    /blog/{post.slug}
                  </p>

                  <button
                    type="button"
                    onClick={() => editPost(post)}
                    style={{
                      padding: "10px 18px",
                      border: 0,
                      borderRadius: 25,
                      background: "#087c40",
                      color: "#fff",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Editar artículo
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
