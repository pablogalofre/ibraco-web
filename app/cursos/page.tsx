import "./cursos.css";
import { supabase } from "../../lib/supabase";

const WHATSAPP_URL = "https://wa.me/573125841068";

type Course = {
  id: number;
  slug: string;
  name: string;
  cycle: string | null;
  year: number | null;
  shift: string | null;
  modality: string | null;
  campus: string | null;
  start_date: string | null;
  end_date: string | null;
  days: string[] | null;
  start_time: string | null;
  end_time: string | null;
  level: string | null;
  price: number | null;
  capacity: number | null;
  status: string | null;
  image_url: string | null;
};

const programs = [
  {
    eyebrow: "5 semanas · 50 horas",
    title: "Intensivo",
    description:
      "Avanza un nivel en cinco semanas con clases de alta intensidad. Disponible según programación en Sede Norte, Sede Centro y modalidad virtual.",
    detailsHref: "https://www.ibraco.org.co/courses/intensivos/",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    eyebrow: "Entre semana · 50 horas",
    title: "Semi-intensivo",
    description:
      "Estudia de manera más pausada entre semana. Cada nivel se desarrolla durante diez semanas.",
    detailsHref:
      "https://www.ibraco.org.co/courses/semi-intensivos-entre-semana/",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    eyebrow: "Sábados · 48 horas",
    title: "Semi-intensivo sábados",
    description:
      "Una alternativa para quienes necesitan concentrar su formación los sábados durante doce semanas.",
    detailsHref:
      "https://www.ibraco.org.co/courses/semi-intensivos-sabados/",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    eyebrow: "Vacaciones · avance rápido",
    title: "Curso Expresso",
    description:
      "Una experiencia intensiva diseñada para avanzar dos niveles en un periodo corto durante temporadas especiales.",
    detailsHref: "#cursos-disponibles",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    eyebrow: "Preparación especializada",
    title: "Celpe-Bras",
    description:
      "Prepárate para el certificado oficial de dominio del portugués de Brasil con acompañamiento especializado.",
    detailsHref:
      "https://www.ibraco.org.co/courses/preparatorio-celpe-bras/",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    eyebrow: "Atención personalizada",
    title: "Clases particulares",
    description:
      "Un programa flexible y personalizado según tu nivel, disponibilidad y objetivos específicos.",
    detailsHref:
      "https://www.ibraco.org.co/courses/clases-particulares/",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    eyebrow: "Equipos y organizaciones",
    title: "Portugués para empresas",
    description:
      "Programas corporativos adaptados al sector, las funciones y los objetivos de cada organización.",
    detailsHref: "/empresas",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    eyebrow: "Instituciones educativas",
    title: "Colegios y universidades",
    description:
      "Alianzas, clases extracurriculares, currículo, certificación y beneficios para comunidades educativas.",
    detailsHref:
      "https://www.ibraco.org.co/courses/para-entidades-educativas/",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
];

const learningLevels = [
  {
    level: "A1",
    name: "Nivel 1",
    description: "Comprende y usa expresiones cotidianas básicas.",
  },
  {
    level: "A2",
    name: "Niveles 2 y 3",
    description: "Comunícate en situaciones habituales y conocidas.",
  },
  {
    level: "B1",
    name: "Niveles 4 y 5",
    description:
      "Comprende y participa en conversaciones cada vez más amplias.",
  },
  {
    level: "B2",
    name: "Niveles 6 y 7",
    description:
      "Usa el portugués con fluidez para fines personales y profesionales.",
  },
];

function formatDate(date: string | null) {
  if (!date) return "";

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatPrice(price: number | null) {
  if (!price) return "Precio por confirmar";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatTime(time: string | null) {
  if (!time) return "";

  return time.slice(0, 5);
}

export default async function CursosPage() {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .order("start_date", { ascending: true });

  const courses: Course[] = error ? [] : data ?? [];

  if (error) {
    console.error("Error cargando cursos:", error);
  }

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

          <a href="#cursos-disponibles" className="nav-cta">
            Matricúlate
          </a>
        </nav>
      </header>

      <main className="inner-page">
        <section className="courses-page-hero">
          <div className="courses-page-hero-overlay" />

          <div className="courses-page-hero-content">
            <div className="eyebrow">
              <span className="dot" />
              Oferta académica IBRACO
            </div>

            <h1>Encuentra tu curso de portugués</h1>

            <p>
              Elige la intensidad, el horario y la modalidad que mejor se
              adaptan a tu vida. Aprende portugués con una institución que
              integra idioma, cultura y comunidad.
            </p>

            <div className="hero-actions">
              <a href="#cursos-disponibles" className="btn btn-yellow">
                Ver cursos disponibles
              </a>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary courses-hero-secondary"
              >
                Hablar con un asesor
              </a>
            </div>

            <div className="courses-hero-trust">
              <span>✓ Presencial en Bogotá</span>
              <span>✓ Virtual en vivo</span>
              <span>✓ Ruta completa hasta B2</span>
            </div>
          </div>
        </section>

        {/* CURSOS REALES DESDE SUPABASE */}

        <section
          id="cursos-disponibles"
          style={{
            padding: "80px 7%",
            background: "#f8f5e9",
          }}
        >
          <div
            style={{
              maxWidth: "1320px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                maxWidth: "750px",
                marginBottom: "40px",
              }}
            >
              <span
                style={{
                  color: "#009c4b",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  fontSize: "14px",
                }}
              >
                Matrículas abiertas
              </span>

              <h2
                style={{
                  fontSize: "42px",
                  margin: "8px 0 12px",
                  lineHeight: 1.05,
                }}
              >
                Cursos disponibles
              </h2>

              <p
                style={{
                  fontSize: "18px",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                Estas son las opciones que actualmente están habilitadas para
                matrícula.
              </p>
            </div>

            {courses.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  padding: "35px",
                  borderRadius: "24px",
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  Próximamente nuevas fechas
                </h3>

                <p>
                  Estamos preparando la siguiente programación de cursos.
                  Puedes hablar con nuestro equipo para recibir información.
                </p>

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-yellow"
                >
                  Hablar con un asesor
                </a>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(310px, 1fr))",
                  gap: "24px",
                }}
              >
                {courses.map((course) => (
                  <article
                    key={course.id}
                    style={{
                      background: "#fff",
                      borderRadius: "24px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: "520px",
                    }}
                  >
                    {course.image_url ? (
                      <div
                        style={{
                          width: "100%",
                          overflow: "hidden",
                          background: "#eee",
                          padding: "24px",
                          boxSizing: "border-box",
                        }}
                      >
                        <img
                          src={course.image_url}
                          alt={`${course.name} ${course.cycle || ""}`}
                          style={{
                            width: "100%",
                            maxWidth: "520px",
                            height: "auto",
                            display: "block",
                            margin: "0 auto",
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "240px",
                          background: "#009c4b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "30px",
                          boxSizing: "border-box",
                        }}
                      >
                        <div
                          style={{
                            color: "#fff",
                            fontSize: "26px",
                            fontWeight: 900,
                            textAlign: "center",
                          }}
                        >
                          IBRACO
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        padding: "30px",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px",
                            alignItems: "flex-start",
                            marginBottom: "18px",
                          }}
                        >
                          <span
                            style={{
                              color: "#009c4b",
                              fontSize: "14px",
                              fontWeight: 800,
                              textTransform: "uppercase",
                            }}
                          >
                            {course.cycle || "Portugués IBRACO"}
                          </span>

                          {course.modality && (
                            <span
                              style={{
                                background: "#f1f1f1",
                                padding: "6px 10px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              {course.modality}
                            </span>
                          )}
                        </div>

                        <h3
                          style={{
                            fontSize: "27px",
                            lineHeight: 1.1,
                            margin: "0 0 8px",
                          }}
                        >
                          {course.name}
                        </h3>

                        {course.shift && (
                          <p
                            style={{
                              fontSize: "17px",
                              fontWeight: 700,
                              marginTop: 0,
                            }}
                          >
                            Jornada {course.shift}
                          </p>
                        )}

                        <div
                          style={{
                            marginTop: "25px",
                            display: "grid",
                            gap: "9px",
                            fontSize: "15px",
                          }}
                        >
                          {course.start_date && (
                            <div>
                              <strong>Inicio:</strong>{" "}
                              {formatDate(course.start_date)}
                            </div>
                          )}

                          {course.end_date && (
                            <div>
                              <strong>Finaliza:</strong>{" "}
                              {formatDate(course.end_date)}
                            </div>
                          )}

                          {course.days && course.days.length > 0 && (
                            <div>
                              <strong>Días:</strong>{" "}
                              {course.days.join(", ")}
                            </div>
                          )}

                          {(course.start_time || course.end_time) && (
                            <div>
                              <strong>Horario:</strong>{" "}
                              {formatTime(course.start_time)}
                              {course.start_time && course.end_time ? " – " : ""}
                              {formatTime(course.end_time)}
                            </div>
                          )}

                          {course.campus && (
                            <div>
                              <strong>Sede:</strong> {course.campus}
                            </div>
                          )}

                          {course.level && (
                            <div>
                              <strong>Nivel:</strong> {course.level}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          borderTop: "1px solid #eee",
                          paddingTop: "22px",
                          marginTop: "28px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "25px",
                            fontWeight: 900,
                            marginBottom: "17px",
                          }}
                        >
                          {formatPrice(course.price)}
                        </div>

                        <a
  href={`/matricula/${course.slug}`}
  className="btn btn-yellow"
                          style={{
                            width: "100%",
                            textAlign: "center",
                            boxSizing: "border-box",
                          }}
                        >
                          Seleccionar curso
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* PROGRAMAS INSTITUCIONALES */}

        <section className="courses-introduction">
          <div className="section-header">
            <h2>Elige tu camino</h2>

            <p>
              Conoce las distintas modalidades de formación de IBRACO y
              encuentra la alternativa que mejor se adapte a tus objetivos.
            </p>
          </div>
        </section>

        <section id="programas" className="courses-program-grid">
          {programs.map((program) => {
            const externalDetails =
              program.detailsHref.startsWith("http");

            return (
              <article
                className="courses-program-card"
                key={program.title}
              >
                <div
                  className="courses-program-image"
                  style={{
                    backgroundImage: `url("${program.image}")`,
                    backgroundPosition: program.imagePosition,
                  }}
                >
                  <div className="courses-program-image-overlay" />

                  <span className="courses-program-eyebrow">
                    {program.eyebrow}
                  </span>
                </div>

                <div className="courses-program-content">
                  <h2>{program.title}</h2>

                  <p>{program.description}</p>

                  <div className="courses-program-actions">
                    <a
                      href={program.detailsHref}
                      target={
                        externalDetails ? "_blank" : undefined
                      }
                      rel={
                        externalDetails
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-link"
                    >
                      Conocer programa →
                    </a>

                    <a
                      href="#cursos-disponibles"
                      className="btn btn-yellow"
                    >
                      Ver disponibilidad
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <section className="courses-format-section">
          <div className="courses-format-image" />

          <div className="courses-format-content">
            <span className="alumni-tag">Presencial y virtual</span>

            <h2>La misma experiencia IBRACO, estés donde estés</h2>

            <p>
              Estudia presencialmente en nuestras sedes de Bogotá o conéctate
              en vivo desde cualquier ciudad. En ambas modalidades encuentras
              profesores, metodología, acompañamiento y cultura IBRACO.
            </p>

            <div className="courses-format-actions">
              <a href="/sedes" className="btn btn-yellow">
                Conocer las sedes
              </a>

              <a href="#cursos-disponibles" className="btn btn-secondary">
                Ver cursos
              </a>
            </div>
          </div>
        </section>

        <section className="courses-academic-route">
          <div className="section-header">
            <h2>Tu ruta de aprendizaje</h2>

            <p>
              El programa regular está organizado en siete niveles y conduce
              progresivamente desde un nivel inicial hasta B2.
            </p>
          </div>

          <div className="courses-level-grid">
            {learningLevels.map((item, index) => (
              <article className="courses-level-card" key={item.level}>
                <span className="courses-level-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <strong>{item.level}</strong>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="courses-level-purchase">
          <div className="courses-level-purchase-content">
            <span className="alumni-tag">¿Ya sabes portugués?</span>

            <h2>Mide en qué nivel estás</h2>

            <p>
              Compra el examen de nivelación, presenta la prueba escrita y
              agenda posteriormente la entrevista oral.
            </p>

            <div className="courses-level-purchase-actions">
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
          </div>

          <div className="courses-level-purchase-image" />
        </section>

        <section className="inner-cta">
          <h2>Elige tu curso y matricúlate</h2>

          <p>
            Revisa las opciones disponibles, selecciona modalidad, horario y
            sede, y continúa tu proceso de matrícula con IBRACO.
          </p>

          <div className="hero-actions courses-final-actions">
            <a href="#cursos-disponibles" className="btn btn-yellow">
              Ver cursos disponibles
            </a>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Hablar con un asesor
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

          <a
            href="https://ibraco.landingpauta.com/producto/examen-de-nivelacion/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mide en qué nivel estás
          </a>

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