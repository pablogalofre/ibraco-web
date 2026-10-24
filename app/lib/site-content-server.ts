import "server-only";
import { createClient } from "@supabase/supabase-js";
import {
  defaultContent,
  resolveContent,
  type PagePath,
  type PageContent,
} from "./site-content-schema";

/** Read only the published projection, never the drafts or an admin session. */
export async function getPublishedPageContent(
  path: PagePath,
): Promise<PageContent> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return defaultContent(path);
  try {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
      },
    });
    const { data, error } = await client
      .from("site_content_public")
      .select("content")
      .eq("page_path", path)
      .abortSignal(AbortSignal.timeout(6000))
      .maybeSingle();
    if (error || !data) return defaultContent(path);
    return resolveContent(path, data.content);
  } catch {
    return defaultContent(path);
  }
}
