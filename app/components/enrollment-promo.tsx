"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./enrollment-promo.module.css";

// Fin del 3 de noviembre de 2026, hora de Colombia (UTC-5).
const EXPIRES_AT = Date.parse("2026-11-04T00:00:00-05:00");
const SESSION_KEY = "ibraco:promo:centro-3x2:2026-11-03";
const WHATSAPP_URL = "https://wa.me/message/AJ3YFIXIZSIIA1";
let shownInThisTab = false;

export default function EnrollmentPromo() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [ready, setReady] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [open, setOpen] = useState(false);
  const isCourses = pathname === "/cursos" || pathname === "/cursos/";

  useEffect(() => {
    if (!isCourses || Date.now() >= EXPIRES_AT || shownInThisTab) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // El cierre sigue funcionando si el navegador bloquea sessionStorage.
    }
    const timer = window.setTimeout(() => {
      if (Date.now() < EXPIRES_AT && !shownInThisTab) setReady(true);
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [isCourses]);

  useEffect(() => {
    const element = dialog.current;
    if (!isCourses || !ready || !imageReady || !element || Date.now() >= EXPIRES_AT) return;
    element.showModal();
    shownInThisTab = true;
    try { sessionStorage.setItem(SESSION_KEY, "1"); } catch { /* Sin almacenamiento. */ }
    setOpen(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [isCourses, ready, imageReady]);

  useEffect(() => {
    if (!open) return;
    const remaining = EXPIRES_AT - Date.now();
    const expire = () => {
      if (Date.now() >= EXPIRES_AT) dialog.current?.close();
    };
    const timer = window.setTimeout(expire, Math.max(0, remaining));
    document.addEventListener("visibilitychange", expire);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", expire);
    };
  }, [open]);

  if (!isCourses) return null;

  function close() { dialog.current?.close(); }
  function afterClose() {
    setOpen(false);
    setReady(false);
  }

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label="Promoción de matrícula: tres niveles por el precio de dos en Sede Centro"
      onClose={afterClose}
      onClick={(event) => { if (event.target === event.currentTarget) close(); }}
    >
      <div className={styles.panel}>
        <button type="button" className={styles.close} onClick={close} aria-label="Cerrar promoción" autoFocus>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={styles.imageLink} onClick={close} aria-label="Consultar en WhatsApp la promoción presencial de Sede Centro">
          {/* Pieza original proporcionada por IBRACO, sin recortar. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/promos/matricula-centro-3x2-2026-11-03.jpeg"
            width="1536"
            height="1024"
            alt="Último día de matrícula: 3 niveles por el precio de 2, Sede Centro, presencial. Clases inician el 4 de noviembre. Inscríbete hoy."
            className={styles.image}
            onLoad={() => setImageReady(true)}
            onError={() => { setImageReady(false); close(); }}
          />
        </a>
        <div className={styles.actions}>
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={styles.cta} onClick={close}>
            Habla con nosotros por WhatsApp
            <span aria-hidden="true">↗</span>
          </a>
          <button type="button" className={styles.continue} onClick={close}>Seguir viendo cursos</button>
        </div>
      </div>
    </dialog>
  );
}
