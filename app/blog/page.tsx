import BlogChrome from "./blog-chrome";
import { listPublicPosts, listFeaturedPosts, safeCover, postDate, type PublicPost } from "../../lib/blog-public";

export const dynamic = "force-dynamic";

const categories = [
  { title: "Aprender portugués", description: "Consejos, herramientas y rutas para avanzar con mayor seguridad." },
  { title: "Celpe-Bras", description: "Información sobre niveles, preparación y certificación oficial." },
  { title: "Cultura brasileña", description: "Música, cine, gastronomía, literatura, arte e historia." },
  { title: "Portugués para negocios", description: "Comunicación, negociación y oportunidades profesionales con Brasil." },
  { title: "Estudiar y viajar", description: "Orientación para estudiar, viajar o vivir una experiencia en Brasil." },
  { title: "Comunidad IBRACO", description: "Historias, eventos, profesores, estudiantes y vida institucional." },
];
function listUrl(category: string, page = 1) {
  const params = new URLSearchParams();
  if (category) params.set("categoria", category);
  if (page > 1) params.set("pagina", String(page));
  return "/blog" + (params.size ? "?" + params.toString() : "") + "#articulos";
}
function PostCard({ post }: { post: PublicPost }) {
  const cover = safeCover(post.cover_image_url);
  const href = "/blog/" + encodeURIComponent(post.slug);
  return <article className="blog-article-card">
    <a href={href} className="blog-article-image" aria-label={post.title} style={{ position: "relative", overflow: "hidden", display: "block", minHeight: 190 }}>
      {cover ? <img src={cover} alt="" loading="lazy" style={{ width: "100%", height: 220, objectFit: "cover", display: "block" }} /> : <span>{post.category || "IBRACO"}</span>}
    </a>
    <div className="blog-article-content">
      <small>{post.category || "Comunidad IBRACO"}{post.is_featured ? " · Destacado" : ""}</small>
      <h2 style={{ overflowWrap: "anywhere" }}><a href={href} style={{ color: "inherit", textDecoration: "none" }}>{post.title}</a></h2>
      {post.published_at && <p><time dateTime={post.published_at}>{postDate(post.published_at)}</time></p>}
      {post.excerpt && <p>{post.excerpt}</p>}
      <a href={href} className="text-link">Leer artículo →</a>
    </div>
  </article>;
}
export default async function BlogPage({ searchParams }: {
  searchParams: Promise<{ categoria?: string | string[]; pagina?: string | string[] }>;
}) {
  const params = await searchParams;
  const category = typeof params.categoria === "string" && categories.some(c => c.title === params.categoria) ? params.categoria : "";
  const rawPage = typeof params.pagina === "string" ? params.pagina : "1";
  const parsedPage = Number(rawPage);
  const page = Number.isSafeInteger(parsedPage) && parsedPage > 0 && parsedPage <= 10000 ? parsedPage : 1;
  const [{ posts, total }, featured] = await Promise.all([
    listPublicPosts(category, page),
    !category && page === 1 ? listFeaturedPosts() : Promise.resolve([] as PublicPost[]),
  ]);
  return <BlogChrome>
    <main className="inner-page">
      <section className="inner-hero">
        <div className="eyebrow"><span className="dot"></span>Portugués, Brasil y cultura</div>
        <h1>Blog IBRACO</h1>
        <p>Contenidos para aprender portugués, entender Brasil y descubrir oportunidades académicas, culturales y profesionales.</p>
        <div className="hero-actions">
          <a href="#articulos" className="btn btn-primary">Explorar artículos</a>
          <a href="/cursos" className="btn btn-secondary">Ver cursos</a>
        </div>
      </section>
      {featured.length > 0 && <section className="blog-featured">
        <div className="section-header"><h2>Artículos destacados</h2><p>Historias para orientar, inspirar y acercarte al portugués y a Brasil.</p></div>
        <div className="blog-featured-grid">{featured.map(post => <PostCard key={post.id} post={post} />)}</div>
      </section>}
      <section id="articulos" className="blog-featured">
        <div className="section-header"><h2>{category || "Todos los artículos"}</h2>
          <p>{category ? "Contenidos sobre " + category.toLowerCase() + "." : "Descubre las publicaciones del blog IBRACO."}</p>
          {category && <a className="text-link" href={listUrl("")}>Ver todos los temas →</a>}
        </div>
        {posts.length ? <div className="blog-featured-grid">{posts.map(post => <PostCard key={post.id} post={post} />)}</div> :
          <div className="inner-card"><h3>{page > 1 ? "No hay artículos en esta página" : category ? "Todavía no hay artículos publicados sobre este tema" : "Pronto encontrarás nuestras primeras historias"}</h3>
            <p>{page > 1 ? "Regresa a la primera página para explorar los contenidos." : "Mientras tanto, explora nuestros cursos y actividades culturales."}</p>
            {page > 1 && <a href={listUrl(category)} className="text-link">Volver a la primera página →</a>}
          </div>}
        {(page > 1 || page * 12 < total) && <nav aria-label="Páginas de artículos" style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", marginTop: 28 }}>
          {page > 1 && <a href={listUrl(category, page - 1)} className="btn btn-secondary">← Anterior</a>}
          <span>Página {page}</span>
          {page * 12 < total && <a href={listUrl(category, page + 1)} className="btn btn-primary">Siguiente →</a>}
        </nav>}
      </section>
      <section className="blog-categories">
        <div className="section-header"><h2>Explora por tema</h2><p>Una biblioteca de conocimiento sobre portugués, Brasil y la comunidad IBRACO.</p></div>
        <div className="inner-grid blog-category-grid">{categories.map(item =>
          <article className="inner-card blog-category-card" key={item.title}>
            <span className="blog-category-number">IBRACO</span><h2>{item.title}</h2><p>{item.description}</p>
            <a href={listUrl(item.title)} className="text-link">Explorar contenido →</a>
          </article>)}</div>
      </section>
      <section className="blog-newsletter">
        <div><span className="alumni-tag">Comunidad IBRACO</span><h2>Recibe nuevos contenidos y actividades</h2>
          <p>Próximamente podrás recibir artículos, agenda cultural y novedades de cursos directamente en tu correo.</p></div>
        <form className="blog-newsletter-form">
          <label htmlFor="blog-name">Nombre</label><input id="blog-name" type="text" name="name" placeholder="Tu nombre" disabled />
          <label htmlFor="blog-email">Correo electrónico</label><input id="blog-email" type="email" name="email" placeholder="tu@correo.com" disabled />
          <button type="button" className="btn btn-primary" disabled>Próximamente</button>
        </form>
      </section>
      <section className="inner-cta"><h2>Aprende portugués y empieza a vivir Brasil</h2>
        <p>El contenido puede inspirarte. Un curso puede convertir ese interés en una experiencia real.</p>
        <a href="/cursos" className="btn btn-yellow">Conocer los cursos</a></section>
    </main>
  </BlogChrome>;
}
