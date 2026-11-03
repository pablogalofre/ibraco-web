import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
export async function GET() {
  const headers = { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store" };
  try {
    // Cliente anónimo independiente: nunca usa la sesión de un administrador.
    const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(6000) }) },
    });
    const { data, error } = await client.from("site_promotions")
      .select("id,name,image_url,image_alt,target_url,button_label,pages,enabled,starts_at,ends_at,delay_seconds,priority,version")
      .order("priority", { ascending: false }).order("starts_at", { ascending: false }).order("id").limit(100);
    return Response.json({ campaigns: error ? [] : data ?? [], serverNow: Date.now() }, { headers });
  } catch { return Response.json({ campaigns: [], serverNow: Date.now() }, { headers }); }
}
