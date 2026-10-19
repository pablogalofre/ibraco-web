import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

export type PublicPost = {
  id: string; slug: string; title: string; excerpt: string | null;
  content: string; category: string | null; cover_image_url: string | null;
  seo_title: string | null; meta_description: string | null;
  is_featured: boolean; published_at: string | null;
};

const fields = "id,slug,title,excerpt,content,category,cover_image_url,seo_title,meta_description,is_featured,published_at";

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Falta la configuración pública de Supabase.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => fetch(input, {
        ...init, cache: "no-store", signal: AbortSignal.timeout(15000),
      }),
    },
  });
}

export async function listPublicPosts(category: string, page: number) {
  const client = publicClient();
  let query = client.from("blog_posts").select(fields, { count: "exact" })
    .eq("status", "published");
  if (category) query = query.eq("category", category);
  const { data, error, count } = await query
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false }).range((page - 1) * 12, page * 12 - 1);
  if (error) {
    console.error("No se pudo consultar el blog:", error.code);
    throw new Error("No se pudo cargar el blog.");
  }
  return { posts: (data ?? []) as PublicPost[], total: count ?? 0 };
}

export async function listFeaturedPosts() {
  const { data, error } = await publicClient().from("blog_posts").select(fields)
    .eq("status", "published").eq("is_featured", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false }).limit(3);
  if (error) throw new Error("No se pudieron cargar los destacados.");
  return (data ?? []) as PublicPost[];
}

export const getPublicPost = cache(async (slug: string): Promise<PublicPost | null> => {
  const { data, error } = await publicClient().from("blog_posts").select(fields)
    .eq("status", "published").eq("slug", slug).maybeSingle();
  if (error) {
    console.error("No se pudo consultar el artículo:", error.code);
    throw new Error("No se pudo cargar el artículo.");
  }
  return data as PublicPost | null;
});

export function safeCover(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}

export function postDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota",
  });
}
