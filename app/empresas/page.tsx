import "./empresas.css";

const WHATSAPP_URL = "https://wa.me/573102412817";

const solutions = [
  {
    title: "Programa a la medida",
    description:
      "Diseñamos el plan según el sector, los roles y los objetivos de tu organización.",
    linkText: "Solicitar propuesta",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Grupos corporativos",
    description:
      "Formación para equipos con horarios, contenidos y modalidades adaptadas a sus necesidades.",
    linkText: "Cotizar programa",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Portugués profesional",
    description:
      "Comunicación práctica para reuniones, presentaciones, servicio, ventas y negociación.",
    linkText: "Hablar con un asesor",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Seguimiento académico",
    description:
      "Acompañamiento e informes de avance para la empresa, los líderes y cada grupo.",
    linkText: "Conocer metodología",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Objetivos específicos",
    description:
      "Portugués para ventas, atención al cliente, operaciones, liderazgo o expansión regional.",
    linkText: "Diseñar un programa",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=85",
  },
  {
    title: "Conexión con Brasil",
    description:
      "Preparación para equipos que interactúan con clientes, aliados, proveedores o filiales brasileñas.",
    linkText: "Solicitar información",
    image:
      "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&w=1400&q=85",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Diagnóstico",
    description:
      "Entendemos el equipo, los objetivos y las situaciones donde necesita usar portugués.",
  },
  {
    number: "02",
    title: "Diseño",
    description:
      "Definimos modalidad, intensidad, contenidos, calendario y forma de seguimiento.",
  },
  {
    number: "03",
    title: "Implementación",
    description:
      "Iniciamos la formación con profesores, metodología y acompañamiento de IBRACO.",
  },
  {
    number: "04",
    title: "Seguimiento",
    description:
      "Evaluamos avances y entregamos información útil para la organización.",
  },
];

export default function EmpresasPage() {
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

          <a href={WHATSAPP_URL} className="nav-cta">
            Solicitar propuesta
          </a>
        </nav>
      </header>

      <main className="inner-page">
        <section className="business-page-hero">
          <div className="business-page-hero-overlay" />

          <div className="business-page-hero-content">
            <div className="eyebrow">
              <span className="dot" />
              Portugués para organizaciones
            </div>

            <h1>IBRACO Empresas</h1>

            <p>
              Programas corporativos para equipos que necesitan comunicarse,
              negociar y trabajar mejor con Brasil.
            </p>

            <div className="hero-actions">
              <a href="#soluciones" className="btn btn-yellow">
                Ver soluciones
              </a>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary business-hero-secondary"
              >
                Hablar con un asesor
              </a>
            </div>

            <div className="business-hero-trust">
              <span>✓ Programas personalizados</span>
              <span>✓ Presencial o virtual</span>
              <span>✓ Seguimiento académico</span>
            </div>
          </div>
        </section>

        <section className="business-introduction">
          <div className="section-header">
            <h2>Portugués alineado con tu negocio</h2>

            <p>
              Diseñamos programas según el sector, las funciones del equipo y
              los resultados que necesita alcanzar la organización.
            </p>
          </div>
        </section>

        <section id="soluciones" className="business-solutions-grid">
          {solutions.map((solution) => (
            <article className="business-solution-card" key={solution.title}>
              <div
                className="business-solution-image"
                style={{ backgroundImage: `url("${solution.image}")` }}
              >
                <div className="business-solution-overlay" />

                <span className="business-solution-label">
                  IBRACO Empresas
                </span>
              </div>

              <div className="business-solution-content">
                <h2>{solution.title}</h2>

                <p>{solution.description}</p>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  {solution.linkText} →
                </a>
              </div>
            </article>
          ))}
        </section>

        <section className="business-connection">
          <div className="business-connection-image" />

          <div className="business-connection-content">
            <span className="alumni-tag">Brasil y Colombia</span>

            <h2>Prepara a tu equipo para comunicarse con Brasil</h2>

            <p>
              El portugués corporativo va más allá del vocabulario. Ayuda a
              comprender contextos culturales, construir confianza y trabajar
              con mayor seguridad en reuniones, operaciones y negociaciones.
            </p>

            <div className="business-connection-actions">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                Solicitar diagnóstico
              </a>

              <a href="/cultura" className="btn btn-secondary">
                Conocer IBRACO
              </a>
            </div>
          </div>
        </section>

        <section className="business-process-section">
          <div className="section-header">
            <h2>Cómo funciona</h2>

            <p>
              Construimos cada programa a partir de las necesidades reales de
              tu organización.
            </p>
          </div>

          <div className="business-process-grid">
            {processSteps.map((step) => (
              <article className="business-process-card" key={step.number}>
                <span className="business-process-number">
                  {step.number}
                </span>

                <h3>{step.title}</h3>

                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="business-objectives">
          <div className="business-objectives-content">
            <span className="alumni-tag">Soluciones corporativas</span>

            <h2>Un programa para cada objetivo</h2>

            <p>
              Podemos enfocar la formación en las situaciones reales que vive
              tu equipo dentro de la organización.
            </p>

            <div className="business-objective-tags">
              <span>Ventas</span>
              <span>Servicio al cliente</span>
              <span>Operaciones</span>
              <span>Liderazgo</span>
              <span>Negociación</span>
              <span>Expansión regional</span>
              <span>Presentaciones</span>
              <span>Relaciones comerciales</span>
            </div>
          </div>

          <div className="business-objectives-image" />
        </section>

        <section className="inner-cta">
          <h2>Prepara a tu organización para Brasil</h2>

          <p>
            Cuéntanos cuántas personas necesitan formación, cuál es su nivel y
            qué objetivo necesita alcanzar el equipo.
          </p>

          <div className="hero-actions business-final-actions">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-yellow"
            >
              Solicitar propuesta
            </a>

            <a href="/cursos" className="btn btn-secondary">
              Ver otros programas
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