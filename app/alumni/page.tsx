export default function AlumniPage() {
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
            Comunidad IBRACO
          </div>

          <h1>IBRACO Alumni</h1>

          <p>
            La relación con IBRACO no termina cuando termina el curso. Alumni
            conecta a estudiantes y egresados con Brasil, la cultura y nuevas
            oportunidades.
          </p>

          <div className="hero-actions">
            <a href="#beneficios" className="btn btn-primary">
              Conocer Alumni
            </a>

            <a href="/agenda-cultural" className="btn btn-secondary">
              Ver agenda cultural
            </a>
          </div>
        </section>

        <section id="beneficios" className="inner-grid">
          <article className="inner-card">
            <span>🤝</span>
            <h2>Comunidad</h2>
            <p>
              Una red de personas que aprendieron portugués y mantienen una
              relación activa con Brasil.
            </p>
            <a href="/agenda-cultural" className="text-link">
              Ver encuentros →
            </a>
          </article>

          <article className="inner-card">
            <span>💼</span>
            <h2>Networking</h2>
            <p>
              Conexiones entre egresados, empresas, aliados y organizaciones del
              ecosistema Brasil–Colombia.
            </p>
            <a href="/empresas" className="text-link">
              Conocer empresas →
            </a>
          </article>

          <article className="inner-card">
            <span>🎟️</span>
            <h2>Eventos</h2>
            <p>
              Invitaciones a actividades, conversaciones y experiencias
              especiales de IBRACO.
            </p>
            <a href="/agenda-cultural" className="text-link">
              Ver agenda →
            </a>
          </article>

          <article className="inner-card">
            <span>🌎</span>
            <h2>Red global</h2>
            <p>
              Una comunidad con capacidad de crecer en Colombia, Latinoamérica y
              otros países.
            </p>
            <a href="/blog" className="text-link">
              Descubrir contenidos →
            </a>
          </article>

          <article className="inner-card">
            <span>📚</span>
            <h2>Aprendizaje continuo</h2>
            <p>
              Contenidos, conversación y espacios para mantener activo el
              portugués después del curso.
            </p>
            <a href="/blog" className="text-link">
              Leer el blog →
            </a>
          </article>

          <article className="inner-card">
            <span>🚀</span>
            <h2>Oportunidades</h2>
            <p>
              Un futuro espacio para compartir convocatorias, proyectos,
              empleos, estudios y experiencias.
            </p>
            <a href="#" className="text-link">
              Próximamente →
            </a>
          </article>
        </section>

        <section className="alumni-journey">
          <div className="section-header">
            <h2>Una comunidad que evoluciona</h2>
            <p>
              Alumni se desarrollará por etapas, empezando por la conexión con
              egresados y la agenda cultural.
            </p>
          </div>

          <div className="process-grid">
            <article className="process-card">
              <strong>01</strong>
              <h3>Registro</h3>
              <p>
                Identificamos a estudiantes y egresados que quieren seguir
                vinculados.
              </p>
            </article>

            <article className="process-card">
              <strong>02</strong>
              <h3>Conexión</h3>
              <p>
                Creamos canales para mantener activa la relación con IBRACO.
              </p>
            </article>

            <article className="process-card">
              <strong>03</strong>
              <h3>Experiencias</h3>
              <p>
                Invitamos a eventos, encuentros y espacios culturales.
              </p>
            </article>

            <article className="process-card">
              <strong>04</strong>
              <h3>Oportunidades</h3>
              <p>
                Integramos beneficios, networking y nuevas posibilidades.
              </p>
            </article>
          </div>
        </section>

        <section className="inner-cta">
          <h2>La comunidad continúa</h2>

          <p>
            Si estudiaste en IBRACO, queremos que sigas conectado con el idioma,
            la cultura y la comunidad.
          </p>

          <a
            href="https://wa.me/573102412817"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-yellow"
          >
            Quiero saber más
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