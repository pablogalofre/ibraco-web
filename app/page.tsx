import HomeContent from "./components/home-content";
import { getPublishedPageContent } from "./lib/site-content-server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

async function getHomeH1(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  try {
    const supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data, error } = await supabase
      .from("seo_pages")
      .select("h1")
      .eq("page_path", "/")
      .maybeSingle();

    if (error) {
      console.error("Error consultando H1:", error.message);
      return null;
    }

    return data?.h1?.trim() || null;
  } catch {
    return null;
  }
}

export default async function Page() {
  const [content, seoH1] = await Promise.all([
    getPublishedPageContent("/"),
    getHomeH1(),
  ]);
  return <HomeContent content={content} seoH1={seoH1} />;
}
