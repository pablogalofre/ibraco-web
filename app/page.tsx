export default function Home() {
  return (
    <>
<header className="navbar">
    <a href="#" className="logo-box" aria-label="IBRACO inicio">
      <img src="/assets/logos/logo-ibraco.png" alt="IBRACO Instituto Brasil Colombia" />
    </a>

    <nav className="nav-links" aria-label="Navegación principal">
      <a href="#sedes">Sedes</a>
      <a href="#cursos">Cursos</a>
      <a href="#ciclos">Próximos ciclos</a>
      <a href="#nivel">Prueba de nivel</a>
      <a href="#cultura">Cultura</a>
      <a href="#ninos-viajes">Niños y viajes</a>
      <a href="#inscripcion" className="nav-cta">Inscribirme</a>
    </nav>
  </header>

  <main>

    <section className="hero" id="inscripcion">
      <div>
        <div className="eyebrow"><span className="dot"></span> Instituto Brasil Colombia</div>
        <h1>Aprenda português. <span>O mundo lusófono é aqui.</span></h1>
        <p className="hero-copy">
          Cursos de portugués en Sede Norte, Sede Centro y modalidad Virtual, con el diferencial de IBRACO: aprender el idioma a través de la cultura y conectar con Brasil, Portugal y el mundo lusófono.
        </p>

        <div className="hero-actions">
          <a href="#cursos" className="btn btn-primary">Ver cursos</a>
          <a href="#nivel" className="btn btn-secondary">Prueba de nivel</a>
          <a href="#ciclos" className="btn btn-secondary">Inscribirme ahora</a>
        </div>

        <div className="trust-row">
          <span>✓ Sede Norte</span>
          <span>✓ Sede Centro</span>
          <span>✓ Modalidad Virtual</span>
        </div>
      </div>

      <div className="hero-panel">
        <div className="hero-photo">
          <div className="eyebrow"><span className="dot"></span> Cursos · Cultura · Comunidad</div>
          <div className="floating-card">
            <h3>Portugués que se vive.</h3>
            <p>El diferencial de IBRACO: aprender el idioma por medio de música, cine, conversación, literatura, viajes y cultura real del mundo lusófono.</p>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <strong>700+</strong>
            <small>Estudiantes al año</small>
          </div>
          <div className="hero-stat">
            <strong>12K+</strong>
            <small>Visitas mensuales</small>
          </div>
          <div className="hero-stat">
            <strong>LATAM</strong>
            <small>Mundo lusófono</small>
          </div>
        </div>
      </div>
    </section>

    <section className="quick-path">
      <h2>Estudie donde mejor le quede</h2>
      <div className="path-item">
        <strong>Sede Norte</strong>
        <span>Experiencia presencial IBRACO</span>
      </div>
      <div className="path-item">
        <strong>Sede Centro</strong>
        <span>La sede histórica del instituto</span>
      </div>
      <div className="path-item">
        <strong>Virtual</strong>
        <span>Clases en vivo desde cualquier ciudad</span>
      </div>
      <div className="path-item">
        <strong>Nivelación</strong>
        <span>Encuentre el curso adecuado</span>
      </div>
    </section>

    <section className="campus-section" id="sedes">
      <div className="section-header">
        <h2>Sede Norte, Sede Centro y Virtual</h2>
        <p>IBRACO mantiene la fuerza de la experiencia presencial y abre una ruta virtual para estudiantes de cualquier ciudad.</p>
      </div>

      <div className="campus-grid">
        <article className="campus-card campus-norte">
          <div>
            <span className="tag">Presencial</span>
            <h3>Sede Norte</h3>
          </div>
          <p>Clases presenciales, comunidad, profesores y cultura brasileña en un entorno cercano y vivo.</p>
          <a href="#ciclos" className="btn btn-yellow">Ver cursos Norte</a>
        </article>

        <article className="campus-card campus-centro">
          <div>
            <span className="tag">Presencial</span>
            <h3>Sede Centro</h3>
          </div>
          <p>La sede histórica de IBRACO: tradición, cultura y aprendizaje presencial en el corazón de Bogotá.</p>
          <a href="#ciclos" className="btn btn-yellow">Ver cursos Centro</a>
        </article>

        <article className="campus-card campus-virtual virtual">
          <div>
            <span className="tag">Virtual</span>
            <h3>Virtual</h3>
          </div>
          <p>Aprenda portugués en vivo desde cualquier ciudad con metodología, profesores y experiencia IBRACO.</p>
          <a href="#ciclos" className="btn btn-yellow">Ver cursos virtuales</a>
        </article>
      </div>
    </section>


    <section className="lusophone-section" id="mundo-lusofono">
      <div className="section-header">
        <h2>¿Por qué aprender portugués hoy?</h2>
        <p>El portugués abre oportunidades académicas, profesionales, culturales y de viaje en América, Europa, África y Asia.</p>
      </div>

      <div className="lusophone-grid">
        <article className="lusophone-card"><strong>🇧🇷</strong><h3>Brasil</h3><p>El mayor mercado de habla portuguesa y una potencia cultural, académica y empresarial.</p></article>
        <article className="lusophone-card"><strong>🇵🇹</strong><h3>Portugal</h3><p>Estudios, ciudadanía, trabajo, movilidad europea y oportunidades para familias y profesionales.</p></article>
        <article className="lusophone-card"><strong>🌍</strong><h3>África lusófona</h3><p>Angola, Mozambique, Cabo Verde, Guinea-Bissau y Santo Tomé conectan idioma, cultura y negocios.</p></article>
        <article className="lusophone-card"><strong>🌎</strong><h3>Mundo global</h3><p>Portugués para estudiar, trabajar, viajar, certificarte y participar en una comunidad internacional.</p></article>
      </div>
    </section>

    <section className="courses-section" id="cursos">
      <div className="section-header">
        <h2>Cursos de portugués</h2>
        <p>Programas diseñados para aprender, avanzar rápido, certificar su nivel o formar equipos que trabajan con Brasil.</p>
      </div>

      <div className="course-grid">
        

        <article className="course-card">
          <div className="course-img img-expresso"></div>
          <div className="course-content">
            <span className="tag">Intensivo</span>
            <h3>Curso Expresso</h3>
            <p>Avance más rápido con programas intensivos y semi-intensivos.</p>
            <a href="#ciclos" className="btn btn-yellow">Ver oferta</a>
          </div>
        </article>
<article className="course-card">
          <div className="course-img img-presencial"></div>
          <div className="course-content">
            <span className="tag">Presencial</span>
            <h3>Portugués presencial</h3>
            <p>Clases en sede con acompañamiento, comunidad y experiencia cultural IBRACO.</p>
            <a href="#ciclos" className="btn btn-yellow">Ver ciclos</a>
          </div>
        </article>


        <article className="course-card">
          <div className="course-img img-virtual"></div>
          <div className="course-content">
            <span className="tag">Virtual</span>
            <h3>Portugués virtual</h3>
            <p>Clases en vivo desde cualquier ciudad, con profesores y metodología IBRACO.</p>
            <a href="#ciclos" className="btn btn-yellow">Ver horarios</a>
          </div>
        </article>


        <article className="course-card">
          <div className="course-img img-celpe"></div>
          <div className="course-content">
            <span className="tag">Certificación</span>
            <h3>Celpe-Bras</h3>
            <p>Preparación para certificar su dominio del portugués con acompañamiento especializado.</p>
            <a href="#nivel" className="btn btn-yellow">Prepararme</a>
          </div>
        </article>


        <article className="course-card">
          <div className="course-img img-empresas"></div>
          <div className="course-content">
            <span className="tag">Empresas</span>
            <h3>Portugués corporativo</h3>
            <p>Programas para equipos que trabajan con Brasil o quieren abrir oportunidades regionales.</p>
            <a href="#inscripcion" className="btn btn-yellow">Cotizar</a>
          </div>
        </article>


        <article className="course-card">
          <div className="course-img img-ninos"></div>
          <div className="course-content">
            <span className="tag">Niños</span>
            <h3>IBRACO Niños</h3>
            <p>Portugués para niños a través de juego, música, creatividad y cultura brasileña.</p>
            <a href="#ninos-viajes" className="btn btn-yellow">Conocer</a>
          </div>
        </article>
      </div>
    </section>

    <section className="test-section" id="nivel">
      <div className="test-box">
        <div>
          <div className="eyebrow"><span className="dot"></span> Prueba de nivel</div>
          <h2>¿Ya sabe portugués?</h2>
          <p>
            Descubra su nivel y encuentre el curso adecuado. Este será uno de los principales caminos para orientar estudiantes e iniciar el proceso de matrícula.
          </p>
          <a href="#cursos" className="btn btn-primary">Ver cursos recomendados</a>
        </div>

        <div className="test-card">
          <label>Nombre</label>
          <input type="text" placeholder="Su nombre" />

          <label>País</label>
          <select>
            <option>Colombia</option>
            <option>México</option>
            <option>Estados Unidos</option>
            <option>Otro país</option>
          </select>

          <label>Objetivo</label>
          <select>
            <option>Aprender desde cero</option>
            <option>Mejorar mi nivel</option>
            <option>Prepararme para Celpe-Bras</option>
            <option>Portugués para empresa</option>
            <option>Portugués para mi hijo(a)</option>
            <option>Viajar o estudiar en Brasil</option>
          </select>

          <a href="#" className="btn btn-primary">Iniciar prueba</a>
        </div>
      </div>
    </section>

    <section className="why-section">
      <div className="section-header">
        <h2>Aprender portugués con cultura cambia la experiencia</h2>
        <p>IBRACO enseña portugués con una experiencia más completa: idioma, conversación, cultura, comunidad y conexión real con Brasil.</p>
      </div>

      <div className="why-grid">
        <article className="why-card">
          <div className="icon">🇧🇷</div>
          <h3>Cultura como método</h3>
          <p>Música, cine, literatura, gastronomía y conversación real alrededor del idioma.</p>
        </article>

        <article className="why-card">
          <div className="icon">🎓</div>
          <h3>Autoridad institucional</h3>
          <p>Una entidad cultural independiente con misión Brasil-Colombia y vocación educativa.</p>
        </article>

        <article className="why-card">
          <div className="icon">💬</div>
          <h3>Portugués práctico</h3>
          <p>Formación orientada a hablar, entender y usar el idioma en contextos reales.</p>
        </article>

        <article className="why-card">
          <div className="icon">🌎</div>
          <h3>Visión global</h3>
          <p>La modalidad virtual permite llevar la experiencia IBRACO a nuevos mercados.</p>
        </article>
      </div>
    </section>

    <section className="culture-section" id="cultura">
      <div className="section-header">
        <h2>El idioma entra por la cultura</h2>
        <p>Este es el gran diferencial de IBRACO frente a una academia tradicional: el portugués se aprende viviéndolo.</p>
      </div>

      <div className="culture-grid">
        <div className="culture-lead">
          <h2>O Brasil é aqui.</h2>
          <p>
            La cultura no compite con los cursos: los hace más deseables, más memorables y más valiosos.
          </p>
          <a href="#cursos" className="btn btn-yellow">Aprender portugués</a>
        </div>

        <div className="culture-cards">
          <div className="culture-card c1"><h3>Música</h3><span>Ritmo, escucha y expresión</span></div>
          <div className="culture-card c2"><h3>Cine</h3><span>Idioma en contexto real</span></div>
          <div className="culture-card c3"><h3>Gastronomía</h3><span>Experiencias y conversación</span></div>
          <div className="culture-card c4"><h3>Arte</h3><span>Creatividad y vocabulario</span></div>
          <div className="culture-card c5"><h3>Literatura</h3><span>Lectura y pensamiento</span></div>
          <div className="culture-card c6"><h3>Viajes</h3><span>Mundo lusófono</span></div>
        </div>
      </div>
    </section>

    <section className="cycles-section" id="ciclos">
      <div className="section-header">
        <h2>Próximos ciclos abiertos</h2>
        <p>Inscríbase al curso que más se ajuste a su horario, nivel y objetivo.</p>
      </div>

      <div className="cycle-grid">
        <article className="cycle-card">
          <span className="tag">Nuevo</span>
          <h3>Curso Expresso</h3>
          <p>2 niveles en 1 mes. Ideal para avanzar rápido durante vacaciones.</p>
          <div className="price">$1.842.000</div>
          <a href="#" className="btn btn-yellow">Inscribirme</a>
        </article>

        <article className="cycle-card">
          <span className="tag">Intensivo</span>
          <h3>Intensivo</h3>
          <p>Sede Norte, Sede Centro o Virtual. Inicio próximo ciclo.</p>
          <div className="price">$1.364.000</div>
          <a href="#" className="btn btn-yellow">Inscribirme</a>
        </article>

        <article className="cycle-card">
          <span className="tag">Nivelación</span>
          <h3>Examen de nivel</h3>
          <p>Identifique su nivel y entre al curso adecuado.</p>
          <div className="price">$76.000</div>
          <a href="#" className="btn btn-yellow">Presentar examen</a>
        </article>

        <article className="cycle-card">
          <span className="tag">Cultura</span>
          <h3>Curso de Samba</h3>
          <p>Una experiencia cultural para vivir Brasil desde el ritmo.</p>
          <div className="price">$160.000</div>
          <a href="#" className="btn btn-yellow">Reservar cupo</a>
        </article>
      </div>
    </section>

    <section className="dual-section" id="ninos-viajes">
      <div className="section-header">
        <h2>Nuevas formas de vivir Brasil</h2>
        <p>IBRACO puede ampliar la experiencia sin perder foco: cursos primero, cultura como diferenciador.</p>
      </div>

      <div className="dual-grid">
        <article className="dual-card dual-ninos">
          <div>
            <span className="tag">Niños</span>
            <h2>IBRACO Niños</h2>
          </div>
          <p>Portugués para niños a través de juego, música, creatividad y cultura brasileña.</p>
          <a href="#" className="btn btn-yellow">Conocer programa</a>
        </article>

        <article className="dual-card dual-viajes red-overlay">
          <div>
            <span className="tag">Experiencias</span>
            <h2>IBRACO Viajes</h2>
          </div>
          <p>Experiencias culturales, académicas e inmersivas para viajar, estudiar y vivir Brasil.</p>
          <a href="#" className="btn btn-yellow">Explorar viajes</a>
        </article>
      </div>
    </section>

    <section className="alumni-section" id="alumni">
      <div className="alumni-box">
        <div className="alumni-content">
          <span className="alumni-tag">IBRACO Alumni</span>
          <h2>La comunidad no termina cuando termina el curso.</h2>
          <p>
            Alumni fortalece la relación con egresados y convierte la experiencia IBRACO en una red activa de cultura, oportunidades y pertenencia.
          </p>
          <a href="#" className="btn btn-yellow">Conocer Alumni</a>
        </div>

        <div className="alumni-benefits">
          <article className="benefit">
            <div className="benefit-icon">🎓</div>
            <h4>Comunidad</h4>
            <p>Una red de personas que aprendieron portugués y conectan con Brasil.</p>
          </article>

          <article className="benefit">
            <div className="benefit-icon">🤝</div>
            <h4>Networking</h4>
            <p>Conexiones Brasil-Colombia entre egresados, aliados y empresas.</p>
          </article>

          <article className="benefit">
            <div className="benefit-icon">🎟️</div>
            <h4>Eventos</h4>
            <p>Acceso a agenda cultural, encuentros y experiencias especiales.</p>
          </article>

          <article className="benefit">
            <div className="benefit-icon">🌎</div>
            <h4>Red global</h4>
            <p>Una comunidad preparada para crecer en Colombia y Latinoamérica.</p>
          </article>
        </div>
      </div>
    </section>

    <section className="final-cta">
      <h2>O BRASIL É AQUI.</h2>
      <p>
        Empiece hoy a aprender portugués con IBRACO y descubra Brasil a través de su idioma, su cultura y su comunidad.
      </p>
      <a href="#cursos" className="btn btn-yellow">Ver cursos</a>
    </section>

  </main>

  <footer>
    <div className="footer-brand">
      <img src="/assets/logos/logo-ibraco.png" alt="IBRACO Instituto Brasil Colombia" />
      <p>Instituto Brasil Colombia. Cursos de portugués, cultura brasileña, Celpe-Bras, empresas, niños, viajes, Alumni e internacionalización.</p>
    </div>

    <div>
      <h4>Cursos</h4>
      <a href="#sedes">Sede Norte</a>
      <a href="#sedes">Sede Centro</a>
      <a href="#sedes">Virtual</a>
      <a href="#cursos">Empresas</a>
      <a href="#cursos">Celpe-Bras</a>
    </div>

    <div>
      <h4>Experiencia</h4>
      <a href="#nivel">Prueba de nivel</a>
      <a href="#cultura">Cultura brasileña</a>
      <a href="#ninos-viajes">IBRACO Niños</a>
      <a href="#ninos-viajes">IBRACO Viajes</a>
    </div>

    <div>
      <h4>Comunidad</h4>
      <a href="#alumni">Alumni</a>
      <a href="#ciclos">Próximos cursos</a>
      <a href="#">WhatsApp</a>
      <a href="#">Inscripción</a>
    </div>
  </footer>

  <a className="whatsapp-float" href="https://wa.me/573102412817" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp IBRACO">☘</a>
    </>
  );
}
