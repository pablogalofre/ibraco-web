"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase";
import {
  CONTENT_PAGES,
  PAGE_PATHS,
  defaultContent,
  validateContent,
  type PagePath,
  type PageContent,
  type ContentField,
} from "../../lib/site-content-schema";
import styles from "./pages-editor.module.css";

type Document = {
  page_path: PagePath;
  draft_content: PageContent;
  version: number;
  published_version: number | null;
  updated_at: string;
  published_at: string | null;
};
type Revision = {
  id: string;
  version: number;
  action: string;
  created_at: string;
};
const date = (value: string) =>
  new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
const actionLabel: Record<string, string> = {
  initial: "Contenido inicial",
  save: "Borrador guardado",
  publish: "Publicación",
  restore: "Versión recuperada",
};
const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export default function PagesEditor() {
  const router = useRouter();
  const [access, setAccess] = useState<"loading" | "allowed" | "denied">(
    "loading",
  );
  const [page, setPage] = useState<PagePath>("/");
  const [document, setDocument] = useState<Document | null>(null);
  const [content, setContent] = useState<PageContent>(defaultContent("/"));
  const [history, setHistory] = useState<Revision[]>([]);
  const [section, setSection] = useState(CONTENT_PAGES["/"].fields[0].section);
  const [tab, setTab] = useState<"edit" | "history">("edit");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [conflict, setConflict] = useState(false);
  const lock = useRef(false);
  const dirty =
    document !== null &&
    JSON.stringify(content) !== JSON.stringify(document.draft_content);
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;
  const sections = Array.from(
    new Set(CONTENT_PAGES[page].fields.map((f) => f.section)),
  );
  const fields = CONTENT_PAGES[page].fields.filter((f) =>
    query.trim()
      ? `${f.label} ${f.section} ${content[f.key]}`
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase())
      : f.section === section,
  );

  useEffect(() => {
    let active = true;
    async function authorize() {
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
        const { data, error: permissionError } = await supabase
          .from("admin_profiles")
          .select("can_content,is_superadmin")
          .eq("user_id", user.id)
          .single();
        if (!active) return;
        setAccess(
          !permissionError && (data?.can_content || data?.is_superadmin)
            ? "allowed"
            : "denied",
        );
      } catch {
        if (active) {
          setAccess("denied");
          setError("No pudimos verificar tu acceso. Intenta nuevamente.");
        }
      }
    }
    void authorize();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAccess("loading");
        setDocument(null);
        router.replace("/admin/login");
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    function leave(event: BeforeUnloadEvent) {
      if (dirtyRef.current || lock.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", leave);
    return () => window.removeEventListener("beforeunload", leave);
  }, []);

  useEffect(() => {
    if (access !== "allowed") return;
    let active = true;
    setLoading(true);
    setError("");
    setNotice("");
    setConflict(false);
    setDocument(null);
    void Promise.all([
      supabase
        .from("site_content_documents")
        .select(
          "page_path,draft_content,version,published_version,updated_at,published_at",
        )
        .eq("page_path", page)
        .single(),
      supabase
        .from("site_content_revisions")
        .select("id,version,action,created_at")
        .eq("page_path", page)
        .order("version", { ascending: false })
        .limit(40),
    ])
      .then(([docResult, historyResult]) => {
        if (!active) return;
        if (docResult.error || historyResult.error || !docResult.data)
          throw new Error(
            "El editor de páginas todavía no está disponible. Contacta al administrador para habilitarlo.",
          );
        const loaded = docResult.data as Document;
        loaded.draft_content = validateContent(page, loaded.draft_content);
        setDocument(loaded);
        setContent(loaded.draft_content);
        setHistory((historyResult.data || []) as Revision[]);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "No pudimos cargar la página.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [access, page]);

  function switchPage(next: PagePath) {
    if (loading || lock.current || next === page) return;
    if (
      dirty &&
      !window.confirm(
        "Tienes cambios sin guardar. ¿Descartarlos y cambiar de página?",
      )
    )
      return;
    setPage(next);
    setContent(defaultContent(next));
    setDocument(null);
    setSection(CONTENT_PAGES[next].fields[0].section);
    setQuery("");
    setTab("edit");
  }
  function leaveEditor(event: React.MouseEvent<HTMLAnchorElement>) {
    if (
      lock.current ||
      (dirty && !window.confirm("¿Salir sin guardar los cambios?"))
    )
      event.preventDefault();
  }
  function change(field: ContentField, value: string) {
    setContent((current) => ({ ...current, [field.key]: value }));
    setNotice("");
  }

  async function mutate(
    action: "save" | "publish" | "restore",
    revision?: Revision,
  ) {
    if (!document || lock.current || conflict) return;
    if (action !== "save" && dirty) {
      setError("Guarda o descarta tus cambios antes de continuar.");
      return;
    }
    if (
      action === "publish" &&
      !window.confirm(
        `¿Publicar el borrador de ${CONTENT_PAGES[page].name}? Los visitantes verán esta versión.`,
      )
    )
      return;
    if (
      action === "restore" &&
      !window.confirm(
        `¿Recuperar la versión ${revision?.version} como borrador? La web pública conservará su versión actual.`,
      )
    )
      return;
    lock.current = true;
    setBusy(action);
    setError("");
    setNotice("");
    try {
      const payload = action === "save" ? validateContent(page, content) : null;
      const { data, error: saveError } = await supabase.rpc(
        "site_content_write",
        {
          p_page_path: page,
          p_expected_version: document.version,
          p_action: action,
          p_content: payload,
          p_revision_id: revision?.id || null,
        },
      );
      if (saveError) {
        if (saveError.code === "40001") {
          setConflict(true);
          throw new Error(
            "Otra persona actualizó esta página. Conservamos tus cambios en pantalla; recarga para abrir la versión más reciente.",
          );
        }
        if (saveError.code === "42501")
          throw new Error(
            "Tu sesión o tus permisos cambiaron. Vuelve a iniciar sesión.",
          );
        throw new Error(
          saveError.message || "No pudimos guardar. Intenta nuevamente.",
        );
      }
      const saved = data as Document;
      if (
        !saved ||
        saved.page_path !== page ||
        !Number.isSafeInteger(saved.version)
      )
        throw new Error(
          "No pudimos confirmar el guardado. Recarga antes de reintentar.",
        );
      saved.draft_content = validateContent(page, saved.draft_content);
      setDocument(saved);
      setContent(saved.draft_content);
      setNotice(
        action === "publish"
          ? "Publicado. La web mostrará esta versión al volver a cargar la página."
          : action === "restore"
            ? "Versión recuperada como borrador. Revísala antes de publicarla."
            : "Borrador guardado. La web pública conserva su versión actual.",
      );
      const { data: revisions, error: historyError } = await supabase
        .from("site_content_revisions")
        .select("id,version,action,created_at")
        .eq("page_path", page)
        .order("version", { ascending: false })
        .limit(40);
      if (!historyError) setHistory((revisions || []) as Revision[]);
      else setHistory([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pudimos guardar los cambios.",
      );
    } finally {
      setBusy("");
      lock.current = false;
    }
  }

  async function upload(field: ContentField, file: File | undefined) {
    if (!file || lock.current || !document || conflict) return;
    const extension = imageTypes.get(file.type);
    if (!extension || file.size > 5 * 1024 * 1024) {
      setError("Selecciona una imagen JPG, PNG, WebP o AVIF de máximo 5 MB.");
      return;
    }
    lock.current = true;
    setBusy(field.key);
    setError("");
    setNotice("");
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user)
        throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
      const objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("site-content")
        .upload(objectPath, file, { upsert: false, contentType: file.type });
      if (uploadError)
        throw new Error(
          "No pudimos subir la imagen. Intenta nuevamente o pega su dirección pública.",
        );
      const { data } = supabase.storage
        .from("site-content")
        .getPublicUrl(objectPath);
      change(field, data.publicUrl);
      setNotice(
        "Imagen lista en el editor. Guarda el borrador para conservarla en esta página.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No pudimos subir la imagen.",
      );
    } finally {
      setBusy("");
      lock.current = false;
    }
  }

  if (access !== "allowed")
    return (
      <main className={styles.gate}>
        <img src="/assets/logos/logo-ibraco.png" alt="IBRACO" />
        <h1>
          {access === "loading"
            ? "Verificando acceso…"
            : "Acceso a contenidos requerido"}
        </h1>
        <p>
          {error ||
            (access === "denied"
              ? "Tu usuario necesita permiso de contenidos para editar estas páginas."
              : "")}
        </p>
        <Link href="/admin">Volver al administrador</Link>
      </main>
    );
  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link href="/admin" onClick={leaveEditor} className={styles.brand}>
          <img src="/assets/logos/logo-ibraco.png" alt="IBRACO" />
          <span>Editor de páginas</span>
        </Link>
        <p className={styles.navLabel}>Páginas del sitio</p>
        <nav aria-label="Páginas editables">
          {PAGE_PATHS.map((path) => (
            <button
              key={path}
              type="button"
              disabled={loading || Boolean(busy)}
              className={page === path ? styles.selected : ""}
              onClick={() => switchPage(path)}
            >
              {CONTENT_PAGES[path].name}
              <span>
                {path === "/"
                  ? "Portada y bloques principales"
                  : "Norte, CityU y virtual"}
              </span>
            </button>
          ))}
        </nav>
        <div className={styles.sideLinks}>
          <Link href="/admin/contenidos" onClick={leaveEditor}>
            Artículos y SEO →
          </Link>
          <Link href="/admin" onClick={leaveEditor}>
            Centro de administración →
          </Link>
          <a href={page} target="_blank" rel="noopener noreferrer">
            Ver página pública ↗
          </a>
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Contenidos del sitio</p>
            <h1>{CONTENT_PAGES[page].name}</h1>
            <p>
              Edita textos, imágenes y botones. Guarda un borrador y publícalo
              cuando esté listo.
            </p>
          </div>
          <span className={styles.badge}>
            {!document
              ? "Cargando"
              : dirty
                ? "Cambios sin guardar"
                : document.published_version === document.version
                  ? "Versión publicada"
                  : "Borrador"}
          </span>
        </header>
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button
              type="button"
              className={tab === "edit" ? styles.activeTab : ""}
              onClick={() => setTab("edit")}
            >
              Editar contenido
            </button>
            <button
              type="button"
              className={tab === "history" ? styles.activeTab : ""}
              onClick={() => setTab("history")}
            >
              Historial
            </button>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.secondary}
              type="button"
              disabled={
                !document || loading || Boolean(busy) || !dirty || conflict
              }
              onClick={() => void mutate("save")}
            >
              {busy === "save" ? "Guardando…" : "Guardar borrador"}
            </button>
            {document && !dirty && !busy && !conflict ? (
              <a
                className={styles.secondary}
                href={`/admin/paginas/vista-previa?pagina=${encodeURIComponent(page)}&v=${document.version}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Vista previa ↗
              </a>
            ) : (
              <button
                type="button"
                className={styles.secondary}
                disabled
                title="Guarda el borrador antes de abrir la vista previa"
              >
                Vista previa
              </button>
            )}
            <button
              className={styles.primary}
              type="button"
              disabled={
                !document ||
                loading ||
                Boolean(busy) ||
                dirty ||
                conflict ||
                document.published_version === document.version
              }
              onClick={() => void mutate("publish")}
            >
              {busy === "publish" ? "Publicando…" : "Publicar"}
            </button>
          </div>
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
            {conflict && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      "¿Descartar los cambios en pantalla y cargar la versión más reciente?",
                    )
                  )
                    window.location.reload();
                }}
              >
                Recargar página
              </button>
            )}
          </p>
        )}
        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
        <p className={styles.hint}>
          El borrador es privado. La vista previa muestra el último borrador
          guardado.{" "}
          {page === "/" && (
            <>
              El H1 de Inicio se edita en{" "}
              <Link href="/admin/contenidos" onClick={leaveEditor}>
                SEO de páginas
              </Link>
              .
            </>
          )}
        </p>
        {loading && (
          <div className={styles.empty} role="status">
            Cargando contenido…
          </div>
        )}
        {document && !loading && tab === "edit" && (
          <>
            <label className={styles.search}>
              Buscar un texto o campo
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Por ejemplo: CityU, botón o imagen"
                type="search"
              />
            </label>
            <div className={styles.editorGrid}>
              <nav
                className={styles.sections}
                aria-label="Bloques de la página"
              >
                {sections.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={
                      section === name && !query ? styles.selectedSection : ""
                    }
                    onClick={() => {
                      setSection(name);
                      setQuery("");
                    }}
                  >
                    {name}
                  </button>
                ))}
              </nav>
              <section className={styles.fields} aria-label="Campos editables">
                <h2>{query ? "Resultados de búsqueda" : section}</h2>
                <fieldset disabled={Boolean(busy) || conflict}>
                  {fields.map((field) => (
                    <div className={styles.field} key={field.key}>
                      <label htmlFor={`field-${field.key}`}>
                        {field.label}
                        {!field.required && <small>Opcional</small>}
                      </label>
                      {field.kind === "textarea" ? (
                        <textarea
                          id={`field-${field.key}`}
                          rows={4}
                          value={content[field.key]}
                          maxLength={field.maxLength}
                          onChange={(e) => change(field, e.target.value)}
                        />
                      ) : (
                        <input
                          id={`field-${field.key}`}
                          type="text"
                          value={content[field.key]}
                          maxLength={field.maxLength}
                          onChange={(e) => change(field, e.target.value)}
                        />
                      )}
                      {field.kind === "image" && (
                        <>
                          <input
                            id={`upload-${field.key}`}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            aria-label={`Subir ${field.label}`}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = "";
                              void upload(field, file);
                            }}
                          />
                          <small>
                            Sube una imagen de hasta 5 MB o pega su dirección
                            pública.
                          </small>
                          {content[field.key] && (
                            <img
                              src={content[field.key]}
                              alt="Vista de la imagen seleccionada"
                              className={styles.imagePreview}
                            />
                          )}
                        </>
                      )}
                      {field.kind === "link" && (
                        <small>
                          Ruta del sitio, como /cursos, o dirección https://
                          completa.
                        </small>
                      )}
                      <button
                        type="button"
                        className={styles.resetField}
                        onClick={() => change(field, field.defaultValue)}
                      >
                        Usar contenido inicial
                      </button>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p>No encontramos campos con ese texto.</p>
                  )}
                </fieldset>
              </section>
            </div>
          </>
        )}
        {document && !loading && tab === "history" && (
          <section className={styles.history}>
            <h2>Versiones guardadas</h2>
            <p>
              Recuperar una versión crea un borrador nuevo. Solo cambia la web
              al publicarlo.
            </p>
            {history.length === 40 && (
              <p>Se muestran las 40 versiones más recientes.</p>
            )}
            {history.map((revision) => (
              <article key={revision.id}>
                <div>
                  <strong>
                    Versión {revision.version} ·{" "}
                    {actionLabel[revision.action] || revision.action}
                  </strong>
                  <p>
                    {date(revision.created_at)}
                    {document.published_version === revision.version
                      ? " · Publicada actualmente"
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.secondary}
                  disabled={
                    Boolean(busy) ||
                    dirty ||
                    conflict ||
                    revision.version === document.version
                  }
                  onClick={() => void mutate("restore", revision)}
                >
                  Recuperar como borrador
                </button>
              </article>
            ))}
          </section>
        )}
        {document && (
          <p className={styles.hint}>
            Último guardado: {date(document.updated_at)} · Versión{" "}
            {document.version}
            {document.published_at
              ? ` · Última publicación: ${date(document.published_at)}`
              : " · Esta página conserva por ahora su contenido inicial"}
          </p>
        )}
      </div>
    </main>
  );
}
