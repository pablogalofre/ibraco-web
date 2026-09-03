export default function Home() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <span className="topbar-highlight">
            🇧🇷 30 años conectando Colombia con Brasil
          </span>

          <a href="tel:+573125841068">📞 (+57) 312 584 1068</a>

          <a href="mailto:informacion@ibraco.org.co">
            ✉ informacion@ibraco.org.co
          </a>
        </div>

        <div className="topbar-center">
          <span>🇨🇴 Español ▾</span>
        </div>

        <div className="topbar-right">
          <a href="#">Ingreso estudiantes</a>
          <a href="#">Preinscripción</a>
          <a href="#" aria-label="X">
            𝕏
          </a>
          <a href="#" aria-label="Facebook">
            f
          </a>
          <a href="#" aria-label="Instagram">
            ◎
          </a>
          <a href="#" aria-label="LinkedIn">
            in
          </a>
        </div>
      </div>

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
          <a href="/eventos/feijoada-da-independencia">Agenda cultural</a>
          <a href="/empresas">Empresas</a>
          <a href="/alumni">Alumni</a>
          <a href="/blog">Blog</a>

          <a href="/#inscripcion" className="nav-cta">
            Inscribirme
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="inscripcion">
          <div>
            <div className="eyebrow">
              <span className="dot"></span>
              Instituto de Cultura Brasil Colombia
            </div>

            <h1>
              Aprende portugués. <span>O Brasil é aqui.</span>
            </h1>

            <p className="hero-copy">
              Aprende portugués en Bogotá o en modalidad virtual con IBRACO:
              una institución que conecta a Colombia con Brasil a través del
              idioma, la cultura y la comunidad.
            </p>

            <div className="hero-actions">
              <a href="/cursos" className="btn btn-primary">
                Ver cursos
              </a>

              <a href="#nivel" className="btn btn-secondary">
                Mide tu nivel
              </a>

              <a href="#ciclos" className="btn btn-secondary">
                Inscribirme ahora
              </a>
            </div>

            <div className="trust-row">
              <span>✓ Sede Norte en Bogotá</span>
              <span>✓ Sede Centro CITIU</span>
              <span>✓ Modalidad virtual en vivo</span>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-photo">
              <div className="eyebrow">
                <span className="dot"></span>
                Cursos · Cultura · Comunidad
              </div>

              <div className="floating-card">
                <h3>Portugués que se vive.</h3>

                <p>
                  En IBRACO aprendes portugués por medio de conversación,
                  música, cine, literatura, eventos y cultura real de Brasil.
                </p>
              </div>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <strong>3.000+</strong>
                <small>Estudiantes al año</small>
              </div>

              <div className="hero-stat">
                <strong>30+</strong>
                <small>Años de trayectoria</small>
              </div>

              <div className="hero-stat">
                <strong>260M</strong>
                <small>Personas sueñan en portugués</small>
              </div>
            </div>
          </div>
        </section>

        <section className="quick-path">
          <h2>Estudia donde mejor te quede</h2>

          <a href="/sedes" className="path-item">
            <strong>Sede Norte</strong>
            <span>Experiencia presencial en Bogotá</span>
          </a>

          <a href="/sedes" className="path-item">
            <strong>Sede Centro CITIU</strong>
            <span>Un espacio moderno en Bogotá</span>
          </a>

          <a href="/sedes" className="path-item">
            <strong>Virtual</strong>
            <span>Clases en vivo desde cualquier ciudad</span>
          </a>

          <a href="#nivel" className="path-item">
            <strong>Mide tu nivel</strong>
            <span>Encuentra el curso adecuado</span>
          </a>
        </section>

        <section className="campus-section" id="sedes">
          <div className="section-header">
            <h2>Sedes en Bogotá y modalidad virtual</h2>

            <p>
              La presencialidad es una fortaleza de IBRACO. La virtualidad no la
              reemplaza: la amplía y conecta a más personas con nuestra
              comunidad.
            </p>
          </div>

          <div className="campus-grid">
            <article className="campus-card campus-norte">
              <div>
                <span className="tag">Presencial</span>
                <h3>Sede Norte</h3>
              </div>

              <p>
                Comunidad, profesores, eventos y cultura brasileña en un entorno
                cercano y vivo.
              </p>

              <a href="/cursos" className="btn btn-yellow">
                Ver cursos Norte
              </a>
            </article>

            <article className="campus-card campus-centro">
              <div>
                <span className="tag">Presencial</span>
                <h3>Sede Centro CITIU</h3>
              </div>

              <p>
                Una sede moderna en el centro estudiantil de Bogotá, diseñada
                para aprender, encontrarse y vivir la cultura.
              </p>

              <a href="/cursos" className="btn btn-yellow">
                Ver cursos Centro
              </a>
            </article>

            <article className="campus-card campus-virtual virtual">
              <div>
                <span className="tag">Virtual</span>
                <h3>Virtual</h3>
              </div>

              <p>
                Aprende portugués en vivo desde cualquier ciudad con profesores,
                metodología y experiencia IBRACO.
              </p>

              <a href="/cursos" className="btn btn-yellow">
                Ver cursos virtuales
              </a>
            </article>
          </div>

          <div className="section-action">
            <a href="/sedes" className="btn btn-primary">
              Conocer todas las sedes
            </a>
          </div>
        </section>

        <section className="lusophone-section" id="mundo-lusofono">
          <div className="section-header">
            <h2>¿Por qué aprender portugués hoy?</h2>

            <p>
              El portugués abre oportunidades académicas, profesionales,
              culturales y de viaje. Brasil es el corazón de nuestra historia,
              pero el idioma conecta con un mundo mucho más amplio.
            </p>
          </div>

          <div className="lusophone-grid">
            <article className="lusophone-card">
              <strong>BR</strong>
              <h3>Brasil</h3>

              <p>
                El mayor mercado de habla portuguesa y una potencia cultural,
                académica y empresarial.
              </p>
            </article>

            <article className="lusophone-card">
              <strong>NEG</strong>
              <h3>Trabajo</h3>

              <p>
                Portugués para empresas, profesionales y equipos que se conectan
                con Brasil.
              </p>
            </article>

            <article className="lusophone-card">
              <strong>EDU</strong>
              <h3>Estudio</h3>

              <p>
                Una herramienta para certificaciones, movilidad académica y
                oportunidades internacionales.
              </p>
            </article>

            <article className="lusophone-card">
              <strong>CUL</strong>
              <h3>Cultura</h3>

              <p>
                Un idioma para viajar, conversar, leer, cantar y vivir nuevas
                experiencias.
              </p>
            </article>
          </div>
        </section>

        <section className="courses-section" id="cursos">
          <div className="section-header">
            <h2>Cursos de portugués</h2>

            <p>
              Programas diseñados para empezar, avanzar rápido, certificar tu
              nivel o formar equipos que trabajan con Brasil.
            </p>
          </div>

          <div className="course-grid">
            <article className="course-card">
              <div className="course-img img-presencial"></div>

              <div className="course-content">
                <span className="tag">Presencial</span>
                <h3>Portugués presencial</h3>

                <p>
                  Clases en sede con acompañamiento, comunidad y experiencia
                  cultural IBRACO.
                </p>

                <a href="/cursos" className="btn btn-yellow">
                  Conocer programa
                </a>
              </div>
            </article>

            <article className="course-card">
              <div className="course-img img-virtual"></div>

              <div className="course-content">
                <span className="tag">Virtual</span>
                <h3>Portugués virtual</h3>

                <p>
                  Clases en vivo desde cualquier ciudad, con profesores y
                  metodología IBRACO.
                </p>

                <a href="/cursos" className="btn btn-yellow">
                  Ver horarios
                </a>
              </div>
            </article>

            <article className="course-card">
              <div className="course-img img-expresso"></div>

              <div className="course-content">
                <span className="tag">Intensivo</span>
                <h3>Curso Expresso</h3>

                <p>
                  Avanza más rápido con programas intensivos y
                  semi-intensivos.
                </p>

                <a href="/cursos" className="btn btn-yellow">
                  Ver oferta
                </a>
              </div>
            </article>

            <article className="course-card">
              <div className="course-img img-celpe"></div>

              <div className="course-content">
                <span className="tag">Certificación</span>
                <h3>Celpe-Bras</h3>

                <p>
                  Prepárate para certificar tu dominio del portugués con
                  acompañamiento especializado.
                </p>

                <a href="/cursos" className="btn btn-yellow">
                  Prepararme
                </a>
              </div>
            </article>

            <article className="course-card">
              <div className="course-img img-empresas"></div>

              <div className="course-content">
                <span className="tag">Empresas</span>
                <h3>Portugués corporativo</h3>

                <p>
                  Programas para equipos que trabajan con Brasil o quieren abrir
                  oportunidades regionales.
                </p>

                <a href="/empresas" className="btn btn-yellow">
                  Cotizar
                </a>
              </div>
            </article>

            <article className="course-card">
              <div className="course-img img-samba"></div>

              <div className="course-content">
                <span className="tag">Cultura</span>
                <h3>Samba</h3>

                <p>
                  Una experiencia cultural para vivir Brasil desde el ritmo, el
                  movimiento y la conversación.
                </p>

                <a href="/agenda-cultural" className="btn btn-yellow">
                  Ver experiencias
                </a>
              </div>
            </article>
          </div>

          <div className="section-action">
            <a href="/cursos" className="btn btn-primary">
              Ver todos los cursos
            </a>
          </div>
        </section>

        <section className="test-section" id="nivel">
          <div className="test-box">
            <div>
              <div className="eyebrow">
                <span className="dot"></span>
                Mide en qué nivel estás
              </div>

              <h2>¿Ya sabes portugués?</h2>

              <p>
                Presenta tu examen de nivel, encuentra el curso adecuado y
                agenda tu entrevista para iniciar el proceso de matrícula.
              </p>

              <a
                href="https://www.ibraco.org.co/courses/examen-de-nivelacion-ibraco/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Conocer la prueba
              </a>
            </div>

            <div className="test-card">
              <label htmlFor="level-name">Nombre</label>
              <input id="level-name" type="text" placeholder="Tu nombre" />

              <label htmlFor="level-country">País</label>
              <select id="level-country">
                <option>Colombia</option>
                <option>México</option>
                <option>Estados Unidos</option>
                <option>Otro país</option>
              </select>

              <label htmlFor="level-objective">Objetivo</label>
              <select id="level-objective">
                <option>Aprender desde cero</option>
                <option>Mejorar mi nivel</option>
                <option>Prepararme para Celpe-Bras</option>
                <option>Portugués para empresa</option>
                <option>Portugués para mi hijo(a)</option>
                <option>Viajar o estudiar en Brasil</option>
              </select>

              <a
                href="https://ibraco.landingpauta.com/producto/examen-de-nivelacion/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Comprar prueba
              </a>
            </div>
          </div>
        </section>

        <section className="culture-section" id="cultura">
          <div className="section-header">
            <h2>El idioma entra por la cultura</h2>

            <p>
              Este es el gran diferencial de IBRACO frente a una academia
              tradicional: el portugués se aprende viviéndolo.
            </p>
          </div>

          <div className="culture-grid">
            <div className="culture-lead">
              <h2>O Brasil é aqui.</h2>

              <p>
                La cultura no compite con los cursos: los hace más deseables,
                más memorables y más valiosos.
              </p>

              <a href="/cultura" className="btn btn-yellow">
                Explorar cultura
              </a>
            </div>

            <div className="culture-cards">
              <div className="culture-card c1">
                <h3>Música</h3>
                <span>Ritmo, escucha y expresión</span>
              </div>

              <div className="culture-card c2">
                <h3>Cine</h3>
                <span>Idioma en contexto real</span>
              </div>

              <div className="culture-card c3">
                <h3>Gastronomía</h3>
                <span>Experiencias y conversación</span>
              </div>

              <div className="culture-card c4">
                <h3>Arte</h3>
                <span>Creatividad y vocabulario</span>
              </div>

              <div className="culture-card c5">
                <h3>Literatura</h3>
                <span>Lectura y pensamiento</span>
              </div>

              <div className="culture-card c6">
                <h3>Viajes</h3>
                <span>Cuando el idioma empieza a vivirse</span>
              </div>
            </div>
          </div>

          <div className="section-action">
            <a href="/agenda-cultural" className="btn btn-primary">
              Ver agenda cultural
            </a>
          </div>
        </section>

        <section className="cycles-section" id="ciclos">
          <div className="section-header">
            <h2>Próximos ciclos abiertos</h2>

            <p>
              Inscríbete al curso que más se ajuste a tu horario, nivel y
              objetivo.
            </p>
          </div>

          <div className="cycle-grid">
            <article className="cycle-card">
              <span className="tag">Nuevo</span>
              <h3>Curso Expresso</h3>

              <p>Dos niveles en un mes. Ideal para avanzar rápido.</p>

              <div className="price">$1.842.000</div>

              <a
                href="https://ibraco.landingpauta.com/cursos/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                Matricularme
              </a>
            </article>

            <article className="cycle-card">
              <span className="tag">Intensivo</span>
              <h3>Intensivo</h3>

              <p>Sede Norte, Sede Centro o Virtual.</p>

              <div className="price">$1.364.000</div>

              <a
                href="https://ibraco.landingpauta.com/cursos/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                Matricularme
              </a>
            </article>

            <article className="cycle-card">
              <span className="tag">Nivelación</span>
              <h3>Examen de nivel</h3>

              <p>Identifica tu nivel y entra al curso adecuado.</p>

              <div className="price">$76.000</div>

              <a
                href="https://ibraco.landingpauta.com/producto/examen-de-nivelacion/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                Comprar prueba
              </a>
            </article>

            <article className="cycle-card">
              <span className="tag">Cultura</span>
              <h3>Curso de Samba</h3>

              <p>Una experiencia cultural para vivir Brasil desde el ritmo.</p>

              <div className="price">$160.000</div>

              <a
                href="https://ibraco.landingpauta.com/cursos/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                Reservar cupo
              </a>
            </article>
          </div>

          <div className="section-action">
            <a href="/cursos" className="btn btn-primary">
              Ver oferta completa
            </a>
          </div>
        </section>

        <section className="dual-section" id="ninos-viajes">
          <div className="section-header">
            <h2>Nuevas formas de vivir Brasil</h2>

            <p>
              IBRACO puede ampliar la experiencia sin perder foco: cursos
              primero, cultura como diferenciador.
            </p>
          </div>

          <div className="dual-grid">
            <article className="dual-card dual-ninos">
              <div>
                <span className="tag">Próximamente</span>
                <h2>IBRACO Niños</h2>
              </div>

              <p>
                Portugués para niños a través de juego, música, creatividad y
                cultura brasileña.
              </p>

              <a
                href="https://wa.me/573102412817"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                Quiero saber más
              </a>
            </article>

            <article className="dual-card dual-viajes red-overlay">
              <div>
                <span className="tag">Próximamente</span>
                <h2>IBRACO Viajes</h2>
              </div>

              <p>
                Experiencias culturales, académicas e inmersivas para viajar,
                estudiar y vivir Brasil.
              </p>

              <a
                href="https://wa.me/573102412817"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                Quiero saber más
              </a>
            </article>
          </div>
        </section>

        <section className="final-cta">
          <h2>O BRASIL É AQUI.</h2>

          <p>
            Empieza hoy a aprender portugués con IBRACO y descubre Brasil a
            través de su idioma, su cultura y su comunidad.
          </p>

          <a href="/cursos" className="btn btn-yellow">
            Ver cursos
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
            Instituto de Cultura Brasil Colombia. Cursos de portugués, cultura
            brasileña, Celpe-Bras, empresas, niños, viajes, Alumni e
            internacionalización.
          </p>
        </div>

        <div>
          <h4>Estudia</h4>
          <a href="/cursos">Cursos</a>
          <a href="/sedes">Sedes</a>
          <a href="/empresas">Empresas</a>
          <a href="/cursos">Celpe-Bras</a>
        </div>

        <div>
          <h4>Vive Brasil</h4>
          <a href="/cultura">Cultura</a>
          <a href="/agenda-cultural">Agenda cultural</a>
          <a href="/alumni">Alumni</a>
          <a href="/blog">Blog</a>
        </div>

        <div>
          <h4>Conecta</h4>
          <a href="#nivel">Mide tu nivel</a>
          <a href="/blog/travessias">Travessias</a>
          <a
            href="https://wa.me/573102412817"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <a
            href="https://ibraco.landingpauta.com/cursos/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Matrícula
          </a>
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