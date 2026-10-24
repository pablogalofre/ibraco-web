"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import HomeContent from "../../../components/home-content";
import SedesContent from "../../../components/sedes-content";
import {
  CONTENT_PAGES,
  isPagePath,
  validateContent,
  type PagePath,
  type PageContent,
} from "../../../lib/site-content-schema";
import styles from "../pages-editor.module.css";

export default function ContentPreview() {
  const router = useRouter();
  const [page, setPage] = useState<PagePath>("/");
  const [content, setContent] = useState<PageContent | null>(null);
  const [seoH1, setSeoH1] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("desktop");
  const [embedded, setEmbedded] = useState(false);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    async function load() {
      const query = new URLSearchParams(window.location.search);
      const path = query.get("pagina");
      if (!isPagePath(path)) {
        setError("Página no disponible.");
        return;
      }
      setPage(path);
      setEmbedded(query.get("modo") === "contenido");
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
        const { data: profile, error: permissionError } = await supabase
          .from("admin_profiles")
          .select("can_content,is_superadmin")
          .eq("user_id", user.id)
          .single();
        if (
          permissionError ||
          (!profile?.can_content && !profile?.is_superadmin)
        )
          throw new Error("Tu usuario no tiene permiso para ver borradores.");
        const { data, error: contentError } = await supabase
          .from("site_content_documents")
          .select("draft_content,version")
          .eq("page_path", path)
          .single();
        if (contentError || !data)
          throw new Error("No pudimos cargar este borrador.");
        if (!active) return;
        const expectedVersion = query.get("v");
        if (expectedVersion !== null && Number(expectedVersion) !== data.version) {
          throw new Error("El borrador cambió desde que abriste el editor. Vuelve al editor y recarga antes de revisar esta versión.");
        }
        const draft = validateContent(path, data.draft_content);
        if (path === "/") {
          const { data: seo } = await supabase
            .from("seo_pages")
            .select("h1")
            .eq("page_path", "/")
            .maybeSingle();
          if (!active) return;
          setSeoH1(seo?.h1?.trim() || null);
        }
        setContent(draft);
        setVersion(data.version);
      } catch (err) {
        if (active)
          setError(
            err instanceof Error
              ? err.message
              : "No pudimos abrir la vista previa.",
          );
      }
    }
    void load();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setContent(null);
        router.replace("/admin/login");
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);
  if (error || !content)
    return (
      <main className={styles.gate}>
        <h1>{error || "Preparando vista previa…"}</h1>
        <Link href="/admin/paginas">Volver al editor</Link>
      </main>
    );
  if (embedded)
    return (
      <>
        <div className={styles.previewLabel}>
          Vista previa privada · {CONTENT_PAGES[page].name} · versión {version}
        </div>
        <div className={styles.previewHeader}>
          <img src="/assets/logos/logo-ibraco.png" alt="IBRACO" />
        </div>
        <div inert className={styles.previewContent}>
          {page === "/" ? (
            <HomeContent content={content} seoH1={seoH1} />
          ) : (
            <SedesContent content={content} />
          )}
        </div>
      </>
    );
  return (
    <main className={styles.previewShell}>
      <div className={styles.previewBar}>
        <div>
          <strong>Vista previa privada · {CONTENT_PAGES[page].name}</strong>
          <p>
            Último borrador guardado. Los botones de la vista previa están
            desactivados.
          </p>
        </div>
        <div>
          <button
            type="button"
            aria-pressed={mode === "desktop"}
            onClick={() => setMode("desktop")}
          >
            Escritorio
          </button>{" "}
          <button
            type="button"
            aria-pressed={mode === "mobile"}
            onClick={() => setMode("mobile")}
          >
            Móvil
          </button>{" "}
          <Link href="/admin/paginas">Volver al editor</Link>
        </div>
      </div>
      <iframe
        className={styles.previewFrame}
        style={{ width: mode === "mobile" ? 390 : "100%" }}
        title={`Vista previa de ${CONTENT_PAGES[page].name}`}
        src={`/admin/paginas/vista-previa?pagina=${encodeURIComponent(page)}&modo=contenido&v=${version}`}
      />
    </main>
  );
}
