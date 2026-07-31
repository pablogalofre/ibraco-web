export default function AgendaCulturalPage() {
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
            Cultura en movimiento
          </div>

          <h1>Agenda Cultural</h1>

          <p>
            Talleres, cine, música, literatura, gastronomía y experiencias para
            vivir Brasil más allá del salón de clase.
          </p>

          <div className="hero-actions">
            <a href="#proximos-eventos" className="btn btn-primary">
              Ver próximos eventos
            </a>

            <a href="/cultura" className="btn btn-secondary">
              Explorar cultura
            </a>
          </div>
        </section>

        <section id="proximos-eventos" className="events-section">
          <div className="section-header">
            <h2>Próximos eventos</h2>
            <p>
              Esta agenda se actualizará con las actividades culturales,
              académicas y comunitarias de IBRACO.
            </p>
          </div>

          <div className="events-grid">
            <article className="event-card">
              <div className="event-date">
                <strong>24</strong>
                <span>MAY</span>
              </div>

              <div className="event-content">
                <span className="tag">Cine</span>
                <h3>Cine brasileño y conversación</h3>
                <p>
                  Proyección de cine brasileño seguida de una conversación en
                  portugués con estudiantes y profesores.
                </p>

                <ul className="event-meta">
                  <li>📍 Sede Centro · CITIU</li>
                  <li>🕕 6:30 p. m.</li>
                  <li>🎟️ Cupos limitados</li>
                </ul>

                <a href="#" className="btn btn-primary">
                  Reservar cupo
                </a>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>07</strong>
                <span>JUN</span>
              </div>

              <div className="event-content">
                <span className="tag">Música</span>
                <h3>Roda de samba IBRACO</h3>
                <p>
                  Una experiencia musical para acercarte al ritmo, la
                  pronunciación y la cultura brasileña.
                </p>

                <ul className="event-meta">
                  <li>📍 Sede Norte</li>
                  <li>🕚 11:00 a. m.</li>
                  <li>🎟️ Evento abierto</li>
                </ul>

                <a href="#" className="btn btn-primary">
                  Quiero asistir
                </a>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>14</strong>
                <span>JUN</span>
              </div>

              <div className="event-content">
                <span className="tag">Comunidad</span>
                <h3>Encuentro cultural IBRACO</h3>
                <p>
                  Un espacio para compartir, practicar portugués y conocer a
                  otros estudiantes de la comunidad.
                </p>

                <ul className="event-meta">
                  <li>📍 Sede Centro · CITIU</li>
                  <li>🕓 4:00 p. m.</li>
                  <li>🎟️ Inscripción previa</li>
                </ul>

                <a href="#" className="btn btn-primary">
                  Inscribirme
                </a>
              </div>
            </article>
          </div>
        </section>

        <section className="agenda-categories">
          <div className="section-header">
            <h2>Todo lo que puedes vivir</h2>
            <p>
              La agenda cultural conecta el idioma con experiencias reales,
              comunidad y cultura brasileña.
            </p>
          </div>

          <div className="inner-grid">
            <article className="inner-card">
              <h2>Música</h2>
              <p>Samba, bossa nova, MPB y nuevas tendencias.</p>
              <a href="#proximos-eventos" className="text-link">
                Ver eventos →
              </a>
            </article>

            <article className="inner-card">
              <h2>Cine</h2>
              <p>Ciclos de cine brasileño y conversatorios.</p>
              <a href="#proximos-eventos" className="text-link">
                Ver eventos →
              </a>
            </article>

            <article className="inner-card">
              <h2>Literatura</h2>
              <p>Clubes de lectura y autores brasileños.</p>
              <a href="#proximos-eventos" className="text-link">
                Ver eventos →
              </a>
            </article>

            <article className="inner-card">
              <h2>Gastronomía</h2>
              <p>Sabores de Brasil y encuentros culturales.</p>
              <a href="#proximos-eventos" className="text-link">
                Ver eventos →
              </a>
            </article>

            <article className="inner-card">
              <h2>Conversación</h2>
              <p>Espacios para practicar portugués en comunidad.</p>
              <a href="#proximos-eventos" className="text-link">
                Ver eventos →
              </a>
            </article>

            <article className="inner-card">
              <h2>Eventos especiales</h2>
              <p>Celebraciones y actividades institucionales.</p>
              <a href="#proximos-eventos" className="text-link">
                Ver eventos →
              </a>
            </article>
          </div>
        </section>

        <section className="inner-cta">
          <h2>La comunidad continúa fuera del aula</h2>

          <p>
            Porque aprender portugués también significa vivir Brasil, encontrarte
            con otros y hacer parte de una comunidad.
          </p>

          <a href="/#inscripcion" className="btn btn-yellow">
            Quiero recibir la agenda
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