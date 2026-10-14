import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const FALLBACK: Record<string, { title: string; description: string }> = {
  "/": { title: "IBRACO | Instituto de Cultura Brasil Colombia", description: "Aprende portugués con IBRACO. Conoce nuestros cursos presenciales y virtuales, horarios y opciones de matrícula." },
  "/cursos": { title: "Cursos de portugués | IBRACO", description: "Conoce los cursos de portugués de IBRACO, sus modalidades y horarios." },
  "/agenda-cultural": { title: "Agenda cultural | IBRACO", description: "Descubre la agenda cultural de IBRACO." },
  "/eventos": { title: "Eventos | IBRACO", description: "Conoce los eventos de IBRACO." },
  "/cultura": { title: "Cultura brasileña | IBRACO", description: "Explora la cultura brasileña con IBRACO." },
  "/empresas": { title: "Portugués para empresas | IBRACO", description: "Conoce los programas de portugués para empresas de IBRACO." },
  "/sedes": { title: "Sedes | IBRACO", description: "Conoce las sedes de IBRACO y nuestras modalidades de estudio." },
  "/alumni": { title: "Alumni | IBRACO", description: "Conoce la comunidad Alumni de IBRACO." },
  "/blog": { title: "Blog | IBRACO", description: "Artículos sobre portugués y cultura brasileña en el blog de IBRACO." },
};

export async function getSeoMetadata(path: string): Promise<Metadata> {
  const fallback = FALLBACK[path] ?? FALLBACK["/"];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return fallback;
  try {
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client
      .from("seo_pages")
      .select("seo_title, meta_description")
      .eq("page_path", path)
      .maybeSingle();
    if (error) {
      console.error("No se pudo leer SEO de", path, error.message);
      return fallback;
    }
    return {
      title: data?.seo_title?.trim() || fallback.title,
      description: data?.meta_description?.trim() || fallback.description,
    };
  } catch (error) {
    console.error("Error cargando SEO de", path, error);
    return fallback;
  }
}
