import "./cultura.css";
const culturalExperiences = [
  {
    title: "Música",
    description:
      "Escucha, ritmo, pronunciación y expresión a través de la diversidad musical de Brasil.",
    href: "/agenda-cultural",
    linkText: "Ver agenda",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Cine",
    description:
      "Historias, acentos y conversaciones que muestran el portugués en contextos reales.",
    href: "/agenda-cultural",
    linkText: "Ver actividades",
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Gastronomía",
    description:
      "Experiencias que conectan idioma, conversación y sabores brasileños.",
    href: "/agenda-cultural",
    linkText: "Conocer eventos",
    image:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Arte",
    description:
      "Creatividad, patrimonio y nuevas formas de comprender Brasil.",
    href: "/agenda-cultural",
    linkText: "Explorar agenda",
    image:
      "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Literatura",
    description:
      "Lectura, pensamiento y grandes autores de lengua portuguesa.",
    href: "/blog",
    linkText: "Leer el blog",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Viajes",
    description:
      "La cultura como puerta de entrada para estudiar, recorrer y vivir Brasil.",
    href: "/blog",
    linkText: "Descubrir Brasil",
    image:
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function CulturaPage() {
  return (
    <>
      <header className="navbar">
        <a href="/" className="logo-box" aria-label="IBRACO inicio">
          <img
            src="/assets/logos/logo-ibraco.png"
            alt="IBRACO Instituto de Cultura Brasil Colombia"
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
        <section className="culture-page-hero">
          <div className="culture-page-hero-overlay" />

          <div className="culture-page-hero-content">
            <div className="eyebrow">
              <span className="dot" />
              O Brasil é aqui
            </div>

            <h1>El idioma entra por la cultura</h1>

            <p>
              La cultura brasileña no acompaña el aprendizaje: lo hace más
              profundo, memorable y real.
            </p>

            <div className="hero-actions">
              <a href="/agenda-cultural" className="btn btn-yellow">
                Ver agenda cultural
              </a>

              <a href="/cursos" className="btn btn-secondary">
                Conocer los cursos
              </a>
            </div>
          </div>
        </section>

        <section className="culture-introduction">
          <div className="section-header">
            <h2>Brasil se aprende viviéndolo</h2>

            <p>
              Música, cine, gastronomía, arte, literatura y viajes convierten
              el portugués en una experiencia que trasciende el salón de clase.
            </p>
          </div>
        </section>

        <section className="culture-experiences-grid">
          {culturalExperiences.map((experience) => (
            <article
              className="culture-experience-card"
              key={experience.title}
            >
              <div
                className="culture-experience-image"
                style={{ backgroundImage: `url("${experience.image}")` }}
              >
                <div className="culture-experience-overlay" />

                <span className="culture-experience-label">
                  Cultura IBRACO
                </span>
              </div>

              <div className="culture-experience-content">
                <h2>{experience.title}</h2>

                <p>{experience.description}</p>

                <a href={experience.href} className="text-link">
                  {experience.linkText} →
                </a>
              </div>
            </article>
          ))}
        </section>

        <section className="culture-manifesto">
          <div className="culture-manifesto-image" />

          <div className="culture-manifesto-content">
            <span className="alumni-tag">Portugués que se vive</span>

            <h2>O Brasil é aqui.</h2>

            <p>
              IBRACO conecta el aprendizaje del portugués con expresiones
              culturales reales, experiencias compartidas y una comunidad que
              mantiene vivo el vínculo entre Brasil y Colombia.
            </p>

            <a href="/agenda-cultural" className="btn btn-yellow">
              Explorar la agenda
            </a>
          </div>
        </section>

        <section className="inner-cta">
          <h2>Vive Brasil con IBRACO</h2>

          <p>
            Descubre actividades, encuentros y contenidos que mantienen la
            cultura presente dentro y fuera del salón.
          </p>

          <div className="hero-actions culture-final-actions">
            <a href="/agenda-cultural" className="btn btn-yellow">
              Ver agenda cultural
            </a>

            <a href="/cursos" className="btn btn-secondary">
              Aprender portugués
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <img
            src="/assets/logos/logo-ibraco.png"
            alt="IBRACO Instituto de Cultura Brasil Colombia"
          />

          <p>
            Instituto de Cultura Brasil Colombia. Portugués, cultura brasileña y
            comunidad.
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
          <a href="/blog/travessias">Travessias</a>
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