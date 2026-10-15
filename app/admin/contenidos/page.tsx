"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type SeoPage = {
  page_path: string;
  seo_title: string | null;
  meta_description: string | null;
  h1: string | null;
};

const PAGES = [
  { path: "/", name: "Inicio" },
  { path: "/cursos", name: "Cursos" },
  { path: "/agenda-cultural", name: "Agenda cultural" },
  { path: "/eventos", name: "Eventos" },
  { path: "/cultura", name: "Cultura" },
  { path: "/empresas", name: "Empresas" },
  { path: "/sedes", name: "Sedes" },
  { path: "/alumni", name: "Alumni" },
  { path: "/blog", name: "Blog" },
] as const;

type Access = "loading" | "allowed" | "denied";

export default function ContenidosAdminPage() {
  const router = useRouter();
  const [access, setAccess] = useState<Access>("loading");
  const [path, setPath] = useState<string>("/");
  const [records, setRecords] = useState<Record<string, SeoPage>>({});
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [h1, setH1] = useState("");
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (!active) return;
        if (authError || !session) {
          router.replace("/admin/login");
          return;
        }
        const { data: profile, error: profileError } = await supabase
          .from("admin_profiles")
          .select("can_content, is_superadmin")
          .eq("user_id", session.user.id)
          .single();
        if (!active) return;
        if (profileError || !profile || (!profile.can_content && !profile.is_superadmin)) {
          setAccess("denied");
          return;
        }
        setAccess("allowed");
        const { data, error } = await supabase
          .from("seo_pages")
          .select("page_path, seo_title, meta_description, h1")
          .in("page_path", PAGES.map((p) => p.path));
        if (!active) return;
        if (error) throw error;
        const next: Record<string, SeoPage> = {};
        for (const item of data ?? []) next[item.page_path] = item;
        setRecords(next);
        const home = next["/"];
        setTitle(home?.seo_title ?? "");
        setDescription(home?.meta_description ?? "");
        setH1(home?.h1 ?? "");
      } catch (err) {
        if (active) setErrorMessage(err instanceof Error ? err.message : "No se pudieron cargar los datos SEO.");
      } finally {
        if (active) setLoadingPage(false);
      }
    }
    void initialize();
    return () => { active = false; };
  }, [router]);

  function selectPage(nextPath: string) {
    setPath(nextPath);
    const page = records[nextPath];
    setTitle(page?.seo_title ?? "");
    setDescription(page?.meta_description ?? "");
    setH1(page?.h1 ?? "");
    setNotice("");
    setErrorMessage("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setNotice("");
    setErrorMessage("");
    try {
      const payload: SeoPage = {
        page_path: path,
        seo_title: title.trim() || null,
        meta_description: description.trim() || null,
        h1: h1.trim() || null,
      };
      const { error } = await supabase.from("seo_pages").upsert(payload, { onConflict: "page_path" });
      if (error) throw error;
      setRecords((old) => ({ ...old, [path]: payload }));
      setNotice("Cambios guardados en Supabase. Los metadatos públicos se actualizarán en las siguientes solicitudes.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 16px", border: "1px solid #d6d6d6",
    borderRadius: 12, font: "inherit", background: "white", color: "#111",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = { display: "block", fontWeight: 800, marginBottom: 9 };

  if (access === "loading") return <main style={{ padding: 48 }}>Verificando permisos...</main>;
  if (access === "denied") return (
    <main style={{ padding: 48 }}>
      <h1>Acceso no autorizado</h1>
      <p>No tienes permiso para administrar SEO y Blog.</p>
      <Link href="/admin">Volver al administrador</Link>
    </main>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#f8f5e9", padding: "40px 5% 80px", fontFamily: "Arial, sans-serif", color: "#111" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#087c40", fontWeight: 800 }}>← Volver al administrador</Link>
        <p style={{ marginTop: 36, marginBottom: 6, color: "#087c40", fontWeight: 800 }}>MARKETING Y CONTENIDOS</p>
       <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
  <Link
    href="/admin/contenidos"
    style={{
      padding: "12px 20px",
      borderRadius: 30,
      background: "#009c4b",
      color: "#fff",
      fontWeight: 800,
      textDecoration: "none",
    }}
  >
    SEO de páginas
  </Link>

  <Link
    href="/admin/contenidos/blog"
    style={{
      padding: "12px 20px",
      borderRadius: 30,
      background: "#111",
      color: "#fff",
      fontWeight: 800,
      textDecoration: "none",
    }}
  >
    Artículos del blog →
  </Link>
</div>
        <h1 style={{ fontSize: "clamp(34px, 5vw, 54px)", margin: "0 0 10px" }}>SEO de páginas</h1>
        <p style={{ fontSize: 17, lineHeight: 1.6 }}>Edita los títulos y las descripciones para Google sin modificar el código de las páginas.</p>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: 24, marginTop: 28 }}>
          <aside style={{ background: "#fff", borderRadius: 22, padding: 24, alignSelf: "start", flex: "1 1 250px", minWidth: 0 }}>
            <h2 style={{ marginTop: 0, fontSize: 23 }}>Páginas existentes</h2>
            <label htmlFor="page-path" style={labelStyle}>Seleccionar página</label>
            <select id="page-path" value={path} onChange={(e) => selectPage(e.target.value)} style={inputStyle} disabled={loadingPage || saving}>
              {PAGES.map((page) => <option key={page.path} value={page.path}>{page.name} ({page.path})</option>)}
            </select>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#555" }}>La URL existente se mantiene intacta para proteger los enlaces y las matrículas.</p>
            <a href={path} target="_blank" rel="noopener noreferrer" style={{ color: "#087c40", fontWeight: 800 }}>Ver página pública ↗</a>
          </aside>
          <section style={{ background: "#fff", borderRadius: 22, padding: "clamp(20px, 4vw, 36px)", flex: "2 1 460px", minWidth: 0 }}>
            <h2 style={{ marginTop: 0 }}>Configuración SEO</h2>
            {loadingPage ? <p>Cargando información...</p> : (
              <form onSubmit={save} style={{ display: "grid", gap: 22 }}>
                <div>
                  <label htmlFor="seo-title" style={labelStyle}>SEO Title (título para buscadores)</label>
                  <input id="seo-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={180} style={inputStyle} placeholder="Ej. Cursos de portugués en Bogotá | IBRACO" />
                  <small style={{ color: "#666" }}>{title.length} caracteres · Sugerencia orientativa: 50–60</small>
                </div>
                <div>
                  <label htmlFor="seo-description" style={labelStyle}>Metadescripción</label>
                  <textarea id="seo-description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="Resumen de la página para los resultados de Google" />
                  <small style={{ color: "#666" }}>{description.length} caracteres · Sugerencia orientativa: 140–160</small>
                </div>
                <div>
                  <label htmlFor="seo-h1" style={labelStyle}>H1 de referencia</label>
                  <input id="seo-h1" value={h1} onChange={(e) => setH1(e.target.value)} maxLength={180} style={inputStyle} placeholder="Encabezado principal de la página" />
                  <small style={{ color: "#8a5400" }}>Este campo se guarda, pero todavía no cambia el H1 visible de la página. Esa integración requiere adaptar cada página sin alterar su diseño.</small>
                </div>
                <div>
                  <label style={labelStyle}>URL actual (protegida)</label>
                  <input readOnly value={path} style={{ ...inputStyle, background: "#f3f3f3" }} />
                  <small style={{ color: "#666" }}>La edición de slugs se habilitará con redirecciones 301 y revisión de rutas.</small>
                </div>
                {errorMessage && <p role="alert" style={{ background: "#fff0ed", color: "#9b2419", padding: 14, borderRadius: 10 }}>{errorMessage}</p>}
                {notice && <p role="status" style={{ background: "#e9f8ee", color: "#07682e", padding: 14, borderRadius: 10 }}>{notice}</p>}
                <button type="submit" disabled={saving} style={{ padding: "16px 26px", background: "#009c4b", color: "#fff", fontWeight: 800, fontSize: 16, border: 0, borderRadius: 40, cursor: saving ? "wait" : "pointer", justifySelf: "start" }}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            )}
          </section>
        </div>
        <section style={{ marginTop: 24, padding: 24, borderRadius: 20, background: "white" }}>
          <h2 style={{ marginTop: 0 }}>Próximas etapas</h2>
          <p>Blog: editor de artículos, categorías, etiquetas, imágenes, autor y Schema. También habilitaremos el cambio seguro de URLs y la actualización de H1 visibles.</p>
        </section>
      </div>
    </main>
  );
}
