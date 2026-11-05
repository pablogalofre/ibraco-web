"use client";
import { useEffect, useRef, useState } from "react";
import type { Promotion } from "../lib/promotions";
import { recordInteraction } from "../lib/interaction-tracking";
import styles from "./promotion-modal.module.css";

export default function PromotionModal({ campaign, preview = false, onClose, onShown }: {
  campaign: Promotion; preview?: boolean; onClose: () => void; onShown?: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const callbacks = useRef({ onClose, onShown });
  callbacks.current = { onClose, onShown };
  const impression = useRef<string | null>(null);
  const measured = useRef(false);
  const clicked = useRef(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const dialog = ref.current;
    if (!loaded || !dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    callbacks.current.onShown?.();
    function measureView() {
      if (preview || measured.current || document.visibilityState !== "visible") return;
      impression.current ??= crypto.randomUUID(); measured.current = true;
      recordInteraction("popup_view", "modal", campaign.id, impression.current);
    }
    measureView(); document.addEventListener("visibilitychange", measureView);

    return () => {
      document.removeEventListener("visibilitychange", measureView);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [loaded, preview, campaign.id]);
  function trackClick(surface: "image" | "button") {
    if (!preview && !clicked.current && impression.current) {
      clicked.current = true;
      recordInteraction("popup_click", surface, campaign.id, impression.current);
    }
  }
  const close = () => callbacks.current.onClose();
  return <>
    {failed && preview && <p role="alert">No se pudo cargar la imagen. Revisa su dirección antes de guardar.</p>}
    <dialog ref={ref} className={styles.dialog} aria-label={`${preview ? "Vista previa: " : ""}${campaign.name}`}
      onCancel={event => { event.preventDefault(); close(); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className={styles.panel}>
        <button type="button" className={styles.close} onClick={close} aria-label="Cerrar promoción" autoFocus>×</button>
        {preview && <div className={styles.preview}>Vista previa privada · El enlace está desactivado</div>}
        <a href={preview ? undefined : campaign.target_url} target="_blank" rel="noopener noreferrer" className={styles.imageLink}
          aria-label={campaign.button_label} onClick={event => { if (preview) event.preventDefault(); else { trackClick("image"); close(); } }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={campaign.image_url} alt={campaign.image_alt} className={styles.image}
            onLoad={() => setLoaded(true)} onError={() => { setFailed(true); if (!preview) close(); }} />
        </a>
        <div className={styles.actions}>
          <a href={preview ? undefined : campaign.target_url} target="_blank" rel="noopener noreferrer" className={styles.cta}
            aria-disabled={preview || undefined} onClick={event => { if (preview) event.preventDefault(); else { trackClick("button"); close(); } }}>{campaign.button_label}<span aria-hidden="true">↗</span></a>
          <button type="button" className={styles.continue} onClick={close}>{preview ? "Volver a la campaña" : "Seguir navegando"}</button>
        </div>
      </div>
    </dialog>
  </>;
}

