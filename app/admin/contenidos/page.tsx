"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

type AccessStatus = "loading" | "allowed" | "denied";

export default function ContenidosAdminPage() {
  const router = useRouter();
  const [access, setAccess] = useState<AccessStatus>("loading");

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError || !session) {
        router.replace("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("admin_profiles")
        .select("can_content, is_superadmin")
        .eq("user_id", session.user.id)
        .single();

      if (!active) return;
      if (error || !data || (!data.can_content && !data.is_superadmin)) {
        setAccess("denied");
        return;
      }
      setAccess("allowed");
    }

    void checkAccess();
    return () => { active = false; };
  }, [router]);

  if (access === "loading") {
    return <main style={{ padding: 48, fontFamily: "Arial, sans-serif" }}>Verificando permisos...</main>;
  }

  if (access === "denied") {
    return (
      <main style={{ padding: 48, fontFamily: "Arial, sans-serif" }}>
        <h1>Acceso no autorizado</h1>
        <p>No tienes permiso para administrar SEO y Blog.</p>
        <Link href="/admin">Volver al administrador</Link>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: "48px 7%", background: "#f8f5e9", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Link href="/admin" style={{ color: "#087c40", fontWeight: 700 }}>← Volver al administrador</Link>
        <p style={{ marginTop: 38, color: "#087c40", fontWeight: 800 }}>MARKETING Y CONTENIDOS</p>
        <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", marginTop: 0 }}>SEO y Blog</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 760 }}>
          Módulo inicial habilitado. En las siguientes etapas incorporaremos el editor SEO de páginas,
          la administración de artículos y las opciones de publicación.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginTop: 30 }}>
          {[
            { title: "SEO de páginas", detail: "Próximamente: títulos, descripciones y URLs." },
            { title: "Artículos del blog", detail: "Próximamente: borradores, editor y publicación." },
            { title: "Categorías y etiquetas", detail: "Próximamente: organización de contenidos." },
          ].map((item) => (
            <article key={item.title} style={{ background: "white", borderRadius: 20, padding: 28, borderTop: "6px solid #009c4b" }}>
              <h2 style={{ marginTop: 0 }}>{item.title}</h2>
              <p style={{ lineHeight: 1.6, color: "#555" }}>{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
