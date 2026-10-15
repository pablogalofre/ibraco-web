"use client";

import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type Status = "draft" | "published";
type Access = "loading" | "allowed" | "denied";
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
  status: Status;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
};

const CATEGORIES = [
  "Aprender portugués", "Celpe-Bras", "Cultura brasileña",
  "Portugués para negocios", "Estudiar y viajar", "Comunidad IBRACO",
];

const colors = { green: "#008c48", dark: "#17211c", muted: "#65716b", cream: "#f8f7ef" };
const card: CSSProperties = {
  background: "#fff", border: "1px solid #e8e9e3", borderRadius: 20,
  padding: "clamp(20px, 3vw, 34px)", boxShadow: "0 6px 22px rgba(20, 40, 25, .035)",
};
const input: CSSProperties = {
  display: "block", width: "100%", boxSizing: "border-box", background: "#fff",
  color: colors.dark, font: "inherit", fontSize: 15, lineHeight: 1.5,
  border: "1px solid #d8ded7", borderRadius: 10, padding: "11px 14px",
  outlineColor: colors.green,
};
const label: CSSProperties = { display: "block", fontSize: 14, fontWeight: 700, marginBottom: 7 };
const button: CSSProperties = {
  border: 0, borderRadius: 999, padding: "12px 20px", fontWeight: 700,
  fontSize: 14, cursor: "pointer", fontFamily: "inherit",
};
const field: CSSProperties = { minWidth: 0 };

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
  const [status, setStatus] = useState<Status>("draft");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    const { data, error } = await supabase.from("blog_posts").select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    setPosts((data ?? []) as Post[]);
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!active) return;
        if (error || !user) { router.replace("/admin/login"); return; }
        const { data: profile, error: profileError } = await supabase
          .from("admin_profiles").select("can_content, is_superadmin")
          .eq("user_id", user.id).single();
        if (!active) return;
        if (profileError || !profile || (!profile.can_content && !profile.is_superadmin)) {
          setAccess("denied"); return;
        }
        setAccess("allowed");
        const { data, error: postsError } = await supabase.from("blog_posts")
          .select("*").order("created_at", { ascending: false });
        if (postsError) throw postsError;
        if (active) setPosts((data ?? []) as Post[]);
      } catch (err) {
        if (active) setErrorMessage(err instanceof Error ? err.message : "No se pudo cargar el blog.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void initialize();
    return () => { active = false; };
  }, [router]);

  function resetForm() {
    setEditingId(null); setTitle(""); setSlug(""); setExcerpt("");
    setContent(""); setCategory(CATEGORIES[0]); setCoverImage("");
    setSeoTitle(""); setMetaDescription(""); setFeatured(false);
    setStatus("draft"); setPublishedAt(null);
    setErrorMessage(""); setNotice("");
  }

  function editPost(post: Post) {
    setEditingId(post.id); setTitle(post.title); setSlug(post.slug);
    setExcerpt(post.excerpt ?? ""); setContent(post.content ?? "");
    setCategory(post.category ?? CATEGORIES[0]); setCoverImage(post.cover_image_url ?? "");
    setSeoTitle(post.seo_title ?? ""); setMetaDescription(post.meta_description ?? "");
    setFeatured(post.is_featured); setStatus(post.status); setPublishedAt(post.published_at);
    setErrorMessage(""); setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function savePost(nextStatus: Status) {
    if (saving) return;
    setErrorMessage(""); setNotice("");
    const cleanTitle = title.trim();
    const cleanSlug = slugify(slug || title);
    if (!cleanTitle || !cleanSlug) {
      setErrorMessage("Completa el título y la URL del artículo."); return;
    }
    if (!content.trim()) {
      setErrorMessage("Escribe el contenido del artículo."); return;
    }
    setSaving(true);
    try {
      const payload = {
        title: cleanTitle, slug: cleanSlug, excerpt: excerpt.trim() || null,
        content: content.trim(), category, cover_image_url: coverImage.trim() || null,
        seo_title: seoTitle.trim() || null, meta_description: metaDescription.trim() || null,
        is_featured: featured, status: nextStatus,
        published_at: nextStatus === "published" ? (publishedAt ?? new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      };
      if (editingId) {
        const { data, error } = await supabase.from("blog_posts").update(payload)
          .eq("id", editingId).select("id");
        if (error) throw error;
        if (!data?.length) throw new Error("No se pudo actualizar el artículo. Revisa los permisos.");
      } else {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
        const { error } = await supabase.from("blog_posts").insert({ ...payload, created_by: user.id });
        if (error) throw error;
      }
      await loadPosts();
      resetForm();
      setNotice(nextStatus === "published"
        ? "Artículo marcado como publicado en Supabase. Aún falta conectarlo con el blog público."
        : "Borrador guardado correctamente.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "No se pudo guardar el artículo.");
    } finally {
      setSaving(false);
    }
  }

  if (access === "loading" && loading) return <main style={{ padding: "150px 6% 50px" }}>Verificando permisos...</main>;
  if (access === "denied") return (
    <main style={{ padding: "150px 6% 50px" }}>
      <h1>Acceso no autorizado</h1>
      <p>No tienes permiso para administrar el blog.</p>
      <Link href="/admin">Volver al administrador</Link>
    </main>
  );
  if (access !== "allowed") return (
    <main style={{ padding: "150px 6% 50px" }}>
      <h1>No se pudo abrir el administrador</h1>
      <p role="alert">{errorMessage || "Verifica tu sesión."}</p>
      <Link href="/admin">Volver al administrador</Link>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: colors.cream, color: colors.dark,
      padding: "clamp(145px, 13vw, 175px) 5% 80px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <Link href="/admin/contenidos" style={{ color: colors.green, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
          ← Volver a SEO de páginas
        </Link>
        <header style={{ margin: "30px 0 30px" }}>
          <p style={{ color: colors.green, fontWeight: 800, fontSize: 12, letterSpacing: "0.11em", margin: "0 0 12px" }}>
            IBRACO / MARKETING Y CONTENIDOS
          </p>
          <h1 style={{ fontSize: "clamp(28px, 3.5vw, 42px)", lineHeight: 1.12,
            letterSpacing: "-0.035em", margin: "0 0 12px", fontWeight: 800 }}>
            Artículos del blog
          </h1>
          <p style={{ color: colors.muted, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Administra los artículos, borradores y contenidos SEO de IBRACO.
          </p>
        </header>

        {notice && <p role="status" style={{ padding: 15, borderRadius: 10, background: "#e8f7ed", color: "#096632" }}>{notice}</p>}
        {errorMessage && <p role="alert" style={{ padding: 15, borderRadius: 10, background: "#fff0ed", color: "#a42b20" }}>{errorMessage}</p>}

        <section style={card}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 26 }}>
            <div>
              <p style={{ fontSize: 12, color: colors.green, fontWeight: 800, margin: "0 0 5px" }}>EDITOR DE CONTENIDOS</p>
              <h2 style={{ fontSize: 23, margin: 0 }}>{editingId ? "Editar artículo" : "Nuevo artículo"}</h2>
            </div>
            {editingId && <span style={{ padding: "8px 12px", borderRadius: 30, background: "#f2f4f1", fontSize: 13, fontWeight: 700 }}>
              {status === "published" ? "Publicado" : "Borrador"}
            </span>}
          </div>

          <form onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void savePost("draft"); }}
            style={{ display: "grid", gap: 22 }}>
            <div style={field}>
              <label htmlFor="blog-title" style={label}>Título del artículo *</label>
              <input id="blog-title" value={title} maxLength={180} style={input}
                placeholder="Ej. Cómo aprender portugués desde cero"
                onChange={(event) => {
                  const next = event.target.value;
                  if (!editingId && slug === slugify(title)) setSlug(slugify(next));
                  setTitle(next);
                }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 20 }}>
              <div style={field}>
                <label htmlFor="blog-slug" style={label}>URL del artículo *</label>
                <input id="blog-slug" value={slug} style={input} placeholder="como-aprender-portugues"
                  onChange={(event) => setSlug(slugify(event.target.value))} />
                <small style={{ color: colors.muted }}>Ruta prevista: /blog/{slug || "nombre-del-articulo"}</small>
              </div>
              <div style={field}>
                <label htmlFor="blog-category" style={label}>Categoría</label>
                <select id="blog-category" value={category} style={input}
                  onChange={(event) => setCategory(event.target.value)}>
                  {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </div>

            <div style={field}>
              <label htmlFor="blog-excerpt" style={label}>Resumen</label>
              <textarea id="blog-excerpt" rows={3} value={excerpt} style={{ ...input, resize: "vertical" }}
                placeholder="Una introducción breve para presentar el artículo"
                onChange={(event) => setExcerpt(event.target.value)} />
            </div>

            <div style={field}>
              <label htmlFor="blog-content" style={label}>Contenido del artículo *</label>
              <textarea id="blog-content" rows={12} value={content} style={{ ...input, resize: "vertical", lineHeight: 1.7 }}
                placeholder="Escribe aquí el artículo..."
                onChange={(event) => setContent(event.target.value)} />
              <small style={{ color: colors.muted }}>Editor de texto simple. La edición enriquecida se incorporará después.</small>
            </div>

            <div style={field}>
              <label htmlFor="blog-image" style={label}>Imagen de portada (URL)</label>
              <input id="blog-image" value={coverImage} style={input} placeholder="https://..."
                onChange={(event) => setCoverImage(event.target.value)} />
              <small style={{ color: colors.muted }}>La carga directa de imágenes se incorporará en una siguiente etapa.</small>
            </div>

            <div style={{ borderTop: "1px solid #edf0eb", paddingTop: 24 }}>
              <h3 style={{ fontSize: 19, margin: "0 0 6px" }}>Posicionamiento SEO</h3>
              <p style={{ fontSize: 14, color: colors.muted, margin: "0 0 20px" }}>Información para los resultados de búsqueda.</p>
              <div style={{ display: "grid", gap: 18 }}>
                <div style={field}>
                  <label htmlFor="blog-seo-title" style={label}>Título SEO</label>
                  <input id="blog-seo-title" value={seoTitle} maxLength={180} style={input}
                    placeholder="Título para Google" onChange={(event) => setSeoTitle(event.target.value)} />
                  <small style={{ color: colors.muted }}>{seoTitle.length} caracteres</small>
                </div>
                <div style={field}>
                  <label htmlFor="blog-meta" style={label}>Metadescripción</label>
                  <textarea id="blog-meta" value={metaDescription} maxLength={500} rows={3}
                    style={{ ...input, resize: "vertical" }} placeholder="Descripción para Google"
                    onChange={(event) => setMetaDescription(event.target.value)} />
                  <small style={{ color: colors.muted }}>{metaDescription.length} caracteres</small>
                </div>
              </div>
            </div>

            <label style={{ display: "flex", gap: 10, alignItems: "center", fontWeight: 700, fontSize: 14 }}>
              <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
              Destacar este artículo
            </label>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 8 }}>
              <button type="submit" disabled={saving} style={{ ...button, background: colors.dark, color: "white", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Guardando..." : "Guardar borrador"}
              </button>
              <button type="button" disabled={saving} onClick={() => void savePost("published")}
                style={{ ...button, background: colors.green, color: "white", opacity: saving ? 0.6 : 1 }}>
                {saving ? "Guardando..." : "Marcar como publicado"}
              </button>
              <button type="button" disabled={saving} onClick={resetForm}
                style={{ ...button, background: "#f1f3ef", color: colors.dark }}>
                Nuevo / Limpiar
              </button>
            </div>
            <p style={{ fontSize: 12, color: colors.muted, margin: 0 }}>
              Los artículos se guardan en Supabase. Todavía no aparecen automáticamente en la página pública del blog.
            </p>
          </form>
        </section>

        <section style={{ ...card, marginTop: 24 }}>
          <h2 style={{ fontSize: 22, margin: "0 0 20px" }}>Artículos guardados</h2>
          {loading ? <p>Cargando artículos...</p> : posts.length === 0
            ? <p style={{ color: colors.muted }}>Todavía no hay artículos. Crea el primero en el formulario.</p>
            : <div style={{ display: "grid", gap: 12 }}>
                {posts.map((post) => (
                  <article key={post.id} style={{ border: "1px solid #e7eae5", borderRadius: 14,
                    padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 15 }}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ fontSize: 16 }}>{post.title}</strong>
                      <p style={{ color: colors.muted, fontSize: 13, margin: "7px 0" }}>
                        {post.category ?? "Sin categoría"} · {post.status === "published" ? "Publicado" : "Borrador"}
                      </p>
                      <small style={{ color: colors.muted, overflowWrap: "anywhere" }}>/blog/{post.slug}</small>
                    </div>
                    <button type="button" onClick={() => editPost(post)}
                      style={{ ...button, background: "#e8f5ed", color: "#086b39" }}>Editar artículo</button>
                  </article>
                ))}
              </div>}
        </section>
      </div>
    </main>
  );
}
