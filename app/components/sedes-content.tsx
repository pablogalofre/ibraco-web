import { cssImage, type PageContent } from "../lib/site-content-schema";
export default function SedesContent({ content }: { content: PageContent }) {
  return (
    <>
      <main className="inner-page">
        <section className="inner-hero">
          <div className="eyebrow">
            <span className="dot"></span>
            {content["inner-hero.text_1"]}
          </div>

          <h1>{content["inner-hero.text_2"]}</h1>

          <p>{content["inner-hero.textarea_1"]}</p>

          <a href={content["inner-hero.link_1"]} className="btn btn-primary">
            {content["inner-hero.text_3"]}
          </a>
        </section>

        <section className="inner-grid">
          <article className="inner-card">
            {content["inner-grid.image_1"] && (
              <img
                src={content["inner-grid.image_1"]}
                alt=""
                style={{
                  width: "100%",
                  height: 190,
                  objectFit: "cover",
                  borderRadius: 16,
                  marginBottom: 20,
                }}
              />
            )}
            <span>{content["inner-grid.text_1"]}</span>
            <h2>{content["inner-grid.text_2"]}</h2>
            <p>{content["inner-grid.textarea_1"]}</p>
            <a href={content["inner-grid.link_1"]} className="text-link">
              {content["inner-grid.text_3"]}
            </a>
          </article>

          <article className="inner-card">
            {content["inner-grid.image_2"] && (
              <img
                src={content["inner-grid.image_2"]}
                alt=""
                style={{
                  width: "100%",
                  height: 190,
                  objectFit: "cover",
                  borderRadius: 16,
                  marginBottom: 20,
                }}
              />
            )}
            <span>{content["inner-grid.text_4"]}</span>
            <h2>{content["inner-grid.text_5"]}</h2>
            <p>{content["inner-grid.textarea_2"]}</p>
            <a href={content["inner-grid.link_2"]} className="text-link">
              {content["inner-grid.text_6"]}
            </a>
          </article>

          <article className="inner-card">
            {content["inner-grid.image_3"] && (
              <img
                src={content["inner-grid.image_3"]}
                alt=""
                style={{
                  width: "100%",
                  height: 190,
                  objectFit: "cover",
                  borderRadius: 16,
                  marginBottom: 20,
                }}
              />
            )}
            <span>{content["inner-grid.text_7"]}</span>
            <h2>{content["inner-grid.text_8"]}</h2>
            <p>{content["inner-grid.textarea_3"]}</p>
            <a href={content["inner-grid.link_3"]} className="text-link">
              {content["inner-grid.text_9"]}
            </a>
          </article>
        </section>

        <section className="inner-cta">
          <h2>{content["inner-cta.text_1"]}</h2>

          <p>{content["inner-cta.textarea_1"]}</p>

          <a href={content["inner-cta.link_1"]} className="btn btn-yellow">
            {content["inner-cta.text_2"]}
          </a>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <img
            src="/assets/logos/logo-ibraco.png"
            alt="IBRACO Instituto Brasil Colombia"
          />
          <p>
            Instituto Brasil Colombia. Portugués, cultura brasileña y comunidad.
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
