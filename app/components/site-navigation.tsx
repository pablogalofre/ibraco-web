"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./site-navigation.module.css";

type IconName = "home" | "courses" | "building" | "culture" | "community" | "user" | "phone";
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v11H3Z" /><path d="M9 21v-8h6v8" /></>,
    courses: <><path d="m2 7 10-5 10 5-10 5Z" /><path d="m2 12 10 5 10-5M2 17l10 5 10-5" /></>,
    building: <><path d="M3 21V8l10-5v18M13 10h8v11M1 21h22M7 9v2m3-4v2m-3 5v2m3-4v2m7-1v2m0 3v2" /></>,
    culture: <><circle cx="12" cy="12" r="5" /><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" /></>,
    community: <><circle cx="9" cy="7" r="4" /><path d="M2 22v-3a7 7 0 0 1 14 0v3M17 4a4 4 0 0 1 0 8m2 3a6 6 0 0 1 3 5v2" /></>,
    user: <><circle cx="12" cy="7" r="4" /><path d="M4 22v-3a8 8 0 0 1 16 0v3" /></>,
    phone: <path d="m5 3 4 5-3 3a15 15 0 0 0 7 7l3-3 5 4c-2 5-6 4-10 1S1 9 2 6Z" />,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
const categories: { title: string; href: string; description: string; icon: IconName; links: { href: string; label: string }[] }[] = [
  { title: "Inicio", href: "/", description: "Bienvenido a IBRACO", icon: "home", links: [] },
  { title: "Cursos", href: "/cursos", description: "Encuentra tu curso", icon: "courses", links: [{ href: "/#nivel", label: "Mide tu nivel" }, { href: "/empresas", label: "Para empresas" }] },
  { title: "Sedes", href: "/sedes", description: "Conoce nuestras sedes", icon: "building", links: [] },
  { title: "Cultura", href: "/cultura", description: "Vive Brasil con nosotros", icon: "culture", links: [{ href: "/agenda-cultural", label: "Agenda cultural" }, { href: "/eventos", label: "Eventos e inscripciones" }] },
  { title: "Comunidad", href: "/alumni", description: "Conecta con IBRACO", icon: "community", links: [{ href: "/alumni", label: "Alumni" }, { href: "/blog", label: "Blog" }, { href: "/blog/travessias", label: "Travessias" }] },
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
  function closeMenu() { dialog.current?.close(); setOpen(false); }
  function current(href: string) { return pathname === href ? "page" as const : undefined; }
  function Brand() {
    return <a href="/" className={styles.logo} aria-label="IBRACO, ir al inicio" onClick={closeMenu}><img src="/assets/logos/logo-ibraco.png" alt="IBRACO Instituto de Cultura Brasil Colombia" /></a>;
  }
  function Contacts() {
    return <div className={styles.contacts}>
      <a href="tel:+573125841068" className={styles.phone}><span>(+57) 312 584 1068</span><Icon name="phone" /></a>
      <a href="/admin/login" className={styles.admin} aria-label="Acceso a administración" title="Administración" onClick={closeMenu}><Icon name="user" /><span>Administración</span></a>
    </div>;
  }
  if (!visible) return null;
  return <>
    <header className={`${styles.header} ${pathname === "/" ? styles.home : ""}`}>
      <div className={styles.headerInner}>
        <button type="button" className={styles.toggle} onClick={showMenu} aria-expanded={open} aria-controls="ibraco-site-menu" aria-haspopup="dialog"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg><span>Menú</span></button>
        <Brand /><Contacts />
      </div>
    </header>
    {pathname?.startsWith("/eventos") && <div className={styles.spacer} aria-hidden="true" />}
    <dialog id="ibraco-site-menu" ref={dialog} className={styles.dialog} aria-label="Menú principal de IBRACO" onCancel={event => { event.preventDefault(); closeMenu(); }} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <div className={styles.surface}>
        <div className={styles.menuHeader}>
          <div className={styles.headerInner}>
            <button type="button" className={styles.toggle} onClick={closeMenu} aria-label="Cerrar menú" autoFocus><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg><span>Cerrar</span></button>
            <Brand /><Contacts />
          </div>
        </div>
        <nav className={styles.grid} aria-label="Todas las secciones">
          {categories.map(category => <div className={styles.category} key={category.title}>
            <a href={category.href} className={styles.categoryLink} onClick={closeMenu} aria-current={current(category.href)}>
              <Icon name={category.icon} /><span className={styles.categoryTitle}>{category.title}</span><span className={styles.description}>{category.description}</span>
            </a>
            {category.links.length > 0 && <div className={styles.subLinks}>{category.links.map(link => <a key={link.href} href={link.href} onClick={closeMenu} aria-current={current(link.href)}>{link.label}</a>)}</div>}
          </div>)}
        </nav>
        <div className={styles.menuFooter}><a href="/admin/login" onClick={closeMenu}>Acceso a administración</a><a href="/cursos#cursos-disponibles" className={styles.courseCta} onClick={closeMenu}>Ver cursos e inscribirme <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></a></div>
      </div>
    </dialog>
    <a className={styles.whatsapp} href="https://wa.me/573102412817" target="_blank" rel="noopener noreferrer" aria-label="Habla con nosotros por WhatsApp">
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a9 9 0 0 1-13.3 7.9L3 21l1.6-4.7A9 9 0 1 1 21 11.5Z" /><path d="m8 7 2 2-1 1a9 9 0 0 0 4 4l1-1 2 2c-1 2-3 1-5-1s-5-5-3-7Z" /></svg>
      <span>Habla con nosotros</span>
    </a>
  </>;
}
