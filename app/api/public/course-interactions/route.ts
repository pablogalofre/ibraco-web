import { createClient } from "@supabase/supabase-js";
import { trackedPrograms } from "../../../lib/course-tracking";
export const dynamic = "force-dynamic";
const reply = (status: number) => new Response(null, { status, headers: { "Cache-Control": "no-store" } });
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export async function POST(request: Request) {
  const origin = request.headers.get("origin"), site = request.headers.get("sec-fetch-site"), host = request.headers.get("host") ?? new URL(request.url).host;
  if (site === "cross-site" || site === "same-site") return reply(403);
  if (origin) { try { const source = new URL(origin); if (!["http:","https:"].includes(source.protocol) || source.host !== host) return reply(403); } catch { return reply(403); } }
  else if (site !== "same-origin") return reply(403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply(415);
  if (Number(request.headers.get("content-length") ?? 0) > 2048) return reply(413);
  const reader = request.body?.getReader(); if (!reader) return reply(400);
  try {
    let size = 0, body = ""; const decoder = new TextDecoder();
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > 2048) { await reader.cancel(); return reply(413); } body += decoder.decode(value, { stream: true }); }
    const d = JSON.parse(body + decoder.decode());
    if (!d || !uuid.test(d.event_id ?? "") || !["catalog_view","catalog_search","course_detail_click","catalog_whatsapp","program_click","availability_click"].includes(d.kind)) return reply(400);
    if ([d.campus,d.modality,d.program,d.surface].some(v => typeof v !== "string" || v.length > 80) || (d.program && !trackedPrograms.includes(d.program))) return reply(400);
    if (!(d.results === null || Number.isInteger(d.results) && d.results >= 0 && d.results <= 10000)) return reply(400);
    if (d.kind === "course_detail_click" ? typeof d.course_id !== "string" || !/^[0-9]{1,16}$/.test(d.course_id) : d.course_id !== null) return reply(400);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return reply(503);
    const db = createClient(url,key,{ auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:"no-store",signal:AbortSignal.timeout(5000)})} });
    const { error } = await db.rpc("record_course_interaction",{p_event_id:d.event_id,p_kind:d.kind,p_course_id:d.course_id,p_campus:d.campus,p_modality:d.modality,p_program:d.program,p_results:d.results,p_surface:d.surface});
    return reply(error ? 503 : 204);
  } catch { return reply(400); }
}
