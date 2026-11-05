"use client";
import { useEffect, useRef } from "react";
import { recordCourseEvent, type CourseContext, type CourseEvent } from "../lib/course-tracking";

export default function CourseTracking({ context }: { context: CourseContext }) {
  const lastView = useRef("");
  const recent = useRef(new Map<string, number>());
  const signature = JSON.stringify(context);
  useEffect(() => {
    const value = JSON.parse(signature) as CourseContext;
    function view() {
      if (document.visibilityState !== "visible" || lastView.current === signature) return;
      lastView.current = signature; recordCourseEvent("catalog_view", value);
    }
    function send(kind: CourseEvent, key: string, courseId: string | null = null, program = "", surface = "catalog") {
      const now = Date.now();
      if (now - (recent.current.get(key) ?? 0) < 1000) return;
      recent.current.set(key, now); recordCourseEvent(kind, value, courseId, program, surface);
    }
    function click(event: MouseEvent) {
      if (event.button !== 0 || event.defaultPrevented || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>("a[data-course-event]");
      if (!link) return;
      const kind = link.dataset.courseEvent as CourseEvent;
      if (!["course_detail_click","catalog_whatsapp","program_click","availability_click"].includes(kind)) return;
      send(kind, link.href, link.dataset.courseId ?? null, link.dataset.program ?? "", link.dataset.surface ?? "catalog");
    }
    function submit(event: SubmitEvent) {
      if (!(event.target instanceof HTMLFormElement) || !event.target.matches("form[data-course-search]")) return;
      // El envío cuenta una búsqueda; los resultados y filtros se miden al cargar la página resultante.
      send("catalog_search", "search");
    }
    view(); document.addEventListener("visibilitychange", view); document.addEventListener("click", click); document.addEventListener("submit", submit);
    return () => { document.removeEventListener("visibilitychange", view); document.removeEventListener("click", click); document.removeEventListener("submit", submit); };
  }, [signature]);
  return null;
}
