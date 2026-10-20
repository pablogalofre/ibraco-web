import "./cursos.css";
import { supabase } from "../../lib/supabase";
export const dynamic = "force-dynamic";
export const revalidate = 0;
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
/*
 * La tienda está en español.
 * Si el nombre viene de la base de datos escrito en portugués,
 * aquí corregimos únicamente la palabra Português → Portugués.
 */
function normalizeCourseName(name: string | null) {
  if (!name) return "Portugués";
  return name
    .replace(/Português/gi, "Portugués")
    .replace(/Portugues/gi, "Portugués");
}
/*
 * Todos los cursos se muestran con el mismo criterio:
 * Curso · Modalidad · Sede · Jornada
 *
 * Ejemplo:
 * Portugués Semi Intensivo · Presencial · Centro · Mañana
 */
function buildCourseTitle(course: Course) {
  const courseName = normalizeCourseName(course.name)
    .replace(/^Portugués\s*/i, "")
    .trim();
  const parts = [
    courseName ? `Curso ${courseName}` : "Curso",
    course.modality,
    course.campus,
    course.shift,
  ].filter(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  );
  return parts.join(" · ");
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
        <style>{`
          .courses-page-hero {
            min-height: 620px !important;
            padding: 100px 7vw 76px !important;
            align-items: center;
          }
          .courses-page-hero-content {
            width: 100%;
            max-width: 950px;
            text-align: left !important;
          }
          .courses-page-hero-content h1 {
            max-width: 900px;
            margin: 16px 0 28px;
            font-size: clamp(44px, 6vw, 88px) !important;
            line-height: 1.03 !important;
            letter-spacing: -0.055em !important;
            text-align: left !important;
            overflow-wrap: normal;
            word-break: normal;
          }
          .courses-page-hero-content p {
            max-width: 730px;
            font-size: clamp(17px, 1.6vw, 21px);
            line-height: 1.5;
            text-align: left !important;
          }
          .courses-live-grid {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
            align-items: stretch;
            gap: 24px;
          }
          .ibraco-course-card {
            min-width: 0;
            width: 100%;
            text-align: left !important;
          }
          .ibraco-course-card-body {
            padding: 24px;
            display: flex;
            flex: 1;
            flex-direction: column;
            justify-content: space-between;
            gap: 24px;
            min-width: 0;
          }
          .ibraco-course-card-title {
            font-size: clamp(20px, 1.8vw, 26px);
            line-height: 1.22;
            margin: 0;
            overflow-wrap: anywhere;
            text-align: left !important;
          }
          .ibraco-course-facts {
            display: flex;
            flex-direction: column;
            gap: 11px;
            margin-top: 22px;
          }
          .ibraco-course-fact {
            display: block !important;
            margin: 0 !important;
            font-size: 15px;
            line-height: 1.5;
            text-align: left !important;
            white-space: normal !important;
            overflow-wrap: anywhere;
          }
          .ibraco-course-fact strong {
            display: inline;
            font-weight: 800;
            margin-right: 6px;
          }
          .ibraco-course-badges {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-start !important;
            gap: 10px;
            margin-bottom: 18px;
          }
          .ibraco-course-badges > span { max-width: 100%; }
          .ibraco-course-card .btn { white-space: normal; }
          @media (max-width: 1100px) {
            .courses-live-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .ibraco-course-card-body { padding: 22px; }
          }
          @media (max-width: 700px) {
            .courses-page-hero {
              min-height: auto !important;
              padding: 70px 6vw 62px !important;
            }
            .courses-page-hero-content h1 {
              font-size: clamp(38px, 9.5vw, 58px) !important;
              line-height: 1.04 !important;
            }
            .courses-live-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 18px; }
            .ibraco-course-card-body { padding: 20px; }
            .ibraco-course-card-title { font-size: 23px; }
            .whatsapp-float {
              max-width: calc(100vw - 24px);
              font-size: 13px !important;
              padding: 11px 14px !important;
              right: 12px !important;
              bottom: 12px !important;
            }
          }
        `}</style>
      
      <main className="inner-page" style={{ paddingTop: 126 }}>
        <section className="courses-page-hero">
          <div className="courses-page-hero-overlay" />
          <div className="courses-page-hero-content">
            <div className="eyebrow">
              <span className="dot" />
              Oferta académica IBRACO
            </div>
            <h1>Encuentra tu curso de portugués</h1>
            <p>
              Elige el horario y la modalidad que mejor se adapten a tu ritmo
              de vida. Aprende portugués con IBRACO, donde lengua y cultura no
              se separan.
            </p>
            <div className="hero-actions">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary courses-hero-secondary"
                data-cta="whatsapp-asesor-hero"
                style={{ backgroundColor: "#ffffff", color: "#171717", borderColor: "#ffffff" }}
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
                  margin: "8px 0 0",
                  lineHeight: 1.05,
                }}
              >
                Cursos disponibles
              </h2>
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
                  data-cta="whatsapp-asesor-sin-cursos"
                >
                  Hablar con un asesor
                </a>
              </div>
            ) : (
              <div className="courses-live-grid">
                {courses.map((course) => {
                  const courseTitle = buildCourseTitle(course);
                  return (
                    <article
                      key={course.id}
                      className="ibraco-course-card"
                      style={{
                        background: "#fff",
                        borderRadius: "24px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        minHeight: "0",
                      }}
                    >
                      {course.image_url ? (
                        <div
                          style={{
                            width: "100%",
                            overflow: "hidden",
                            background: "#eee",
                            padding: "16px",
                            boxSizing: "border-box",
                          }}
                        >
                          <img
                            src={course.image_url}
                            alt={courseTitle}
                            style={{
                              width: "100%",
                              maxWidth: "520px",
                              maxHeight: "320px",
                              objectFit: "contain",
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
                      <div className="ibraco-course-card-body">
                        <div>
                          <div className="ibraco-course-badges">
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
                          <h3 className="ibraco-course-card-title">
                            {courseTitle}
                          </h3>
                          <div className="ibraco-course-facts">
                            {course.start_date && (
                              <p className="ibraco-course-fact"><strong>Inicio:</strong> {formatDate(course.start_date)}</p>
                            )}
                            {course.end_date && (
                              <p className="ibraco-course-fact"><strong>Finaliza:</strong> {formatDate(course.end_date)}</p>
                            )}
                            {course.days && course.days.length > 0 && (
                              <p className="ibraco-course-fact"><strong>Días:</strong> {course.days.join(", ")}</p>
                            )}
                            {(course.start_time || course.end_time) && (
                              <p className="ibraco-course-fact">
                                <strong>Horario:</strong> {formatTime(course.start_time)}
                                {course.start_time && course.end_time ? " – " : ""}
                                {formatTime(course.end_time)}
                              </p>
                            )}
                            {course.campus && (
                              <p className="ibraco-course-fact"><strong>Sede:</strong> {course.campus}</p>
                            )}
                            {course.level && (
                              <p className="ibraco-course-fact"><strong>Nivel:</strong> {course.level}</p>
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
                  );
                })}
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
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              data-cta="whatsapp-asesor-final"
              style={{ backgroundColor: "#ffffff", color: "#171717", borderColor: "#ffffff" }}
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
        aria-label="Habla con nosotros por WhatsApp"
        data-cta="whatsapp-flotante"
        style={{
          width: "auto", height: "auto", minHeight: 54,
          padding: "12px 18px", borderRadius: 999,
          display: "inline-flex", alignItems: "center", gap: 9,
          fontSize: 15, fontWeight: 800, lineHeight: 1.1,
          textDecoration: "none", whiteSpace: "nowrap",
          right: 18, bottom: 18, background: "#128C4A", color: "#ffffff"
        }}
      >
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.52 3.48A11.85 11.85 0 0 0 12.05 0C5.45 0 .07 5.37.07 11.98c0 2.11.55 4.17 1.59 5.99L0 24l6.19-1.62a11.96 11.96 0 0 0 5.86 1.49h.01c6.6 0 11.98-5.37 11.98-11.98a11.9 11.9 0 0 0-3.52-8.41ZM12.06 21.84c-1.8 0-3.57-.48-5.11-1.39l-.37-.22-3.67.96.98-3.58-.24-.37a9.9 9.9 0 0 1-1.52-5.26c0-5.49 4.46-9.95 9.95-9.95a9.88 9.88 0 0 1 7.03 2.92 9.87 9.87 0 0 1 2.91 7.04c0 5.49-4.46 9.95-9.96 9.95Zm5.46-7.46c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.47-1.77-1.64-2.07-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.11 3.22 5.11 4.51.71.31 1.27.49 1.71.62.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/>
        </svg>
        <span>Habla con nosotros</span>
      </a>
    </>
  );
}
