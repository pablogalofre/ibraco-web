import "./alumni.css";

const WHATSAPP_URL = "https://wa.me/573102412817";

const benefits = [
  {
    title: "Comunidad",
    description:
      "Una red de personas que aprendieron portugués y mantienen una relación activa con Brasil.",
    href: "/agenda-cultural",
    linkText: "Ver encuentros",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Networking",
    description:
      "Conexiones entre egresados, empresas, aliados y organizaciones del ecosistema Brasil–Colombia.",
    href: "/empresas",
    linkText: "Conocer empresas",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Eventos",
    description:
      "Invitaciones a actividades, conversaciones y experiencias especiales de IBRACO.",
    href: "/agenda-cultural",
    linkText: "Ver agenda",
    image:
      "https://images.unsplash.com/photo-1507501336603-6e31db2be093?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Red global",
    description:
      "Una comunidad con capacidad de crecer en Colombia, Latinoamérica y otros países.",
    href: "/blog",
    linkText: "Descubrir contenidos",
    image:
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Aprendizaje continuo",
    description:
      "Contenidos, conversación y espacios para mantener activo el portugués después del curso.",
    href: "/blog",
    linkText: "Leer el blog",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Oportunidades",
    description:
      "Un futuro espacio para compartir convocatorias, proyectos, empleos, estudios y experiencias.",
    href: WHATSAPP_URL,
    linkText: "Quiero recibir información",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=85",
  },
];

const journey = [
  {
    number: "01",
    title: "Registro",
    description:
      "Identificamos a estudiantes y egresados que quieren seguir vinculados.",
  },
  {
    number: "02",
    title: "Conexión",
    description:
      "Creamos canales para mantener activa la relación con IBRACO.",
  },
  {
    number: "03",
    title: "Experiencias",
    description:
      "Invitamos a eventos, encuentros y espacios culturales.",
  },
  {
    number: "04",
    title: "Oportunidades",
    description:
      "Integramos beneficios, networking y nuevas posibilidades.",
  },
];

export default function AlumniPage() {
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
        <section className="alumni-page-hero">
          <div className="alumni-page-hero-overlay" />

          <div className="alumni-page-hero-content">
            <div className="eyebrow">
              <span className="dot" />
              Comunidad IBRACO
            </div>

            <h1>IBRACO Alumni</h1>

            <p>
              La relación con IBRACO no termina cuando termina el curso. Alumni
              conecta a estudiantes y egresados con Brasil, la cultura y nuevas
              oportunidades.
            </p>

            <div className="hero-actions">
              <a href="#beneficios" className="btn btn-yellow">
                Conocer Alumni
              </a>

              <a
                href="/agenda-cultural"
                className="btn btn-secondary alumni-hero-secondary"
              >
                Ver agenda cultural
              </a>
            </div>

            <div className="alumni-hero-trust">
              <span>✓ Comunidad de egresados</span>
              <span>✓ Eventos y encuentros</span>
              <span>✓ Conexión con Brasil</span>
            </div>
          </div>
        </section>

        <section className="alumni-introduction">
          <div className="section-header">
            <h2>Una comunidad que continúa</h2>

            <p>
              Alumni busca mantener vivo el vínculo con IBRACO después del
              curso y convertirlo en nuevas experiencias, conexiones y
              oportunidades.
            </p>
          </div>
        </section>

        <section id="beneficios" className="alumni-benefits-grid">
          {benefits.map((benefit) => {
            const external = benefit.href.startsWith("http");

            return (
              <article className="alumni-benefit-card" key={benefit.title}>
                <div
                  className="alumni-benefit-image"
                  style={{ backgroundImage: `url("${benefit.image}")` }}
                >
                  <div className="alumni-benefit-overlay" />

                  <span className="alumni-benefit-label">
                    IBRACO Alumni
                  </span>
                </div>

                <div className="alumni-benefit-content">
                  <h2>{benefit.title}</h2>

                  <p>{benefit.description}</p>

                  <a
                    href={benefit.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className="text-link"
                  >
                    {benefit.linkText} →
                  </a>
                </div>
              </article>
            );
          })}
        </section>

        <section className="alumni-community">
          <div className="alumni-community-image" />

          <div className="alumni-community-content">
            <span className="alumni-tag">Portugués que conecta</span>

            <h2>La comunidad sigue creciendo</h2>

            <p>
              Alumni puede convertirse en una red para reencontrarse, practicar
              portugués, acceder a experiencias culturales y crear nuevas
              conexiones entre Colombia y Brasil.
            </p>

            <div className="alumni-community-actions">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                Quiero hacer parte
              </a>

              <a href="/agenda-cultural" className="btn btn-secondary">
                Ver próximos encuentros
              </a>
            </div>
          </div>
        </section>

        <section className="alumni-journey-section">
          <div className="section-header">
            <h2>Una comunidad que evoluciona</h2>

            <p>
              Alumni se desarrollará por etapas, empezando por la conexión con
              egresados y la agenda cultural.
            </p>
          </div>

          <div className="alumni-journey-grid">
            {journey.map((step) => (
              <article className="alumni-journey-card" key={step.number}>
                <span className="alumni-journey-number">
                  {step.number}
                </span>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="alumni-opportunities">
          <div className="alumni-opportunities-content">
            <span className="alumni-tag">Próximamente</span>

            <h2>Conexiones y oportunidades</h2>

            <p>
              El futuro de Alumni puede incluir encuentros profesionales,
              oportunidades académicas, convocatorias, viajes, contenidos y
              beneficios exclusivos.
            </p>

            <div className="alumni-opportunity-tags">
              <span>Networking</span>
              <span>Eventos</span>
              <span>Conversación</span>
              <span>Empleo</span>
              <span>Estudios</span>
              <span>Viajes</span>
              <span>Cultura</span>
              <span>Brasil</span>
            </div>
          </div>

          <div className="alumni-opportunities-image" />
        </section>

        <section className="inner-cta">
          <h2>La comunidad continúa</h2>

          <p>
            Si estudiaste en IBRACO, queremos que sigas conectado con el idioma,
            la cultura y la comunidad.
          </p>

          <div className="hero-actions alumni-final-actions">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-yellow"
            >
              Quiero saber más
            </a>

            <a href="/blog" className="btn btn-secondary">
              Explorar contenidos
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
            Instituto de Cultura Brasil Colombia. Portugués, cultura brasileña
            y comunidad.
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

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </footer>

      <a
        className="whatsapp-float"
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp IBRACO"
      >
        ☘
      </a>
    </>
  );
}