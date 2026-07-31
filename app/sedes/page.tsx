export default function SedesPage() {
  return (
    <>
      <header className="navbar">
        <a href="/" className="logo-box" aria-label="IBRACO inicio">
          <img
            src="/assets/logos/logo-ibraco.png"
            alt="IBRACO Instituto Brasil Colombia"
          />
        </a>

        <nav className="nav-links" aria-label="Navegación principal">
          <a href="/cursos">Cursos</a>
          <a href="/sedes">Sedes</a>
          <a href="/cultura">Cultura</a>
          <a href="/agenda-cultural">Agenda cultural</a>
          <a href="/empresas">Empresas</a>
          <a href="/alumni">Alumni</a>
          <a href="/blog">Blog</a>
          <a href="/#inscripcion" className="nav-cta">
            Inscribirme
          </a>
        </nav>
      </header>

      <main className="inner-page">
        <section className="inner-hero">
          <div className="eyebrow">
            <span className="dot"></span>
            Bogotá y modalidad virtual
          </div>

          <h1>Sedes IBRACO</h1>

          <p>
            Estudia donde mejor te quede y vive la experiencia IBRACO de manera
            presencial en Bogotá o desde cualquier ciudad.
          </p>

          <a href="/cursos" className="btn btn-primary">
            Ver cursos
          </a>
        </section>

        <section className="inner-grid">
          <article className="inner-card">
            <span>🌿</span>
            <h2>Sede Norte</h2>
            <p>
              Una sede cercana, tradicional y llena de vida cultural para
              aprender portugués en comunidad.
            </p>
            <a href="/#ciclos" className="text-link">
              Ver cursos en Norte →
            </a>
          </article>

          <article className="inner-card">
            <span>🏙️</span>
            <h2>Sede Centro · CITIU</h2>
            <p>
              Un espacio contemporáneo y universitario en el centro estudiantil
              de Bogotá.
            </p>
            <a href="/#ciclos" className="text-link">
              Ver cursos en Centro →
            </a>
          </article>

          <article className="inner-card">
            <span>🌎</span>
            <h2>IBRACO Virtual</h2>
            <p>
              Clases en vivo con profesores de IBRACO, estés donde estés, con
              la misma metodología y acompañamiento.
            </p>
            <a href="/#ciclos" className="text-link">
              Ver cursos virtuales →
            </a>
          </article>
        </section>

        <section className="inner-cta">
          <h2>Una sola comunidad</h2>

          <p>
            Presencial en Bogotá o virtual desde cualquier ciudad: estudias con
            la misma identidad académica y cultural de IBRACO.
          </p>

          <a href="/cursos" className="btn btn-yellow">
            Elige tu curso
          </a>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <img
            src="/assets/logos/logo-ibraco.png"
            alt="IBRACO Instituto Brasil Colombia"
          />
          <p>
            Instituto Brasil Colombia. Portugués, cultura brasileña y comunidad.
          </p>
        </div>

        <div>
          <h4>Estudia</h4>
          <a href="/cursos">Cursos</a>
          <a href="/sedes">Sedes</a>
          <a href="/empresas">Empresas</a>
        </div>

        <div>
          <h4>Vive Brasil</h4>
          <a href="/cultura">Cultura</a>
          <a href="/agenda-cultural">Agenda cultural</a>
          <a href="/alumni">Alumni</a>
        </div>

        <div>
          <h4>Descubre</h4>
          <a href="/blog">Blog</a>
          <a href="/#nivel">Mide en qué nivel estás</a>
          <a href="https://wa.me/573102412817">WhatsApp</a>
        </div>
      </footer>

      <a
        className="whatsapp-float"
        href="https://wa.me/573102412817"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp IBRACO"
      >
        ☘
      </a>
    </>
  );
}