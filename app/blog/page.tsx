const featuredArticles = [
  {
    category: "Aprender portugués",
    title: "¿Cuánto tiempo necesitas para aprender portugués?",
    excerpt:
      "Los factores que influyen en tu avance y cómo elegir una ruta de estudio que se adapte a tus objetivos.",
    href: "#",
  },
  {
    category: "Celpe-Bras",
    title: "Qué es el Celpe-Bras y para qué sirve",
    excerpt:
      "Una guía inicial sobre el certificado oficial de dominio del portugués de Brasil.",
    href: "#",
  },
  {
    category: "Cultura brasileña",
    title: "Brasil se entiende mejor cuando se vive",
    excerpt:
      "Música, cine, literatura y conversación como parte del aprendizaje del idioma.",
    href: "#",
  },
];

const categories = [
  {
    title: "Aprender portugués",
    description:
      "Consejos, herramientas y rutas para avanzar con mayor seguridad.",
    href: "#",
  },
  {
    title: "Celpe-Bras",
    description:
      "Información sobre niveles, preparación y certificación oficial.",
    href: "#",
  },
  {
    title: "Cultura brasileña",
    description:
      "Música, cine, gastronomía, literatura, arte e historia.",
    href: "#",
  },
  {
    title: "Portugués para negocios",
    description:
      "Comunicación, negociación y oportunidades profesionales con Brasil.",
    href: "#",
  },
  {
    title: "Estudiar y viajar",
    description:
      "Orientación para estudiar, viajar o vivir una experiencia en Brasil.",
    href: "#",
  },
  {
    title: "Comunidad IBRACO",
    description:
      "Historias, eventos, profesores, estudiantes y vida institucional.",
    href: "/agenda-cultural",
  },
];

export default function BlogPage() {
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
        <section className="inner-hero">
          <div className="eyebrow">
            <span className="dot"></span>
            Portugués, Brasil y cultura
          </div>

          <h1>Blog IBRACO</h1>

          <p>
            Contenidos para aprender portugués, entender Brasil y descubrir
            oportunidades académicas, culturales y profesionales.
          </p>

          <div className="hero-actions">
            <a href="#articulos" className="btn btn-primary">
              Explorar artículos
            </a>

            <a href="/cursos" className="btn btn-secondary">
              Ver cursos
            </a>
          </div>
        </section>

        <section id="articulos" className="blog-featured">
          <div className="section-header">
            <h2>Artículos destacados</h2>
            <p>
              Una primera selección de temas para orientar, inspirar y acercar
              a más personas al portugués y a Brasil.
            </p>
          </div>

          <div className="blog-featured-grid">
            {featuredArticles.map((article) => (
              <article className="blog-article-card" key={article.title}>
                <div className="blog-article-image">
                  <span>{article.category}</span>
                </div>

                <div className="blog-article-content">
                  <small>{article.category}</small>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>

                  <a href={article.href} className="text-link">
                    Leer artículo →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="blog-categories">
          <div className="section-header">
            <h2>Explora por tema</h2>
            <p>
              El blog crecerá como una biblioteca de conocimiento sobre
              portugués, Brasil y la comunidad IBRACO.
            </p>
          </div>

          <div className="inner-grid blog-category-grid">
            {categories.map((category) => (
              <article className="inner-card blog-category-card" key={category.title}>
                <span className="blog-category-number">IBRACO</span>

                <h2>{category.title}</h2>

                <p>{category.description}</p>

                <a href={category.href} className="text-link">
                  Explorar contenido →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="blog-newsletter">
          <div>
            <span className="alumni-tag">Comunidad IBRACO</span>

            <h2>Recibe nuevos contenidos y actividades</h2>

            <p>
              Próximamente podrás recibir artículos, agenda cultural y novedades
              de cursos directamente en tu correo.
            </p>
          </div>

          <form className="blog-newsletter-form">
            <label htmlFor="blog-name">Nombre</label>
            <input
              id="blog-name"
              type="text"
              name="name"
              placeholder="Tu nombre"
            />

            <label htmlFor="blog-email">Correo electrónico</label>
            <input
              id="blog-email"
              type="email"
              name="email"
              placeholder="tu@correo.com"
            />

            <button type="button" className="btn btn-primary">
              Quiero recibir novedades
            </button>
          </form>
        </section>

        <section className="inner-cta">
          <h2>Aprende portugués y empieza a vivir Brasil</h2>

          <p>
            El contenido puede inspirarte. Un curso puede convertir ese interés
            en una experiencia real.
          </p>

          <a href="/cursos" className="btn btn-yellow">
            Conocer los cursos
          </a>
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