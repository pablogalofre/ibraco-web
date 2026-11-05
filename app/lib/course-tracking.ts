export type CourseEvent = "catalog_view" | "catalog_search" | "course_detail_click" | "catalog_whatsapp" | "program_click" | "availability_click";
export type CourseContext = { campus: string; modality: string; program: string; results: number | null };
export const trackedPrograms = ["intensivo","semi-intensivo","semi-intensivo-sabados","expresso","celpe-bras","particulares","empresas","instituciones-educativas"];
export function recordCourseEvent(kind: CourseEvent, context: CourseContext, courseId: string | null = null, program = "", surface = "catalog") {
  try {
    if (location.pathname.replace(/\/$/, "") !== "/cursos" || document.visibilityState !== "visible") return;
    const body = JSON.stringify({ event_id: crypto.randomUUID(), kind, course_id: courseId, campus: context.campus, modality: context.modality, program: program || context.program, results: context.results, surface });
    const send = () => fetch("/api/public/course-interactions", { method: "POST", headers: { "Content-Type": "application/json" }, body, credentials: "omit", keepalive: true });
    void send().then(r => { if (r.status >= 500) return send(); }).catch(() => { void send().catch(() => {}); });
  } catch { /* Medir no debe afectar la búsqueda ni los enlaces. */ }
}
