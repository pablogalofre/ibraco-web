const SHOP_URL = "https://ibraco.landingpauta.com/cursos/";

const programs = [
  {
    eyebrow: "5 semanas · 50 horas",
    title: "Intensivo",
    description:
      "Avanza un nivel en cinco semanas con clases de alta intensidad. Disponible según programación en Sede Norte, Sede Centro y modalidad virtual.",
    detailsHref: "https://www.ibraco.org.co/courses/intensivos/",
    shopHref: SHOP_URL,
  },
  {
    eyebrow: "Entre semana · 50 horas",
    title: "Semi-intensivo",
    description:
      "Estudia de manera más pausada entre semana. Cada nivel se desarrolla durante diez semanas.",
    detailsHref:
      "https://www.ibraco.org.co/courses/semi-intensivos-entre-semana/",
    shopHref: SHOP_URL,
  },
  {
    eyebrow: "Sábados · 48 horas",
    title: "Semi-intensivo sábados",
    description:
      "Una alternativa para quienes necesitan concentrar su formación los sábados durante doce semanas.",
    detailsHref:
      "https://www.ibraco.org.co/courses/semi-intensivos-sabados/",
    shopHref: SHOP_URL,
  },
  {
    eyebrow: "Vacaciones · avance rápido",
    title: "Curso Expresso",
    description:
      "Una experiencia intensiva diseñada para avanzar dos niveles en un periodo corto durante temporadas especiales.",
    detailsHref: SHOP_URL,
    shopHref: SHOP_URL,
  },
  {
    eyebrow: "Preparación especializada",
    title: "Celpe-Bras",
    description:
      "Prepárate para el certificado oficial de dominio del portugués de Brasil con acompañamiento especializado.",
    detailsHref:
      "https://www.ibraco.org.co/courses/preparatorio-celpe-bras/",
    shopHref: SHOP_URL,
  },
  {
    eyebrow: "Atención personalizada",
    title: "Clases particulares",
    description:
      "Un programa flexible y personalizado según tu nivel, disponibilidad y objetivos específicos.",
    detailsHref:
      "https://www.ibraco.org.co/courses/clases-particulares/",
    shopHref: "https://wa.me/573102412817",
  },
  {
    eyebrow: "Equipos y organizaciones",
    title: "Portugués para empresas",
    description:
      "Programas corporativos adaptados al sector, las funciones y los objetivos de cada organización.",
    detailsHref: "/empresas",
    shopHref: "https://wa.me/573102412817",
  },
  {
    eyebrow: "Instituciones educativas",
    title: "Colegios y universidades",
    description:
      "Alianzas, clases extracurriculares, currículo, certificación y beneficios para comunidades educativas.",
    detailsHref:
      "https://www.ibraco.org.co/courses/para-entidades-educativas/",
    shopHref: "https://wa.me/573102412817",
  },
];

export default function CursosPage() {
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
          <a href="/travessias">Travessias</a>

          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-cta"
          >
            Matricúlate
          </a>
        </nav>
      </header>

      <main className="inner-page">
        <section className="inner-hero">
          <div className="eyebrow">
            <span className="dot" />
            Oferta académica IBRACO
          </div>

          <h1>Encuentra tu curso de portugués</h1>

          <p>
            Elige la intensidad, el horario y la modalidad que mejor se adaptan
            a tu vida. Aprende portugués con una institución que integra idioma,
            cultura y comunidad.
          </p>

          <div className="hero-actions">
            <a href="#programas" className="btn btn-primary">
              Explorar programas
            </a>

            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Ir a matrículas
            </a>
          </div>
        </section>

        <section id="programas" className="courses-catalog">
          <div className="section-header">
            <h2>Nuestros programas</h2>

            <p>
              Conoce las modalidades disponibles y pasa directamente a
              matrícula cuando encuentres la opción indicada.
            </p>
          </div>

          <div className="program-grid">
            {programs.map((program) => (
              <article className="program-card" key={program.title}>
                <span className="program-eyebrow">{program.eyebrow}</span>

                <h2>{program.title}</h2>

                <p>{program.description}</p>

                <div className="program-actions">
                  <a
                    href={program.detailsHref}
                    target={
                      program.detailsHref.startsWith("http")
                        ? "_blank"
                        : undefined
                    }
                    rel={
                      program.detailsHref.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-link"
                  >
                    Conocer programa →
                  </a>

                  <a
                    href={program.shopHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-yellow"
                  >
                    {program.shopHref.includes("wa.me")
                      ? "Solicitar información"
                      : "Matricularme"}
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="academic-route">
          <div className="section-header">
            <h2>Tu ruta de aprendizaje</h2>

            <p>
              El programa regular está organizado en siete niveles y conduce
              progresivamente desde un nivel inicial hasta B2.
            </p>
          </div>

          <div className="level-route">
            <article>
              <strong>A1</strong>
              <span>Nivel 1</span>
              <p>Comprende y usa expresiones cotidianas básicas.</p>
            </article>

            <article>
              <strong>A2</strong>
              <span>Niveles 2 y 3</span>
              <p>Comunícate en situaciones habituales y conocidas.</p>
            </article>

            <article>
              <strong>B1</strong>
              <span>Niveles 4 y 5</span>
              <p>Comprende y participa en conversaciones más amplias.</p>
            </article>

            <article>
              <strong>B2</strong>
              <span>Niveles 6 y 7</span>
              <p>Usa el portugués con fluidez para fines personales y profesionales.</p>
            </article>
          </div>
        </section>

        <section className="level-purchase">
          <div>
            <span className="alumni-tag">¿Ya sabes portugués?</span>

            <h2>Mide en qué nivel estás</h2>

            <p>
              Compra el examen de nivelación, presenta la prueba escrita y
              agenda posteriormente la entrevista oral.
            </p>
          </div>

          <div className="level-purchase-actions">
            <a
              href="https://ibraco.landingpauta.com/producto/examen-de-nivelacion/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Comprar examen
            </a>

            <a
              href="https://www.ibraco.org.co/courses/examen-de-nivelacion-ibraco/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Cómo funciona
            </a>
          </div>
        </section>

        <section className="inner-cta">
          <h2>Elige tu curso y matricúlate</h2>

          <p>
            Revisa las opciones vigentes, selecciona sede, modalidad y horario,
            y continúa el proceso en la tienda de IBRACO.
          </p>

          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-yellow"
          >
            Ver cursos disponibles
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
          <a href="/travessias">Travessias</a>
          <a
            href="https://ibraco.landingpauta.com/producto/examen-de-nivelacion/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mide en qué nivel estás
          </a>
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