"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { supabase } from "../../../lib/supabase";

type Status = "draft" | "published";

type Access = "loading" | "allowed" | "denied";

type View = "dashboard" | "editor" | "seo";

type SeoPage = { id: string; page_path: string; seo_title: string | null; meta_description: string | null; h1: string | null; updated_at: string };

type EditorTab = "write" | "preview";

type Filter = "all" | "draft" | "published";

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

const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const dateLabel = (value: string | null | undefined) => {

  if (!value) return "Sin fecha";

  const d = new Date(value);

  return Number.isNaN(d.getTime()) ? "Sin fecha" : d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });

};

export default function BlogAdminPage() {

  const router = useRouter();

  const [access, setAccess] = useState<Access>("loading");

  const [posts, setPosts] = useState<Post[]>([]);
  const [seoPages, setSeoPages] = useState<SeoPage[]>([]);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoSaving, setSeoSaving] = useState(false);
  const [seoError, setSeoError] = useState("");
  const [seoNotice, setSeoNotice] = useState("");
  const [selectedPageId, setSelectedPageId] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [pageH1, setPageH1] = useState("");
  const [seoDirty, setSeoDirty] = useState(false);

  function selectSeoPage(page: SeoPage) {
    setSelectedPageId(page.id);
    setPageTitle(page.seo_title ?? "");
    setPageDescription(page.meta_description ?? "");
    setPageH1(page.h1 ?? "");
    setSeoDirty(false);
    setSeoNotice("");
  }

  async function openSeo() {
    if (seoLoading || seoSaving) return;
    if (view === "seo" && seoDirty && !window.confirm("¿Descartar los cambios SEO sin guardar?")) return;
    setView("seo");
    setNotice(""); setErrorMessage("");
    setSeoError(""); setSeoNotice(""); setSeoLoading(true);
    try {
      const { data, error } = await supabase.from("seo_pages")
        .select("id, page_path, seo_title, meta_description, h1, updated_at")
        .order("page_path", { ascending: true });
      if (error) throw new Error(error.message);
      const pages = (data ?? []) as SeoPage[];
      setSeoPages(pages);
      const selected = pages.find(p => p.id === selectedPageId) ?? pages[0];
      if (selected) selectSeoPage(selected);
      else { setSelectedPageId(""); setSeoDirty(false); }
    } catch (err) {
      setSeoError(err instanceof Error ? err.message : "No se pudieron cargar las páginas SEO.");
    } finally { setSeoLoading(false); }
  }

  async function savePageSeo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (seoSaving || !selectedPageId) return;
    const original = seoPages.find(p => p.id === selectedPageId);
    if (!original) return;
    setSeoSaving(true); setSeoError(""); setSeoNotice("");
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
      const { data: profile, error: profileError } = await supabase.from("admin_profiles")
        .select("can_content, is_superadmin").eq("user_id", user.id).single();
      if (profileError || !profile || (!profile.can_content && !profile.is_superadmin))
        throw new Error("No tienes permiso para editar SEO.");
      const { data, error } = await supabase.from("seo_pages").update({
        seo_title: pageTitle.trim() || null,
        meta_description: pageDescription.trim() || null,
        h1: pageH1.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq("id", original.id).eq("updated_at", original.updated_at)
        .select("id, page_path, seo_title, meta_description, h1, updated_at");
      if (error) throw new Error(error.message);
      if (!data || data.length !== 1)
        throw new Error("No se guardaron cambios. El registro pudo cambiar o faltan permisos. Recarga las páginas antes de reintentar.");
      const saved = data[0] as SeoPage;
      setSeoPages(pages => pages.map(p => p.id === saved.id ? saved : p));
      selectSeoPage(saved);
      setSeoNotice("SEO guardado en Supabase. Revisa la página pública para comprobar cómo se aplica.");
    } catch (err) {
      setSeoError(err instanceof Error ? err.message : "No se pudo guardar el SEO.");
    } finally { setSeoSaving(false); }
  }

  function leaveSeo(nextView: "dashboard" | "editor") {
    if (seoSaving) return;
    if (view === "seo" && seoDirty && !window.confirm("¿Descartar los cambios SEO sin guardar?")) return;
    setView(nextView);
    setSeoDirty(false);
  }


  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [notice, setNotice] = useState("");

  const [view, setView] = useState<View>("dashboard");

  const [tab, setTab] = useState<EditorTab>("write");

  const [filter, setFilter] = useState<Filter>("all");

  const [search, setSearch] = useState("");

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

    const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });

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

        const { data: profile, error: profileError } = await supabase.from("admin_profiles")

          .select("can_content, is_superadmin").eq("user_id", user.id).single();

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

      } finally { if (active) setLoading(false); }

    }

    void initialize();

    return () => { active = false; };

  }, [router]);

  const stats = useMemo(() => ({

    total: posts.length,

    published: posts.filter(p => p.status === "published").length,

    drafts: posts.filter(p => p.status === "draft").length,

    featured: posts.filter(p => p.is_featured).length,

  }), [posts]);

  const filteredPosts = useMemo(() => posts.filter(p =>

    (filter === "all" || p.status === filter) &&

    [p.title, p.category ?? "", p.slug].join(" ").toLowerCase().includes(search.trim().toLowerCase())

  ), [posts, filter, search]);

  function resetForm() {

    setEditingId(null); setTitle(""); setSlug(""); setExcerpt("");

    setContent(""); setCategory(CATEGORIES[0]); setCoverImage("");

    setSeoTitle(""); setMetaDescription(""); setFeatured(false);

    setStatus("draft"); setPublishedAt(null);

    setErrorMessage(""); setNotice(""); setTab("write");

  }

  function newPost() { if (view === "seo" && (seoSaving || (seoDirty && !window.confirm("¿Descartar los cambios SEO sin guardar?")))) return; resetForm(); setSeoDirty(false); setView("editor"); }

  function editPost(post: Post) {

    setEditingId(post.id); setTitle(post.title); setSlug(post.slug);

    setExcerpt(post.excerpt ?? ""); setContent(post.content ?? "");

    setCategory(post.category ?? CATEGORIES[0]); setCoverImage(post.cover_image_url ?? "");

    setSeoTitle(post.seo_title ?? ""); setMetaDescription(post.meta_description ?? "");

    setFeatured(post.is_featured); setStatus(post.status); setPublishedAt(post.published_at);

    setErrorMessage(""); setNotice(""); setTab("write"); setView("editor");

    window.scrollTo({ top: 0, behavior: "smooth" });

  }

  async function savePost(nextStatus: Status) {

    if (saving) return;

    setErrorMessage(""); setNotice("");

    const cleanTitle = title.trim();

    const cleanSlug = slugify(slug || title);

    if (!cleanTitle || !cleanSlug) { setErrorMessage("Completa el título y la URL del artículo."); return; }

    if (!content.trim()) { setErrorMessage("Escribe el contenido del artículo."); return; }

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

      setView("dashboard");

      setNotice(nextStatus === "published"

        ? "Artículo marcado como publicado en Supabase. Falta conectarlo con el blog público."

        : "¡Borrador guardado correctamente!");

    } catch (err) {

      setErrorMessage(err instanceof Error ? err.message : "No se pudo guardar el artículo.");

    } finally { setSaving(false); }

  }

  if (access === "loading" && loading) return <main className="ib-loading">Preparando tu estudio editorial…</main>;

  if (access === "denied") return <main className="ib-loading"><h1>Acceso no autorizado</h1><p>No tienes permiso para administrar el blog.</p><Link href="/admin">Volver al administrador</Link></main>;

  if (access !== "allowed") return <main className="ib-loading"><h1>No se pudo abrir el administrador</h1><p role="alert">{errorMessage || "Verifica tu sesión."}</p><Link href="/admin">Volver al administrador</Link></main>;

  return (

    <main className="ib-app">

      <style>{`

        .ib-app{--green:#009c4b;--ink:#18221d;--muted:#68746d;--line:#e7eae5;--cream:#f6f6ef;--blue:#2d62ee;--yellow:#ffdc00;min-height:100vh;background:var(--cream);color:var(--ink);font-family:Arial,Helvetica,sans-serif;padding-top:115px}

        .ib-app *{box-sizing:border-box}.ib-app button,.ib-app input,.ib-app textarea,.ib-app select{font:inherit}.ib-app button{cursor:pointer}.ib-shell{max-width:1500px;margin:auto;display:grid;grid-template-columns:245px minmax(0,1fr);gap:24px;padding:28px 30px 70px}

        .ib-side{background:#fff;border:1px solid var(--line);border-radius:25px;padding:26px 16px;align-self:start;position:sticky;top:135px;box-shadow:0 10px 35px #142d1710}

        .ib-brand{display:flex;align-items:center;gap:11px;padding:0 10px 25px;border-bottom:1px solid var(--line)}.ib-mark{width:74px;height:54px;display:grid;place-items:center;flex-shrink:0}.ib-mark img{width:100%;height:100%;object-fit:contain}.ib-brand strong{display:block;font-size:18px}.ib-brand small{color:var(--muted);font-size:11px}

        .ib-side-label{font-size:10px;font-weight:800;letter-spacing:.14em;color:#9aa39d;margin:25px 13px 12px}.ib-nav{display:flex;flex-direction:column;gap:5px}.ib-nav button,.ib-nav a{border:0;text-align:left;text-decoration:none;background:transparent;color:#526059;padding:13px 15px;border-radius:13px;font-size:14px;font-weight:700;display:flex;align-items:center;gap:12px}.ib-nav button.active{background:#e7f7ed;color:#087a3e}.ib-nav button:hover,.ib-nav a:hover{background:#f2f5f1}.ib-side-bottom{margin-top:38px;padding:18px 15px;background:#f3f8f1;border-radius:17px}.ib-side-bottom strong{font-size:13px}.ib-side-bottom p{font-size:12px;color:var(--muted);line-height:1.5;margin:7px 0 0}

        .ib-main{min-width:0}.ib-top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap}.ib-kicker{font-size:11px;color:#078848;letter-spacing:.14em;font-weight:900;margin:0 0 7px}.ib-top h1{font-size:clamp(26px,3vw,38px);letter-spacing:-.045em;margin:0;font-weight:900}.ib-top p.ib-sub{font-size:14px;color:var(--muted);margin:9px 0 0;line-height:1.5}

        .ib-btn{border:0;border-radius:13px;padding:13px 18px;font-weight:800;font-size:13px;display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;white-space:nowrap}.ib-btn:disabled{opacity:.55;cursor:wait}.ib-btn-green{background:var(--green);color:#fff}.ib-btn-blue{background:var(--blue);color:#fff}.ib-btn-dark{background:var(--ink);color:#fff}.ib-btn-light{background:#f0f3ef;color:#26342b}.ib-btn-outline{background:#fff;color:var(--ink);border:1px solid var(--line)}

        .ib-hero{background:#1b5e44;border-radius:25px;color:#fff;min-height:208px;padding:30px 36px;display:flex;justify-content:space-between;align-items:center;gap:25px;overflow:hidden;position:relative}.ib-hero:before{content:"";position:absolute;width:320px;height:320px;border:55px solid #ffffff16;border-radius:50%;right:-65px;top:-140px}.ib-hero:after{content:"";position:absolute;width:170px;height:170px;background:var(--yellow);border-radius:50%;right:75px;bottom:-130px}.ib-hero-copy{position:relative;z-index:1;max-width:520px}.ib-hero-copy small{font-size:11px;letter-spacing:.13em;font-weight:900;color:#c2e8cd}.ib-hero h2{font-size:clamp(24px,3.1vw,37px);line-height:1.12;letter-spacing:-.04em;margin:13px 0}.ib-hero p{font-size:14px;color:#d3e8d9;line-height:1.55;max-width:460px;margin:0}.ib-hero-art{width:230px;height:165px;position:relative;z-index:1;flex-shrink:0}.ib-hero-line{position:absolute;display:block;border:12px solid #ffffff35;border-radius:60px;transform:rotate(-27deg)}.ib-hero-line-a{width:185px;height:88px;right:18px;top:5px}.ib-hero-line-b{width:155px;height:75px;right:48px;top:65px;border-color:#ffffff24}.ib-hero-circle{position:absolute;display:block;width:58px;height:58px;border-radius:50%;background:var(--yellow);right:14px;bottom:8px}

        .ib-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;margin:20px 0 28px}.ib-stat{background:#fff;border:1px solid var(--line);border-radius:20px;padding:21px 22px;min-width:0}.ib-stat-top{display:flex;align-items:center;justify-content:space-between;gap:8px}.ib-stat small{font-size:12px;color:var(--muted);font-weight:700}.ib-stat-icon{width:36px;height:36px;border-radius:12px;background:#f2f6f1;display:grid;place-items:center;font-size:19px}.ib-stat strong{display:block;font-size:34px;margin-top:12px;letter-spacing:-.05em}

        .ib-panel{background:#fff;border:1px solid var(--line);border-radius:23px;padding:25px;box-shadow:0 5px 25px #17291a08}.ib-panel-head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:22px}.ib-panel-head h2{margin:0;font-size:20px;letter-spacing:-.025em}.ib-panel-head p{margin:6px 0 0;color:var(--muted);font-size:13px}.ib-tools{display:flex;gap:10px;align-items:center;flex-wrap:wrap}.ib-search{border:1px solid var(--line);background:#fafbf9;border-radius:12px;padding:11px 14px;min-width:200px;max-width:100%;font-size:13px;outline-color:var(--green)}.ib-filters{display:flex;gap:5px;background:#f4f6f2;padding:4px;border-radius:12px}.ib-filters button{background:transparent;border:0;border-radius:9px;padding:9px 12px;font-size:12px;font-weight:800;color:#718078}.ib-filters button.active{background:#fff;color:#078a47;box-shadow:0 2px 6px #0000000b}

        .ib-list{display:grid;gap:11px}.ib-post{display:flex;align-items:center;gap:16px;border:1px solid var(--line);border-radius:17px;padding:15px;transition:background .15s}.ib-post:hover{background:#fbfcfa}.ib-thumb{width:57px;height:57px;flex-shrink:0;border-radius:14px;background:#e5f6eb;display:grid;place-items:center;font-size:24px;overflow:hidden}.ib-thumb img{width:100%;height:100%;object-fit:cover}.ib-post-info{flex:1;min-width:0}.ib-post-info strong{display:block;font-size:14px;overflow-wrap:anywhere}.ib-post-info small{display:block;color:var(--muted);font-size:12px;margin-top:7px}.ib-pill{border-radius:999px;padding:6px 10px;font-size:11px;font-weight:800;white-space:nowrap}.ib-pill.published{background:#e6f7ec;color:#078044}.ib-pill.draft{background:#fff5d2;color:#8a6500}.ib-empty{text-align:center;padding:55px 20px;color:var(--muted)}.ib-empty span{font-size:45px}.ib-empty h3{color:var(--ink);margin-bottom:5px}

        .ib-alert{padding:15px 18px;border-radius:14px;margin-bottom:18px;font-size:13px;line-height:1.5}.ib-alert.success{background:#e7f7ed;color:#076c38}.ib-alert.error{background:#fff0ed;color:#a42b20}

        .ib-editor-grid{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:18px;align-items:start}.ib-editor-grid .ib-panel{min-width:0}.ib-form{display:grid;gap:22px}.ib-label{display:block;font-size:12px;font-weight:900;color:#35453b;margin-bottom:9px}.ib-input{width:100%;padding:13px 15px;border:1px solid #dce3da;background:#fff;border-radius:12px;outline-color:var(--green);font-size:14px;color:var(--ink)}.ib-input::placeholder{color:#a1aaa3}.ib-textarea{resize:vertical;line-height:1.7}.ib-field-hint{font-size:11px;color:#7c8980;margin-top:7px;line-height:1.5}.ib-row2{display:grid;grid-template-columns:1fr 1fr;gap:15px}.ib-editor-tabs{display:flex;gap:7px;background:#f2f5f0;border-radius:13px;padding:5px;width:max-content;max-width:100%;margin-bottom:18px}.ib-editor-tabs button{border:0;background:transparent;border-radius:10px;padding:10px 16px;font-size:12px;font-weight:800;color:#7a867e}.ib-editor-tabs button.active{background:#fff;color:#078848;box-shadow:0 2px 9px #0000000a}.ib-preview{border:1px dashed #d2ddd2;border-radius:15px;padding:25px;min-height:320px;background:#fff;overflow-wrap:anywhere}.ib-preview h2{font-size:28px;letter-spacing:-.04em;line-height:1.2}.ib-preview p{white-space:pre-wrap;line-height:1.8;font-size:14px}.ib-preview img{max-width:100%;border-radius:12px}.ib-preview-category{color:var(--green);font-size:11px;font-weight:900;letter-spacing:.08em}.ib-editor-side .ib-panel{margin-bottom:16px}.ib-editor-side h3{margin:0 0 18px;font-size:16px}.ib-editor-side p{color:var(--muted);font-size:12px;line-height:1.55}.ib-check{display:flex;gap:10px;align-items:center;font-size:13px;font-weight:700}.ib-check input{accent-color:var(--green);width:17px;height:17px}.ib-seo{border-top:1px solid var(--line);padding-top:15px;margin-top:18px}.ib-seo summary{font-size:13px;font-weight:900;cursor:pointer}.ib-seo .ib-form{margin-top:16px;gap:16px}.ib-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:23px}.ib-note{background:#fff7db;border-radius:13px;padding:12px 14px;font-size:11px!important;color:#795d00!important}

        @media(max-width:1100px){.ib-shell{grid-template-columns:205px minmax(0,1fr);padding:24px 18px 60px;gap:16px}.ib-editor-grid{grid-template-columns:minmax(0,1fr)}.ib-editor-side{display:grid;grid-template-columns:1fr 1fr;gap:15px}.ib-editor-side .ib-panel{margin-bottom:0}}

        @media(max-width:800px){.ib-app{padding-top:100px}.ib-shell{display:block;padding:15px 14px 45px}.ib-side{position:static;margin-bottom:20px;padding:12px}.ib-brand{padding:6px 8px 12px}.ib-nav{flex-direction:row;flex-wrap:wrap}.ib-nav button,.ib-nav a{padding:10px 12px}.ib-side-label,.ib-side-bottom{display:none}.ib-hero{padding:25px;min-height:175px}.ib-hero-art{display:none}.ib-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.ib-panel{padding:18px}.ib-tools{width:100%}.ib-search{flex:1}.ib-editor-side{grid-template-columns:1fr}}

        @media(max-width:500px){.ib-row2{grid-template-columns:1fr}.ib-post{gap:10px;flex-wrap:wrap}.ib-post .ib-btn{margin-left:auto}.ib-thumb{width:45px;height:45px}.ib-pill{font-size:10px}.ib-stats{gap:9px}.ib-stat{padding:16px}.ib-stat strong{font-size:28px}}

      `}</style>

      <div className="ib-shell">

        <aside className="ib-side">

          <div className="ib-brand"><div className="ib-mark"><img src="/assets/logos/logo-ibraco.png" alt="Logotipo oficial de IBRACO" /></div><div><strong>IBRACO</strong><small>Estudio editorial</small></div></div>

          <div className="ib-side-label">TU ESPACIO</div>

          <nav className="ib-nav" aria-label="Navegación editorial">

            <button type="button" className={view === "dashboard" ? "active" : ""} onClick={() => leaveSeo("dashboard")}>▦ &nbsp; Dashboard</button>

            <button type="button" className={view === "editor" ? "active" : ""} onClick={newPost}>✎ &nbsp; Crear artículo</button>

            <button type="button" className={view === "seo" ? "active" : ""} disabled={seoSaving || seoLoading} onClick={() => void openSeo()}>◎ &nbsp; SEO de páginas</button>

            <Link href="/admin">◈ &nbsp; Centro de administración</Link>

            <Link href="/blog" target="_blank">↗ &nbsp; Ver blog público</Link>

            <Link href="/admin">⌂ &nbsp; Volver al inicio</Link>

          </nav>

          <div className="ib-side-bottom"><strong>Tu espacio creativo</strong><p>Ideas, historias y cultura brasileña, listas para conectar con más personas.</p></div>

        </aside>

        <div className="ib-main">

          <div className="ib-top">

            <div><p className="ib-kicker">IBRACO / MARKETING Y CONTENIDOS</p><h1>{view === "seo" ? "SEO de páginas" : view === "dashboard" ? "Bienvenidos al estudio editorial" : editingId ? "Edita tu historia" : "Una nueva historia"}</h1><p className="ib-sub">{view === "seo" ? "Edita los títulos, las descripciones y los H1 de las páginas del sitio." : view === "dashboard" ? "Todo lo que está pasando en el blog, de un vistazo." : "Escribe, organiza y prepara contenidos que inspiren."}</p></div>

            {view === "dashboard" ? <button type="button" className="ib-btn ib-btn-blue" onClick={newPost}>＋ Crear artículo</button> : <button type="button" className="ib-btn ib-btn-outline" onClick={() => leaveSeo("dashboard")}>← Volver al dashboard</button>}

          </div>

          {notice && <div role="status" className="ib-alert success">✓ {notice}</div>}

          {errorMessage && <div role="alert" className="ib-alert error">{errorMessage}</div>}

          {view === "seo" ? <section className="ib-panel">
            <div className="ib-panel-head"><div><h2>Configuración SEO por página</h2><p>Selecciona una página para consultar y editar sus datos actuales.</p></div>
              <button type="button" className="ib-btn ib-btn-outline" disabled={seoLoading || seoSaving} onClick={() => void openSeo()}>Recargar páginas</button>
            </div>
            {seoError && <div role="alert" className="ib-alert error">{seoError}</div>}
            {seoNotice && <div role="status" className="ib-alert success">{seoNotice}</div>}
            {seoLoading ? <p role="status">Cargando páginas…</p> : !seoPages.length ? <div className="ib-empty"><h3>No hay páginas disponibles</h3><p>{seoError ? "Revisa el error e intenta recargar." : "No se encontraron registros visibles. Comprueba los registros y permisos de seo_pages."}</p></div> :
            <form className="ib-form" onSubmit={savePageSeo}>
              <div><label className="ib-label" htmlFor="ib-seo-page">Página</label>
                <select id="ib-seo-page" className="ib-input" value={selectedPageId} disabled={seoSaving} onChange={e => {
                  const page = seoPages.find(p => p.id === e.target.value);
                  if (!page || (seoDirty && !window.confirm("¿Descartar los cambios SEO sin guardar?"))) return;
                  setSeoError(""); selectSeoPage(page);
                }}>{seoPages.map(page => <option key={page.id} value={page.id}>{page.page_path === "/" ? "/ — Inicio" : page.page_path}</option>)}</select>
              </div>
              <div><label className="ib-label" htmlFor="ib-page-title">Título SEO</label>
                <input id="ib-page-title" className="ib-input" value={pageTitle} disabled={seoSaving} onChange={e => {setPageTitle(e.target.value); setSeoDirty(true); setSeoNotice("");}} />
                <div className="ib-field-hint">{pageTitle.length} caracteres. Orientación editorial: aproximadamente 50–60 caracteres.</div>
              </div>
              <div><label className="ib-label" htmlFor="ib-page-description">Metadescripción / snippet</label>
                <textarea id="ib-page-description" className="ib-input ib-textarea" rows={4} value={pageDescription} disabled={seoSaving} onChange={e => {setPageDescription(e.target.value); setSeoDirty(true); setSeoNotice("");}} />
                <div className="ib-field-hint">{pageDescription.length} caracteres. Google puede mostrar una descripción distinta.</div>
              </div>
              <div><label className="ib-label" htmlFor="ib-page-h1">H1 de la página</label>
                <textarea id="ib-page-h1" className="ib-input ib-textarea" rows={2} value={pageH1} disabled={seoSaving} onChange={e => {setPageH1(e.target.value); setSeoDirty(true); setSeoNotice("");}} />
                <div className="ib-field-hint">Encabezado principal. Su visualización depende de la integración de cada página.</div>
              </div>
              <div className="ib-preview"><span className="ib-label">Vista previa orientativa del resultado de búsqueda</span>
                <small>{seoPages.find(p => p.id === selectedPageId)?.page_path}</small>
                <h3 style={{color:"#1a0dab", overflowWrap:"anywhere"}}>{pageTitle || "Título SEO de la página"}</h3>
                <p>{pageDescription || "Metadescripción de la página."}</p>
              </div>
              <div className="ib-actions"><button type="submit" className="ib-btn ib-btn-green" disabled={seoSaving || !seoDirty}>{seoSaving ? "Guardando…" : "Guardar SEO de esta página"}</button></div>
            </form>}
          </section> : view === "dashboard" ? <>

            <section className="ib-hero"><div className="ib-hero-copy"><small>EL BLOG DE IBRACO</small><h2>Las buenas historias<br />merecen ser contadas.</h2><p>Comparte el portugués, la cultura y las oportunidades que conectan a Colombia con Brasil.</p></div><div className="ib-hero-art" aria-hidden="true"><span className="ib-hero-line ib-hero-line-a"/><span className="ib-hero-line ib-hero-line-b"/><span className="ib-hero-circle"/></div></section>

            <section className="ib-stats" aria-label="Estadísticas de artículos">

              {[{ label: "Total de artículos", value: stats.total, icon: "▤" }, { label: "Publicados", value: stats.published, icon: "●" }, { label: "Borradores", value: stats.drafts, icon: "✎" }, { label: "Destacados", value: stats.featured, icon: "★" }].map(item => <div className="ib-stat" key={item.label}><div className="ib-stat-top"><small>{item.label}</small><span className="ib-stat-icon">{item.icon}</span></div><strong>{item.value}</strong></div>)}

            </section>

            <section className="ib-panel">

              <div className="ib-panel-head"><div><h2>Tu biblioteca de contenidos</h2><p>Encuentra, organiza y continúa tus artículos.</p></div><div className="ib-tools"><input className="ib-search" aria-label="Buscar artículos" placeholder="⌕  Buscar artículos..." value={search} onChange={e => setSearch(e.target.value)} /><div className="ib-filters">{([{ id: "all", label: "Todos" }, { id: "published", label: "Publicados" }, { id: "draft", label: "Borradores" }] as const).map(f => <button key={f.id} type="button" className={filter === f.id ? "active" : ""} onClick={() => setFilter(f.id)}>{f.label}</button>)}</div></div></div>

              {loading ? <div className="ib-empty">Cargando artículos...</div> : filteredPosts.length === 0 ? <div className="ib-empty"><span>📝</span><h3>{posts.length ? "No encontramos artículos" : "Tu próxima historia empieza aquí"}</h3><p>{posts.length ? "Prueba con otra búsqueda o filtro." : "Todavía no hay artículos. ¡Creemos el primero!"}</p><button type="button" className="ib-btn ib-btn-green" onClick={newPost}>＋ Nuevo artículo</button></div> : <div className="ib-list">{filteredPosts.map(post => <article className="ib-post" key={post.id}><div className="ib-thumb">{post.cover_image_url ? <img src={post.cover_image_url} alt="" onError={e => { e.currentTarget.style.display = "none"; }} /> : "▤"}</div><div className="ib-post-info"><strong>{post.title}</strong><small>{post.category ?? "Sin categoría"} · {dateLabel(post.published_at ?? post.created_at)} {post.is_featured ? "· ★ Destacado" : ""}</small></div><span className={`ib-pill ${post.status}`}>{post.status === "published" ? "● Publicado" : "● Borrador"}</span><button type="button" className="ib-btn ib-btn-light" onClick={() => editPost(post)}>Editar ↗</button></article>)}</div>}

            </section>

          </> : <div className="ib-editor-grid">

            <section className="ib-panel"><div className="ib-panel-head"><div><p className="ib-kicker">EDITOR CREATIVO</p><h2>{editingId ? "Editando artículo" : "Empecemos por una gran idea"}</h2><p>Tu artículo, a tu ritmo.</p></div><span className={`ib-pill ${status}`}>{status === "published" ? "● Publicado" : "● Borrador"}</span></div>

              <form className="ib-form" onSubmit={(event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void savePost("draft"); }}>

                <div><label className="ib-label" htmlFor="ib-title">Título del artículo *</label><input className="ib-input" id="ib-title" maxLength={180} value={title} placeholder="Ej. 7 razones para enamorarte del portugués" onChange={event => { const next = event.target.value; if (!editingId && slug === slugify(title)) setSlug(slugify(next)); setTitle(next); }} /></div>

                <div className="ib-row2"><div><label className="ib-label" htmlFor="ib-slug">Dirección del artículo *</label><input className="ib-input" id="ib-slug" value={slug} placeholder="mi-articulo" onChange={e => setSlug(slugify(e.target.value))} /><div className="ib-field-hint">/blog/{slug || "nombre-del-articulo"}</div></div><div><label className="ib-label" htmlFor="ib-category">Categoría</label><select className="ib-input" id="ib-category" value={category} onChange={e => setCategory(e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div></div>

                <div><label className="ib-label" htmlFor="ib-excerpt">Una breve introducción</label><textarea className="ib-input ib-textarea" id="ib-excerpt" rows={3} value={excerpt} placeholder="Cuenta de qué trata tu historia..." onChange={e => setExcerpt(e.target.value)} /></div>

                <div><div className="ib-editor-tabs"><button type="button" className={tab === "write" ? "active" : ""} onClick={() => setTab("write")}>✎ Escribir</button><button type="button" className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")}>◉ Vista previa</button></div>{tab === "write" ? <><label className="ib-label" htmlFor="ib-content">Contenido del artículo *</label><textarea className="ib-input ib-textarea" id="ib-content" rows={17} value={content} placeholder="Aquí empieza tu historia..." onChange={e => setContent(e.target.value)} /><div className="ib-field-hint">Editor de texto simple. La vista previa respeta los saltos de línea.</div></> : <div className="ib-preview"><div className="ib-preview-category">{category.toUpperCase()}</div><h2>{title || "Tu gran título aparecerá aquí"}</h2>{coverImage && <img src={coverImage} alt="Vista previa de portada" onError={e => { e.currentTarget.style.display = "none"; }} />}{excerpt && <p><strong>{excerpt}</strong></p>}<p>{content || "Cuando escribas tu artículo, podrás leerlo aquí antes de guardarlo."}</p></div>}</div>

                <div className="ib-actions"><button type="submit" className="ib-btn ib-btn-dark" disabled={saving}>{saving ? "Guardando..." : "Guardar borrador"}</button><button type="button" className="ib-btn ib-btn-green" disabled={saving} onClick={() => void savePost("published")}>{saving ? "Guardando..." : "✓ Marcar como publicado"}</button><button type="button" className="ib-btn ib-btn-light" disabled={saving} onClick={newPost}>Limpiar</button></div>

              </form>

            </section>

            <aside className="ib-editor-side"><section className="ib-panel"><h3>Presentación</h3><div><label className="ib-label" htmlFor="ib-cover">Imagen de portada (URL)</label><input className="ib-input" id="ib-cover" value={coverImage} placeholder="https://..." onChange={e => setCoverImage(e.target.value)} /><div className="ib-field-hint">Por ahora, utiliza la dirección de una imagen pública.</div></div>{coverImage && <div style={{ marginTop: 12, borderRadius: 12, overflow: "hidden" }}><img src={coverImage} alt="Portada seleccionada" style={{ width: "100%", maxHeight: 170, objectFit: "cover" }} onError={e => { e.currentTarget.style.display = "none"; }} /></div>}<label className="ib-check" style={{ marginTop: 20 }}><input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />★ Destacar artículo</label></section>

              <section className="ib-panel"><h3>Visibilidad en Google</h3><p>Optimiza el título y la descripción para los buscadores cuando lo necesites.</p><details className="ib-seo"><summary>Configurar SEO ▾</summary><div className="ib-form"><div><label className="ib-label" htmlFor="ib-seo-title">Título SEO</label><input className="ib-input" id="ib-seo-title" maxLength={180} value={seoTitle} placeholder="Título para Google" onChange={e => setSeoTitle(e.target.value)} /><div className="ib-field-hint">{seoTitle.length} caracteres</div></div><div><label className="ib-label" htmlFor="ib-meta">Metadescripción</label><textarea className="ib-input ib-textarea" id="ib-meta" rows={4} maxLength={500} value={metaDescription} placeholder="Descripción para Google" onChange={e => setMetaDescription(e.target.value)} /><div className="ib-field-hint">{metaDescription.length} caracteres</div></div></div></details></section>

              <p className="ib-note">ℹ️ Los artículos se guardan en Supabase. Marcar como publicado todavía no los muestra automáticamente en el blog público.</p>

            </aside>

          </div>}

        </div>

      </div>

    </main>

  );

}
