import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogChrome from "../blog-chrome";
import { getPublicPost, safeCover, postDate } from "../../../lib/blog-public";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) return { title: { absolute: "Artículo no encontrado | IBRACO" }, robots: { index: false, follow: false } };
  const title = post.seo_title || post.title;
  const description = post.meta_description || post.excerpt || undefined;
  const image = safeCover(post.cover_image_url);
  return {
    title: { absolute: title }, description,
    alternates: { canonical: "/blog/" + encodeURIComponent(post.slug) },
    openGraph: {
      type: "article", title, description,
      url: "/blog/" + encodeURIComponent(post.slug),
      ...(post.published_at ? { publishedTime: post.published_at } : {}),
      ...(image ? { images: [{ url: image, alt: post.title }] } : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) notFound();
  const cover = safeCover(post.cover_image_url);
  return <BlogChrome><main className="inner-page">
    <article style={{ maxWidth: 900, margin: "0 auto", padding: "32px clamp(16px, 4vw, 40px) 64px", overflowWrap: "anywhere" }}>
      <a href="/blog#articulos" className="text-link">← Volver al blog</a>
      <header style={{ marginTop: 30 }}>
        <div className="eyebrow"><span className="dot"></span>{post.category || "Comunidad IBRACO"}</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 54px)", lineHeight: 1.12, margin: "20px 0" }}>{post.title}</h1>
        {post.published_at && <p><time dateTime={post.published_at}>{postDate(post.published_at)}</time></p>}
        {post.excerpt && <p style={{ fontSize: 20, lineHeight: 1.65 }}>{post.excerpt}</p>}
      </header>
      {cover && <img src={cover} alt={post.title} style={{ width: "100%", maxHeight: 540, objectFit: "cover", borderRadius: 20, margin: "24px 0" }} />}
      <div style={{ whiteSpace: "pre-wrap", fontSize: 18, lineHeight: 1.85, marginTop: 30 }}>{post.content}</div>
      <div style={{ marginTop: 48 }}><a href="/blog#articulos" className="text-link">← Explorar más artículos</a></div>
    </article>
    <section className="inner-cta"><h2>Tu próxima historia puede empezar en portugués</h2>
      <p>Conoce los cursos de IBRACO y conecta con Brasil.</p><a href="/cursos" className="btn btn-yellow">Ver cursos de portugués</a></section>
  </main></BlogChrome>;
}
