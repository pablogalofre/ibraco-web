import { createClient } from "@supabase/supabase-js";
import { isTrackedPage } from "../../../lib/interaction-tracking";

export const dynamic = "force-dynamic";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const reply = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  // Solo admite peticiones del propio sitio; no necesita una clave secreta.
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  const host = request.headers.get("host") ?? new URL(request.url).host;
  // Next puede usar un host interno en request.url detrás del proxy.
  // Fetch Metadata identifica además los POST propios que omiten Origin.
  if (site === "cross-site" || site === "same-site") return reply(403);
  if (origin) {
    try { const source = new URL(origin); if (!["https:", "http:"].includes(source.protocol) || source.host !== host) return reply(403); }
    catch { return reply(403); }
  } else if (site !== "same-origin") return reply(403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply(415);
  if (Number(request.headers.get("content-length") ?? 0) > 2048) return reply(413);
  let raw = "";
  const reader = request.body?.getReader();
  if (!reader) return reply(400);
  let size = 0;
  try {
    const decoder = new TextDecoder();
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 2048) { await reader.cancel(); return reply(413); } raw += decoder.decode(value, { stream: true }); }
    raw += decoder.decode();
    const data = JSON.parse(raw);
    if (!data || !uuid.test(data.event_id ?? "") || typeof data.page !== "string" || !isTrackedPage(data.page)) return reply(400);
    if (data.kind === "whatsapp_click") {
      if (data.surface !== "floating" || data.campaign_id !== null || data.impression_id !== null) return reply(400);
    } else if (data.kind === "popup_view" || data.kind === "popup_click") {
      if (!uuid.test(data.campaign_id ?? "") || !uuid.test(data.impression_id ?? "") || (data.kind === "popup_view" ? data.surface !== "modal" : !["image", "button"].includes(data.surface))) return reply(400);
    } else return reply(400);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return reply(503);
    const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store", signal: AbortSignal.timeout(5000) }) } });
    const { error } = await db.rpc("record_site_interaction", { p_event_id: data.event_id, p_kind: data.kind, p_surface: data.surface, p_page: data.page, p_campaign_id: data.campaign_id, p_impression_id: data.impression_id });
    return reply(error ? 503 : 204);
  } catch { return reply(400); }
}
