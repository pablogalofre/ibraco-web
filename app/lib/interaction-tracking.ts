export type InteractionKind = "popup_view" | "popup_click" | "whatsapp_click";
export type InteractionSurface = "modal" | "image" | "button" | "floating";
export function isTrackedPage(path: string) {
  return /^\/(?:$|(?:cursos|sedes|cultura|agenda-cultural|empresas|alumni|blog|eventos|nivelacion)(?:\/[A-Za-z0-9_-]+)*\/?$)/.test(path)
    && !/^\/eventos\/pago(?:\/|$)/.test(path) && path.length <= 300;
}
export function recordInteraction(kind: InteractionKind, surface: InteractionSurface, campaignId?: string, impressionId?: string) {
  try {
    const page = window.location.pathname.replace(/\/$/, "") || "/";
    if (!isTrackedPage(page) || document.visibilityState !== "visible") return;
    const body = JSON.stringify({ event_id: crypto.randomUUID(), kind, surface, page, campaign_id: campaignId ?? null, impression_id: impressionId ?? null });
    // No espera al registro para abrir WhatsApp. Los reintentos usan el mismo ID.
    const send = () => fetch("/api/public/interactions", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true, credentials: "omit" });
    void send().then(response => { if (response.status >= 500) return send(); }).catch(() => { void send().catch(() => {}); });
  } catch { /* La medición nunca debe interrumpir la navegación. */ }
}
