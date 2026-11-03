export const PROMOTION_PAGES = [
  ["/", "Inicio"], ["/cursos", "Cursos"], ["/sedes", "Sedes"],
  ["/cultura", "Cultura"], ["/agenda-cultural", "Agenda cultural"],
  ["/empresas", "Empresas"], ["/alumni", "Alumni"], ["/blog", "Blog"],
] as const;
export type Promotion = {
  id: string; name: string; image_url: string; image_alt: string;
  target_url: string; button_label: string; pages: string[];
  enabled: boolean; starts_at: string; ends_at: string;
  delay_seconds: number; priority: number; version: number;
};
export function safePromotionUrl(value: string, image = false) {
  if (/[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
  if (image && value.startsWith("/assets/") && !value.includes("..")) return true;
  try { const u = new URL(value); return u.protocol === "https:" && Boolean(u.hostname) && !u.username && !u.password; } catch { return false; }
}
export function promotionErrors(p: Promotion) {
  const errors: string[] = [];
  if (!p.name.trim() || p.name.length > 100) errors.push("Escribe un nombre de hasta 100 caracteres.");
  if (!safePromotionUrl(p.image_url, true) || p.image_url.length > 2048) errors.push("Sube una imagen o escribe su dirección HTTPS.");
  if (!p.image_alt.trim() || p.image_alt.length > 300) errors.push("Describe la promoción en máximo 300 caracteres.");
  if (!safePromotionUrl(p.target_url) || p.target_url.length > 2048) errors.push("El enlace del botón debe empezar por https:// y no contener espacios.");
  if (!p.button_label.trim() || p.button_label.length > 80) errors.push("Escribe el texto del botón (máximo 80 caracteres).");
  if (!p.pages.length || p.pages.some(path => !PROMOTION_PAGES.some(([allowed]) => allowed === path))) errors.push("Selecciona al menos una página del listado.");
  if (!Number.isFinite(Date.parse(p.starts_at)) || !Number.isFinite(Date.parse(p.ends_at)) || Date.parse(p.ends_at) <= Date.parse(p.starts_at)) errors.push("La fecha de retiro debe ser posterior al inicio.");
  if (!Number.isInteger(p.delay_seconds) || p.delay_seconds < 0 || p.delay_seconds > 30) errors.push("La espera debe estar entre 0 y 30 segundos.");
  if (!Number.isInteger(p.priority) || p.priority < 0 || p.priority > 100) errors.push("La prioridad debe estar entre 0 y 100.");
  return errors;
}
export function promotionState(p: Promotion, now = Date.now()) {
  if (Date.parse(p.ends_at) <= now) return "Finalizada";
  if (!p.enabled) return "Desactivada";
  return Date.parse(p.starts_at) > now ? "Programada" : "Activa";
}
// Los horarios del formulario siempre son Colombia, incluso desde otro país.
export function colombiaInput(iso: string) {
  const time = Date.parse(iso);
  return Number.isFinite(time) ? new Date(time - 5 * 3600000).toISOString().slice(0, 16) : "";
}
export function fromColombiaInput(value: string) {
  return value ? new Date(`${value}:00-05:00`).toISOString() : "";
}
