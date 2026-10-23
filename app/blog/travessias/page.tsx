import { listPublicPosts } from "../../../lib/blog-public";
export const dynamic = "force-dynamic";
const categories = [
  {
    title: "Aprende portugués",
    description:
      "Gramática, vocabulario, pronunciación y herramientas para avanzar en el idioma.",
  },
  {
    title: "Cultura brasileña",
    description:
      "Música, cine, literatura, gastronomía, historia y vida cotidiana.",
  },
  {
    title: "Celpe-Bras",
    description:
      "Preparación, niveles, consejos y contenidos relacionados con la certificación.",
  },
  {
    title: "Viajes y experiencias",
    description:
      "Información para estudiar, viajar y vivir Brasil con mayor preparación.",
  },
  {
    title: "Portugués para negocios",
    description:
      "Comunicación profesional y oportunidades para trabajar con Brasil.",
  },
  {
    title: "Comunidad IBRACO",
    description:
      "Historias, actividades, profesores, estudiantes y vida institucional.",
  },
];

export default async function TravessiasPage() {
  const { posts: articles } = await listPublicPosts("", 1);
  return (
    <>
      

      <main className="inner-page">
        <section className="inner-hero">
          <div className="eyebrow">
            <span className="dot" />
            Revista IBRACO
          </div>

          <h1>Travessias</h1>

          <p>
            La revista editorial de IBRACO. Un espacio para explorar el idioma
            portugués, la cultura brasileña, los viajes, el Celpe-Bras y las
            historias que conectan a Colombia con Brasil.
          </p>

          <div className="hero-actions">
            <a href="#articulos" className="btn btn-primary">
              Explorar artículos
            </a>

            <a href="/blog" className="btn btn-secondary">
              Volver al Blog
            </a>
          </div>
        </section>

        <section id="articulos" className="blog-featured">
          <div className="section-header">
            <h2>Publicaciones recientes</h2>

            <p>
              Artículos publicados en el blog de IBRACO sobre aprendizaje, cultura y
              conexión con Brasil.
            </p>
          </div>

          <div className="blog-featured-grid">
            {articles.length === 0 && <div className="inner-card"><h3>Pronto encontrarás nuevas publicaciones</h3><p>Estamos preparando contenidos de portugués, Brasil y cultura.</p><a href="/blog" className="text-link">Explorar el blog →</a></div>}
            {articles.map((article) => (
              <article className="blog-article-card" key={article.title}>
                <div className="blog-article-image">
                  <span>{article.category}</span>
                </div>

                <div className="blog-article-content">
                  <small>{article.category}</small>
                  <h2>{article.title}</h2>
                  <p>{article.excerpt}</p>

                  <a
                    href={"/blog/" + encodeURIComponent(article.slug)}
                    
                    className="text-link"
                  >
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
              Travessias reúne contenidos para aprender portugués, descubrir
              Brasil y mantener activa la relación con IBRACO.
            </p>
          </div>

          <div className="inner-grid blog-category-grid">
            {categories.map((category) => (
              <article
                className="inner-card blog-category-card"
                key={category.title}
              >
                <span className="blog-category-number">Travessias</span>

                <h2>{category.title}</h2>
                <p>{category.description}</p>

                <a
                  href={"/blog?categoria=" + encodeURIComponent(category.title === "Aprende portugués" ? "Aprender portugués" : category.title === "Viajes y experiencias" ? "Estudiar y viajar" : category.title) + "#articulos"}
                  className="text-link"
                >
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
              Próximamente podrás recibir artículos, agenda cultural y
              novedades académicas directamente en tu correo.
            </p>
          </div>

          <form className="blog-newsletter-form">
            <label htmlFor="travessias-name">Nombre</label>
            <input
              id="travessias-name"
              type="text"
              name="name"
              placeholder="Tu nombre" disabled
            />

            <label htmlFor="travessias-email">Correo electrónico</label>
            <input
              id="travessias-email"
              type="email"
              name="email"
              placeholder="tu@correo.com" disabled
            />

            <button type="button" className="btn btn-primary" disabled>
              Próximamente
            </button>
          </form>
        </section>

        <section className="inner-cta">
          <h2>El contenido inspira. El idioma transforma.</h2>

          <p>
            Continúa explorando Brasil a través de nuestros contenidos o empieza
            tu proceso de aprendizaje con uno de nuestros programas.
          </p>

          <div className="hero-actions">
            <a href="/blog" className="btn btn-secondary">
              Volver al Blog
            </a>

            <a href="/cursos" className="btn btn-yellow">
              Conocer los cursos
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
          <a href="https://wa.me/573125841068">WhatsApp</a>
        </div>
      </footer>

      <a
        className="whatsapp-float"
        href="https://wa.me/573125841068"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp IBRACO"
      >
        ☘
      </a>
    </>
  );
}