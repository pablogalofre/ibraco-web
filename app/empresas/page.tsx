export default function EmpresasPage() {
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
            Portugués para organizaciones
          </div>

          <h1>IBRACO Empresas</h1>

          <p>
            Programas corporativos para equipos que necesitan comunicarse,
            negociar y trabajar mejor con Brasil.
          </p>

          <div className="hero-actions">
            <a href="#soluciones" className="btn btn-primary">
              Ver soluciones
            </a>

            <a
              href="https://wa.me/573102412817"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Hablar con un asesor
            </a>
          </div>
        </section>

        <section id="soluciones" className="inner-grid">
          <article className="inner-card">
            <span>🧩</span>
            <h2>Programa a la medida</h2>
            <p>
              Diseñamos el plan según el sector, los roles y los objetivos de tu
              organización.
            </p>
            <a
              href="https://wa.me/573102412817"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Solicitar propuesta →
            </a>
          </article>

          <article className="inner-card">
            <span>👥</span>
            <h2>Grupos corporativos</h2>
            <p>
              Formación para equipos con horarios y contenidos adaptados a sus
              necesidades.
            </p>
            <a
              href="https://wa.me/573102412817"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Cotizar programa →
            </a>
          </article>

          <article className="inner-card">
            <span>💬</span>
            <h2>Portugués profesional</h2>
            <p>
              Comunicación práctica para reuniones, presentaciones, servicio y
              negociación.
            </p>
            <a
              href="https://wa.me/573102412817"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Hablar con un asesor →
            </a>
          </article>

          <article className="inner-card">
            <span>📊</span>
            <h2>Seguimiento académico</h2>
            <p>
              Acompañamiento e informes de avance para la empresa y cada grupo.
            </p>
            <a
              href="https://wa.me/573102412817"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Conocer metodología →
            </a>
          </article>

          <article className="inner-card">
            <span>🎯</span>
            <h2>Objetivos específicos</h2>
            <p>
              Portugués para ventas, atención al cliente, operaciones,
              liderazgo o expansión regional.
            </p>
            <a
              href="https://wa.me/573102412817"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Diseñar un programa →
            </a>
          </article>

          <article className="inner-card">
            <span>🌎</span>
            <h2>Conexión con Brasil</h2>
            <p>
              Preparación para equipos que interactúan con clientes, aliados o
              proveedores brasileños.
            </p>
            <a
              href="https://wa.me/573102412817"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Solicitar información →
            </a>
          </article>
        </section>

        <section className="business-process">
          <div className="section-header">
            <h2>Cómo funciona</h2>
            <p>
              Construimos cada programa a partir de las necesidades reales de tu
              organización.
            </p>
          </div>

          <div className="process-grid">
            <article className="process-card">
              <strong>01</strong>
              <h3>Diagnóstico</h3>
              <p>
                Entendemos el equipo, los objetivos y las situaciones donde
                necesita usar portugués.
              </p>
            </article>

            <article className="process-card">
              <strong>02</strong>
              <h3>Diseño</h3>
              <p>
                Definimos modalidad, intensidad, contenidos, calendario y forma
                de seguimiento.
              </p>
            </article>

            <article className="process-card">
              <strong>03</strong>
              <h3>Implementación</h3>
              <p>
                Iniciamos la formación con profesores y acompañamiento de
                IBRACO.
              </p>
            </article>

            <article className="process-card">
              <strong>04</strong>
              <h3>Seguimiento</h3>
              <p>
                Evaluamos avances y entregamos información útil para la empresa.
              </p>
            </article>
          </div>
        </section>

        <section className="inner-cta">
          <h2>Prepara a tu organización para Brasil</h2>

          <p>
            Cuéntanos cuántas personas necesitan formación y cuál es el objetivo
            del equipo.
          </p>

          <a
            href="https://wa.me/573102412817"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-yellow"
          >
            Solicitar propuesta
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