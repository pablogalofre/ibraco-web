import "./agenda-cultural.css";

const WHATSAPP_URL = "https://wa.me/573102412817";

const events = [
  {
    day: "08",
    month: "AGO",
    category: "Cine",
    title: "Cine brasileño y conversación",
    description:
      "Proyección de cine brasileño seguida de una conversación en portugués con estudiantes y profesores.",
    location: "Sede Centro · CITIU",
    time: "6:30 p. m.",
    access: "Cupos limitados",
    buttonText: "Reservar cupo",
    href: WHATSAPP_URL,
    image:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=85",
  },
  {
    day: "22",
    month: "AGO",
    category: "Música",
    title: "Roda de samba IBRACO",
    description:
      "Una experiencia musical para acercarte al ritmo, la pronunciación y la cultura brasileña.",
    location: "Sede Norte",
    time: "11:00 a. m.",
    access: "Evento abierto",
    buttonText: "Quiero asistir",
    href: WHATSAPP_URL,
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=85",
  },
  {
    day: "05",
    month: "SEP",
    category: "Comunidad",
    title: "Encuentro cultural IBRACO",
    description:
      "Un espacio para compartir, practicar portugués y conocer a otros estudiantes de la comunidad.",
    location: "Sede Centro · CITIU",
    time: "4:00 p. m.",
    access: "Inscripción previa",
    buttonText: "Inscribirme",
    href: WHATSAPP_URL,
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=85",
  },
];

const categories = [
  {
    title: "Música",
    description: "Samba, bossa nova, MPB y nuevas tendencias.",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Cine",
    description: "Ciclos de cine brasileño y conversatorios.",
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Literatura",
    description: "Clubes de lectura y autores brasileños.",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Gastronomía",
    description: "Sabores de Brasil y encuentros culturales.",
    image:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Conversación",
    description: "Espacios para practicar portugués en comunidad.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85",
  },
  {
    title: "Eventos especiales",
    description: "Celebraciones y actividades institucionales.",
    image:
      "https://images.unsplash.com/photo-1507501336603-6e31db2be093?auto=format&fit=crop&w=1200&q=85",
  },
];

export default function AgendaCulturalPage() {
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
        <section className="agenda-page-hero">
          <div className="agenda-page-hero-overlay" />

          <div className="agenda-page-hero-content">
            <div className="eyebrow">
              <span className="dot" />
              Cultura en movimiento
            </div>

            <h1>Agenda Cultural</h1>

            <p>
              Talleres, cine, música, literatura, gastronomía y experiencias
              para vivir Brasil más allá del salón de clase.
            </p>

            <div className="hero-actions">
              <a href="#proximos-eventos" className="btn btn-yellow">
                Ver próximos eventos
              </a>

              <a
                href="/cultura"
                className="btn btn-secondary agenda-hero-secondary"
              >
                Explorar cultura
              </a>
            </div>

            <div className="agenda-hero-trust">
              <span>✓ Actividades presenciales</span>
              <span>✓ Comunidad IBRACO</span>
              <span>✓ Cultura brasileña en vivo</span>
            </div>
          </div>
        </section>

        <section className="agenda-introduction">
          <div className="section-header">
            <h2>Próximos encuentros</h2>

            <p>
              La programación cultural conecta el aprendizaje del portugués con
              experiencias reales, comunidad y cultura brasileña.
            </p>
          </div>
        </section>

        <section id="proximos-eventos" className="agenda-events-grid">
          {events.map((event) => (
            <article className="agenda-event-card" key={event.title}>
              <div
                className="agenda-event-image"
                style={{ backgroundImage: `url("${event.image}")` }}
              >
                <div className="agenda-event-image-overlay" />

                <div className="agenda-event-date">
                  <strong>{event.day}</strong>
                  <span>{event.month}</span>
                </div>

                <span className="agenda-event-category">
                  {event.category}
                </span>
              </div>

              <div className="agenda-event-content">
                <h2>{event.title}</h2>

                <p>{event.description}</p>

                <ul className="agenda-event-meta">
                  <li>
                    <strong>Lugar</strong>
                    <span>{event.location}</span>
                  </li>

                  <li>
                    <strong>Hora</strong>
                    <span>{event.time}</span>
                  </li>

                  <li>
                    <strong>Acceso</strong>
                    <span>{event.access}</span>
                  </li>
                </ul>

                <a
                  href={event.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  {event.buttonText}
                </a>
              </div>
            </article>
          ))}
        </section>

        <section className="agenda-note">
          <span>Programación de muestra</span>

          <p>
            Las fechas y actividades de esta versión son temporales. La agenda
            definitiva se actualizará con la programación oficial de IBRACO.
          </p>
        </section>

        <section className="agenda-experiences">
          <div className="section-header">
            <h2>Todo lo que puedes vivir</h2>

            <p>
              La cultura aparece como parte del aprendizaje y como una forma de
              mantener activa la comunidad dentro y fuera del salón.
            </p>
          </div>

          <div className="agenda-category-grid">
            {categories.map((category) => (
              <article
                className="agenda-category-card"
                key={category.title}
              >
                <div
                  className="agenda-category-image"
                  style={{ backgroundImage: `url("${category.image}")` }}
                >
                  <div className="agenda-category-overlay" />

                  <h2>{category.title}</h2>
                </div>

                <div className="agenda-category-content">
                  <p>{category.description}</p>

                  <a href="#proximos-eventos" className="text-link">
                    Ver eventos →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="agenda-community">
          <div className="agenda-community-image" />

          <div className="agenda-community-content">
            <span className="alumni-tag">Comunidad IBRACO</span>

            <h2>La experiencia continúa fuera del aula</h2>

            <p>
              Aprender portugués también significa encontrarte con otros,
              conversar, compartir experiencias y mantener una relación viva
              con Brasil.
            </p>

            <div className="agenda-community-actions">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                Recibir información
              </a>

              <a
                href="/alumni"
                className="btn btn-secondary agenda-community-secondary"
              >
                Conocer Alumni
              </a>
            </div>
          </div>
        </section>

        <section className="inner-cta">
          <h2>Vive Brasil con IBRACO</h2>

          <p>
            Recibe información sobre nuevas actividades, encuentros culturales
            y próximos eventos de la comunidad.
          </p>

          <div className="hero-actions agenda-final-actions">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-yellow"
            >
              Quiero recibir la agenda
            </a>

            <a href="/cursos" className="btn btn-secondary">
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