import LevelConsultation from "./level-consultation";
import homeStyles from "../home.module.css";
import { cssImage, type PageContent } from "../lib/site-content-schema";
export default function HomeContent({
  content,
  seoH1,
}: {
  content: PageContent;
  seoH1: string | null;
}) {
  return (
    <>
      <main className={homeStyles.home}>
        <section className="hero" id="inscripcion">
          <div>
            <div className="eyebrow">
              <span className="dot"></span>
              {content["hero.text_1"]}
            </div>

            <h1
              style={{
                fontSize: "clamp(30px, 3.2vw, 48px)",
                lineHeight: 1.14,
                letterSpacing: "-0.045em",
                textTransform: "none",
                fontWeight: 600,
                overflowWrap: "break-word",
              }}
            >
              {seoH1 || (
                <>
                  Aprende portugués. <span>O Brasil é aqui.</span>
                </>
              )}
            </h1>

            <p className="hero-copy">{content["hero.textarea_1"]}</p>

            <div className="hero-actions">
              <a href={content["hero.link_1"]} className="btn btn-primary">
                {content["hero.text_2"]}
              </a>

              <a href={content["hero.link_2"]} className="btn btn-secondary">
                {content["hero.text_3"]}
              </a>
            </div>

            <div className="trust-row">
              <span>{content["hero.text_4"]}</span>
              <span>{content["hero.text_5"]}</span>
              <span>{content["hero.text_6"]}</span>
            </div>
          </div>

          <div className="hero-panel">
            <div
              className="hero-photo"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(0,138,75,.77), rgba(0,102,179,.68)), " +
                  cssImage(content["hero.image_1"]),
              }}
            >
              <div className="floating-card">
                <h3>{content["hero.text_7"]}</h3>

                <p>{content["hero.textarea_2"]}</p>
              </div>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <strong>{content["hero.text_8"]}</strong>
                <small>{content["hero.text_9"]}</small>
              </div>

              <div className="hero-stat">
                <strong>{content["hero.text_10"]}</strong>
                <small>{content["hero.text_11"]}</small>
              </div>

              <div className="hero-stat">
                <strong>{content["hero.text_12"]}</strong>
                <small>{content["hero.text_13"]}</small>
              </div>
            </div>
          </div>
        </section>

        <section className="quick-path">
          <h2>{content["quick-path.text_1"]}</h2>

          <a href={content["quick-path.link_1"]} className="path-item">
            <strong>{content["quick-path.text_2"]}</strong>
            <span>{content["quick-path.text_3"]}</span>
          </a>

          <a href={content["quick-path.link_2"]} className="path-item">
            <strong>{content["quick-path.text_4"]}</strong>
            <span>{content["quick-path.text_5"]}</span>
          </a>

          <a href={content["quick-path.link_3"]} className="path-item">
            <strong>{content["quick-path.text_6"]}</strong>
            <span>{content["quick-path.text_7"]}</span>
          </a>

          <a href={content["quick-path.link_4"]} className="path-item">
            <strong>{content["quick-path.text_8"]}</strong>
            <span>{content["quick-path.text_9"]}</span>
          </a>
        </section>

        <section className="campus-section" id="sedes">
          <div className="section-header">
            <h2>{content["campus-section.text_1"]}</h2>

            <p>{content["campus-section.textarea_1"]}</p>
          </div>

          <div className="campus-grid">
            <article
              className="campus-card campus-norte"
              style={{
                backgroundImage:
                  "" + cssImage(content["campus-section.image_1"]),
              }}
            >
              <div>
                <span className="tag">{content["campus-section.text_2"]}</span>
                <h3>{content["campus-section.text_3"]}</h3>
              </div>

              <p>{content["campus-section.textarea_2"]}</p>

              <a
                href={content["campus-section.link_1"]}
                className="btn btn-yellow"
              >
                {content["campus-section.text_4"]}
              </a>
            </article>

            <article
              className="campus-card campus-centro"
              style={{
                backgroundImage:
                  "" + cssImage(content["campus-section.image_2"]),
              }}
            >
              <div>
                <span className="tag">{content["campus-section.text_5"]}</span>
                <h3>{content["campus-section.text_6"]}</h3>
              </div>

              <p>{content["campus-section.textarea_3"]}</p>

              <a
                href={content["campus-section.link_2"]}
                className="btn btn-yellow"
              >
                {content["campus-section.text_7"]}
              </a>
            </article>

            <article
              className="campus-card campus-virtual virtual"
              style={{
                backgroundImage:
                  "" + cssImage(content["campus-section.image_3"]),
              }}
            >
              <div>
                <span className="tag">{content["campus-section.text_8"]}</span>
                <h3>{content["campus-section.text_9"]}</h3>
              </div>

              <p>{content["campus-section.textarea_4"]}</p>

              <a
                href={content["campus-section.link_3"]}
                className="btn btn-yellow"
              >
                {content["campus-section.text_10"]}
              </a>
            </article>
          </div>

          <div className="section-action">
            <a
              href={content["campus-section.link_4"]}
              className="btn btn-primary"
            >
              {content["campus-section.text_11"]}
            </a>
          </div>
        </section>

        <section className="lusophone-section" id="mundo-lusofono">
          <div className="section-header">
            <h2>{content["lusophone-section.text_1"]}</h2>

            <p>{content["lusophone-section.textarea_1"]}</p>
          </div>

          <div className="lusophone-grid">
            <article className="lusophone-card">
              <strong>{content["lusophone-section.text_2"]}</strong>
              <h3>{content["lusophone-section.text_3"]}</h3>

              <p>{content["lusophone-section.textarea_2"]}</p>
            </article>

            <article className="lusophone-card">
              <strong>{content["lusophone-section.text_4"]}</strong>
              <h3>{content["lusophone-section.text_5"]}</h3>

              <p>{content["lusophone-section.textarea_3"]}</p>
            </article>

            <article className="lusophone-card">
              <strong>{content["lusophone-section.text_6"]}</strong>
              <h3>{content["lusophone-section.text_7"]}</h3>

              <p>{content["lusophone-section.textarea_4"]}</p>
            </article>

            <article className="lusophone-card">
              <strong>{content["lusophone-section.text_8"]}</strong>
              <h3>{content["lusophone-section.text_9"]}</h3>

              <p>{content["lusophone-section.textarea_5"]}</p>
            </article>
          </div>
        </section>

        <section className="courses-section" id="cursos">
          <div className="section-header">
            <h2>{content["courses-section.text_1"]}</h2>

            <p>{content["courses-section.textarea_1"]}</p>
          </div>

          <div className="course-grid">
            <article className="course-card">
              <div
                className="course-img img-presencial"
                style={{
                  backgroundImage:
                    "" + cssImage(content["courses-section.image_1"]),
                }}
              ></div>

              <div className="course-content">
                <span className="tag">{content["courses-section.text_2"]}</span>
                <h3>{content["courses-section.text_3"]}</h3>

                <p>{content["courses-section.textarea_2"]}</p>

                <a
                  href={content["courses-section.link_1"]}
                  className="btn btn-yellow"
                >
                  {content["courses-section.text_4"]}
                </a>
              </div>
            </article>

            <article className="course-card">
              <div
                className="course-img img-virtual"
                style={{
                  backgroundImage:
                    "" + cssImage(content["courses-section.image_2"]),
                }}
              ></div>

              <div className="course-content">
                <span className="tag">{content["courses-section.text_5"]}</span>
                <h3>{content["courses-section.text_6"]}</h3>

                <p>{content["courses-section.textarea_3"]}</p>

                <a
                  href={content["courses-section.link_2"]}
                  className="btn btn-yellow"
                >
                  {content["courses-section.text_7"]}
                </a>
              </div>
            </article>

            <article className="course-card">
              <div
                className="course-img img-expresso"
                style={{
                  backgroundImage:
                    "" + cssImage(content["courses-section.image_3"]),
                }}
              ></div>

              <div className="course-content">
                <span className="tag">{content["courses-section.text_8"]}</span>
                <h3>{content["courses-section.text_9"]}</h3>

                <p>{content["courses-section.textarea_4"]}</p>

                <a
                  href={content["courses-section.link_3"]}
                  className="btn btn-yellow"
                >
                  {content["courses-section.text_10"]}
                </a>
              </div>
            </article>

            <article className="course-card">
              <div
                className="course-img img-celpe"
                style={{
                  backgroundImage:
                    "" + cssImage(content["courses-section.image_4"]),
                }}
              ></div>

              <div className="course-content">
                <span className="tag">
                  {content["courses-section.text_11"]}
                </span>
                <h3>{content["courses-section.text_12"]}</h3>

                <p>{content["courses-section.textarea_5"]}</p>

                <a
                  href={content["courses-section.link_4"]}
                  className="btn btn-yellow"
                >
                  {content["courses-section.text_13"]}
                </a>
              </div>
            </article>

            <article className="course-card">
              <div
                className="course-img img-empresas"
                style={{
                  backgroundImage:
                    "" + cssImage(content["courses-section.image_5"]),
                }}
              ></div>

              <div className="course-content">
                <span className="tag">
                  {content["courses-section.text_14"]}
                </span>
                <h3>{content["courses-section.text_15"]}</h3>

                <p>{content["courses-section.textarea_6"]}</p>

                <a
                  href={content["courses-section.link_5"]}
                  className="btn btn-yellow"
                >
                  {content["courses-section.text_16"]}
                </a>
              </div>
            </article>

            <article className="course-card">
              <div
                className="course-img img-samba"
                style={{
                  backgroundImage:
                    "" + cssImage(content["courses-section.image_6"]),
                }}
              ></div>

              <div className="course-content">
                <span className="tag">
                  {content["courses-section.text_17"]}
                </span>
                <h3>{content["courses-section.text_18"]}</h3>

                <p>{content["courses-section.textarea_7"]}</p>

                <a
                  href={content["courses-section.link_6"]}
                  className="btn btn-yellow"
                >
                  {content["courses-section.text_19"]}
                </a>
              </div>
            </article>
          </div>

          <div className="section-action">
            <a
              href={content["courses-section.link_7"]}
              className="btn btn-primary"
            >
              {content["courses-section.text_20"]}
            </a>
          </div>
        </section>

        <section className="test-section" id="nivel">
          <div className="test-box">
            <div>
              <div className="eyebrow">
                <span className="dot"></span>
                {content["test-section.text_1"]}
              </div>

              <h2>{content["test-section.text_2"]}</h2>

              <p>{content["test-section.textarea_1"]}</p>

              <a
                href={content["test-section.link_1"]}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                {content["test-section.text_3"]}
              </a>
            </div>

            <LevelConsultation />
          </div>
        </section>

        <section className="culture-section" id="cultura">
          <div className="section-header">
            <h2>{content["culture-section.text_1"]}</h2>

            <p>{content["culture-section.textarea_1"]}</p>
          </div>

          <div className="culture-grid">
            <div className="culture-lead">
              <h2>{content["culture-section.text_2"]}</h2>

              <p>{content["culture-section.textarea_2"]}</p>

              <a
                href={content["culture-section.link_1"]}
                className="btn btn-yellow"
              >
                {content["culture-section.text_3"]}
              </a>
            </div>

            <div className="culture-cards">
              <a
                href={content["culture-section.link_2"]}
                className="culture-card c1"
                style={{
                  backgroundImage:
                    "" + cssImage(content["culture-section.image_1"]),
                }}
              >
                <h3>{content["culture-section.text_4"]}</h3>
                <span>{content["culture-section.text_5"]}</span>
              </a>

              <a
                href={content["culture-section.link_3"]}
                className="culture-card c2"
                style={{
                  backgroundImage:
                    "" + cssImage(content["culture-section.image_2"]),
                }}
              >
                <h3>{content["culture-section.text_6"]}</h3>
                <span>{content["culture-section.text_7"]}</span>
              </a>

              <a
                href={content["culture-section.link_4"]}
                className="culture-card c3"
                style={{
                  backgroundImage:
                    "" + cssImage(content["culture-section.image_3"]),
                }}
              >
                <h3>{content["culture-section.text_8"]}</h3>
                <span>{content["culture-section.text_9"]}</span>
              </a>

              <a
                href={content["culture-section.link_5"]}
                className="culture-card c4"
                style={{
                  backgroundImage:
                    "" + cssImage(content["culture-section.image_4"]),
                }}
              >
                <h3>{content["culture-section.text_10"]}</h3>
                <span>{content["culture-section.text_11"]}</span>
              </a>

              <a
                href={content["culture-section.link_6"]}
                className="culture-card c5"
                style={{
                  backgroundImage:
                    "" + cssImage(content["culture-section.image_5"]),
                }}
              >
                <h3>{content["culture-section.text_12"]}</h3>
                <span>{content["culture-section.text_13"]}</span>
              </a>

              <a
                href={content["culture-section.link_7"]}
                className="culture-card c6"
                style={{
                  backgroundImage:
                    "" + cssImage(content["culture-section.image_6"]),
                }}
              >
                <h3>{content["culture-section.text_14"]}</h3>
                <span>{content["culture-section.text_15"]}</span>
              </a>
            </div>
          </div>

          <div className="section-action">
            <a
              href={content["culture-section.link_8"]}
              className="btn btn-primary"
            >
              {content["culture-section.text_16"]}
            </a>
          </div>
        </section>

        <section className="cycles-section" id="ciclos">
          <div className="section-header">
            <h2>{content["cycles-section.text_1"]}</h2>

            <p>{content["cycles-section.textarea_1"]}</p>
          </div>

          <div className="cycle-grid">
            <article className="cycle-card">
              <span className="tag">{content["cycles-section.text_2"]}</span>
              <h3>{content["cycles-section.text_3"]}</h3>

              <p>{content["cycles-section.textarea_2"]}</p>

              <div className="qa-summary">
                {content["cycles-section.text_4"]}
              </div>

              <a
                href={content["cycles-section.link_1"]}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                {content["cycles-section.text_5"]}
              </a>
            </article>

            <article className="cycle-card">
              <span className="tag">{content["cycles-section.text_6"]}</span>
              <h3>{content["cycles-section.text_7"]}</h3>

              <p>{content["cycles-section.textarea_3"]}</p>

              <div className="qa-summary">
                {content["cycles-section.text_8"]}
              </div>

              <a
                href={content["cycles-section.link_2"]}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                {content["cycles-section.text_9"]}
              </a>
            </article>

            <article className="cycle-card">
              <span className="tag">{content["cycles-section.text_10"]}</span>
              <h3>{content["cycles-section.text_11"]}</h3>

              <p>{content["cycles-section.textarea_4"]}</p>

              <div className="qa-summary">
                {content["cycles-section.text_12"]}
              </div>

              <a
                href={content["cycles-section.link_3"]}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                {content["cycles-section.text_13"]}
              </a>
            </article>

            <article className="cycle-card">
              <span className="tag">{content["cycles-section.text_14"]}</span>
              <h3>{content["cycles-section.text_15"]}</h3>

              <p>{content["cycles-section.textarea_5"]}</p>

              <div className="qa-summary">
                {content["cycles-section.text_16"]}
              </div>

              <a
                href={content["cycles-section.link_4"]}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                {content["cycles-section.text_17"]}
              </a>
            </article>
          </div>

          <div className="section-action">
            <a
              href={content["cycles-section.link_5"]}
              className="btn btn-primary"
            >
              {content["cycles-section.text_18"]}
            </a>
          </div>
        </section>

        <section className="dual-section" id="ninos-viajes">
          <div className="section-header">
            <h2>{content["dual-section.text_1"]}</h2>

            <p>{content["dual-section.textarea_1"]}</p>
          </div>

          <div className="dual-grid">
            <article
              className="dual-card dual-ninos"
              style={{
                backgroundImage: "" + cssImage(content["dual-section.image_1"]),
              }}
            >
              <div>
                <span className="tag">{content["dual-section.text_2"]}</span>
                <h2>{content["dual-section.text_3"]}</h2>
              </div>

              <p>{content["dual-section.textarea_2"]}</p>

              <a
                href={content["dual-section.link_1"]}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                {content["dual-section.text_4"]}
              </a>
            </article>

            <article
              className="dual-card dual-viajes red-overlay"
              style={{
                backgroundImage: "" + cssImage(content["dual-section.image_2"]),
              }}
            >
              <div>
                <span className="tag">{content["dual-section.text_5"]}</span>
                <h2>{content["dual-section.text_6"]}</h2>
              </div>

              <p>{content["dual-section.textarea_3"]}</p>

              <a
                href={content["dual-section.link_2"]}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-yellow"
              >
                {content["dual-section.text_7"]}
              </a>
            </article>
          </div>
        </section>

        <section className="final-cta">
          <h2>{content["final-cta.text_1"]}</h2>

          <p>{content["final-cta.textarea_1"]}</p>

          <a href={content["final-cta.link_1"]} className="btn btn-yellow">
            {content["final-cta.text_2"]}
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
          <a href="/cursos/programas/celpe-bras">Celpe-Bras</a>
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
            href="https://wa.me/573125841068"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <a
            href="/cursos#cursos-disponibles"
            target="_blank"
            rel="noopener noreferrer"
          >
            Matrícula
          </a>
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
