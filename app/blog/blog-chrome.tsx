import type { ReactNode } from "react";

export default function BlogChrome({ children }: { children: ReactNode }) {
  return <>
    
    {children}
    <footer>
      <div className="footer-brand">
        <img src="/assets/logos/logo-ibraco.png" alt="IBRACO Instituto de Cultura Brasil Colombia" />
        <p>Instituto de Cultura Brasil Colombia. Portugués, cultura brasileña y comunidad.</p>
      </div>
      <div><h4>Estudia</h4><a href="/cursos">Cursos</a><a href="/sedes">Sedes</a><a href="/empresas">Empresas</a></div>
      <div><h4>Vive Brasil</h4><a href="/cultura">Cultura</a><a href="/agenda-cultural">Agenda cultural</a><a href="/alumni">Alumni</a></div>
      <div><h4>Descubre</h4><a href="/blog">Blog</a><a href="/#nivel">Mide en qué nivel estás</a><a href="https://wa.me/573125841068">WhatsApp</a></div>
    </footer>
    <a className="whatsapp-float" href="https://wa.me/573125841068" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp IBRACO">☘</a>
  </>;
}
