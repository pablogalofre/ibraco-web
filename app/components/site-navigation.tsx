"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./site-navigation.module.css";

const groups = [
  { title: "Estudia", links: [
    { href: "/cursos", label: "Cursos de portugués" },
    { href: "/sedes", label: "Nuestras sedes" },
    { href: "/empresas", label: "Para empresas" },
    { href: "/#nivel", label: "Mide tu nivel" },
  ] },
  { title: "Vive Brasil", links: [
    { href: "/cultura", label: "Cultura brasileña" },
    { href: "/agenda-cultural", label: "Agenda cultural" },
    { href: "/eventos", label: "Eventos e inscripciones" },
  ] },
  { title: "Comunidad", links: [
    { href: "/blog", label: "Blog" },
    { href: "/blog/travessias", label: "Travessias" },
    { href: "/alumni", label: "Alumni" },
  ] },
];

function Arrow({ className }: { className?: string }) {
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>;
}
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
        <a href="/admin/login" className={styles.adminLink} aria-label="Acceso a administración" title="Administración">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" /></svg><span>Administración</span>
        </a>
        <a href="/cursos#cursos-disponibles" className={styles.cta}>Inscribirme</a>
        <button type="button" className={styles.menuButton} onClick={showMenu} aria-expanded={open} aria-controls="ibraco-site-menu" aria-haspopup="dialog">
          <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg>
          <span>Menú</span>
        </button>
      </div>
    </header>
    {pathname?.startsWith("/eventos") && <div className={styles.spacer} aria-hidden="true" />}
    <dialog id="ibraco-site-menu" ref={dialog} className={styles.dialog} aria-labelledby="ibraco-menu-title" onCancel={event => { event.preventDefault(); closeMenu(); }} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className={styles.menuShell}>
        <div className={styles.menuTop}>
          <img src="/assets/logos/logo-ibraco.png" alt="IBRACO" className={styles.menuLogo} />
          <h2 id="ibraco-menu-title" className={styles.menuTitle}>Explora IBRACO</h2>
          <button type="button" className={styles.closeButton} onClick={closeMenu} aria-label="Cerrar menú" autoFocus>
            <span>Cerrar</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <div className={styles.menuBody}>
          <aside className={styles.brandPanel}>
            <p className={styles.eyebrow}>Idioma. Cultura. Conexiones.</p>
            <p className={styles.brandTitle}>Brasil<br />empieza<br /><em>aquí.</em></p>
            <div className={styles.brandBottom}><span className={styles.brandLine} /><p>Un idioma que abre puertas.<br />Una cultura que te conecta.</p></div>
          </aside>
          <div className={styles.navigationPanel}>
            <a href="/" className={styles.homeLink} onClick={closeMenu} aria-current={pathname === "/" ? "page" : undefined}>Volver al inicio <Arrow /></a>
            <nav className={styles.groups} aria-label="Todas las secciones">
              {groups.map((group, index) => <section key={group.title} className={styles.group}>
                <h3 className={styles.groupTitle}><span>0{index + 1}</span>{group.title}</h3>
                <div className={styles.groupLinks}>{group.links.map(link => <a key={link.href} href={link.href} className={styles.menuLink} aria-current={isCurrent(link.href) ? "page" : undefined} onClick={closeMenu}>
                  <span>{link.label}</span><Arrow className={styles.linkArrow} />
                </a>)}</div>
              </section>)}
            </nav>
            <div className={styles.menuBottom}>
              <div><p className={styles.bottomTitle}>Tu próximo paso, en portugués.</p><p className={styles.bottomNote}>Encuentra un curso para ti.</p></div>
              <a href="/cursos#cursos-disponibles" className={styles.panelCta} onClick={closeMenu}>Ver cursos <Arrow /></a>
            </div>
            <a href="/admin/login" className={styles.adminFooter} onClick={closeMenu}>Acceso a administración <Arrow /></a>
          </div>
        </div>
      </div>
    </dialog>
  </>;
}
