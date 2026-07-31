export default function CulturaPage() {
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
            O Brasil é aqui
          </div>

          <h1>El idioma entra por la cultura</h1>

          <p>
            La cultura brasileña no acompaña el aprendizaje: lo hace más
            profundo, memorable y real.
          </p>

          <a href="/agenda-cultural" className="btn btn-primary">
            Ver agenda cultural
          </a>
        </section>

        <section className="inner-grid">
          <article className="inner-card">
            <span>🎵</span>
            <h2>Música</h2>
            <p>
              Escucha, ritmo, pronunciación y expresión a través de la
              diversidad musical de Brasil.
            </p>
            <a href="/agenda-cultural" className="text-link">
              Ver agenda →
            </a>
          </article>

          <article className="inner-card">
            <span>🎬</span>
            <h2>Cine</h2>
            <p>
              Historias, acentos y conversaciones que muestran el portugués en
              contextos reales.
            </p>
            <a href="/agenda-cultural" className="text-link">
              Ver actividades →
            </a>
          </article>

          <article className="inner-card">
            <span>🍲</span>
            <h2>Gastronomía</h2>
            <p>
              Experiencias que conectan idioma, conversación y sabores
              brasileños.
            </p>
            <a href="/agenda-cultural" className="text-link">
              Conocer eventos →
            </a>
          </article>

          <article className="inner-card">
            <span>🎨</span>
            <h2>Arte</h2>
            <p>
              Creatividad, patrimonio y nuevas formas de comprender Brasil.
            </p>
            <a href="/agenda-cultural" className="text-link">
              Explorar agenda →
            </a>
          </article>

          <article className="inner-card">
            <span>📚</span>
            <h2>Literatura</h2>
            <p>
              Lectura, pensamiento y grandes autores de lengua portuguesa.
            </p>
            <a href="/blog" className="text-link">
              Leer el blog →
            </a>
          </article>

          <article className="inner-card">
            <span>🧳</span>
            <h2>Viajes</h2>
            <p>
              La cultura como puerta de entrada para estudiar, recorrer y vivir
              Brasil.
            </p>
            <a href="/blog" className="text-link">
              Descubrir Brasil →
            </a>
          </article>
        </section>

        <section className="inner-cta">
          <h2>Vive Brasil con IBRACO</h2>

          <p>
            Descubre actividades, encuentros y contenidos que mantienen la
            cultura presente dentro y fuera del salón.
          </p>

          <a href="/agenda-cultural" className="btn btn-yellow">
            Ver agenda cultural
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