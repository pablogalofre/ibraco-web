"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./site-navigation.module.css";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/cursos", label: "Cursos de portugués" },
  { href: "/sedes", label: "Sedes" },
  { href: "/cultura", label: "Cultura brasileña" },
  { href: "/agenda-cultural", label: "Agenda cultural" },
  { href: "/eventos", label: "Eventos e inscripciones" },
  { href: "/empresas", label: "Portugués para empresas" },
  { href: "/alumni", label: "Alumni" },
  { href: "/blog", label: "Blog" },
  { href: "/blog/travessias", label: "Travessias" },
  { href: "/#nivel", label: "Mide tu nivel" },
];
const publicRoots = ["/cursos", "/sedes", "/cultura", "/agenda-cultural", "/eventos", "/empresas", "/alumni", "/blog"];

export default function SiteNavigation() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const visible = pathname === "/" || (pathname != null && publicRoots.some(root => pathname === root || pathname.startsWith(`${root}/`)) && !pathname.startsWith("/eventos/pago/"));

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function showMenu() {
    if (!dialog.current || dialog.current.open) return;
    dialog.current.showModal();
    setOpen(true);
  }
  function closeMenu() {
    dialog.current?.close();
    setOpen(false);
  }
  function isCurrent(href: string) {
    if (!pathname || href.includes("#")) return false;
    if (href === "/blog") return pathname === "/blog" || (pathname.startsWith("/blog/") && pathname !== "/blog/travessias");
    return pathname === href;
  }

  if (!visible) return null;

  return <>
    <header className={`${styles.header} ${pathname === "/" ? styles.home : ""}`}>
      <a href="/" className={styles.logo} aria-label="IBRACO, ir al inicio">
        <img src="/assets/logos/logo-ibraco.png" alt="IBRACO Instituto de Cultura Brasil Colombia" />
      </a>
      <nav className={styles.shortcuts} aria-label="Accesos principales">
        <a href="/cursos" aria-current={isCurrent("/cursos") ? "page" : undefined}>Cursos</a>
        <a href="/sedes" aria-current={isCurrent("/sedes") ? "page" : undefined}>Sedes</a>
        <a href="/cultura" aria-current={isCurrent("/cultura") ? "page" : undefined}>Cultura</a>
        <a href="/empresas" aria-current={isCurrent("/empresas") ? "page" : undefined}>Empresas</a>
        <a href="/blog" aria-current={isCurrent("/blog") ? "page" : undefined}>Blog</a>
      </nav>
      <div className={styles.actions}>
        <a href="/cursos#cursos-disponibles" className={styles.cta}>Inscribirme</a>
        <button type="button" className={styles.menuButton} onClick={showMenu} aria-expanded={open} aria-controls="ibraco-site-menu" aria-haspopup="dialog">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          <span>Menú</span>
        </button>
      </div>
    </header>
    {pathname?.startsWith("/eventos") && <div className={styles.spacer} aria-hidden="true" />}
    <dialog id="ibraco-site-menu" ref={dialog} className={styles.dialog} aria-labelledby="ibraco-menu-title" onCancel={event => { event.preventDefault(); closeMenu(); }} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className={styles.panel}>
        <div className={styles.panelTop}>
          <h2 id="ibraco-menu-title">Explora IBRACO</h2>
          <button type="button" className={styles.closeButton} onClick={closeMenu} aria-label="Cerrar menú" autoFocus>✕</button>
        </div>
        <nav aria-label="Todas las secciones">
          {links.map(link => <a key={link.href} href={link.href} className={styles.menuLink} aria-current={isCurrent(link.href) ? "page" : undefined} onClick={closeMenu}>
            {link.label}<span aria-hidden="true">↗</span>
          </a>)}
        </nav>
        <a href="/cursos#cursos-disponibles" className={styles.panelCta} onClick={closeMenu}>Quiero inscribirme</a>
        <p className={styles.panelNote}>Portugués, Brasil y cultura.</p>
      </div>
    </dialog>
  </>;
}
