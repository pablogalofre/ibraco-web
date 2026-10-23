import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { culturalExperiences } from "../../lib/culture-topics";
import { consultation } from "../../lib/course-catalog";
export async function generateMetadata({params}: {params: Promise<{tema:string}>}): Promise<Metadata> {
 const slug = (await params).tema; return {title: `${culturalExperiences.find(t => t.slug === slug)?.title || "Cultura"} | IBRACO`};
}
export default async function CultureTopic({params}: {params: Promise<{tema:string}>}) {
 const slug = (await params).tema; const topic = culturalExperiences.find(t => t.slug === slug); if (!topic) notFound();
 const blogCategory = slug === "viajes" ? "Estudiar y viajar" : "Cultura brasileña";
 return <main className="qa-detail"><a href="/cultura" className="text-link">← Cultura brasileña</a><h1>{topic.title}</h1><p>{topic.description}</p><img src={topic.image} alt="" style={{width:"100%",height:320,objectFit:"cover",borderRadius:24}}/><h2>Explora {topic.title.toLowerCase()} con IBRACO</h2><p>Consulta las actividades publicadas relacionadas con este tema o pregunta al equipo por la próxima programación.</p><div className="hero-actions"><a href={`/eventos?tema=${topic.slug}`} className="btn btn-yellow">Ver actividades de {topic.title.toLowerCase()}</a><a href={consultation(`Hola, me interesan las actividades de ${topic.title.toLowerCase()} de IBRACO. ¿Qué programación tienen?`)} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">Consultar este tema</a><a href={`/blog?categoria=${encodeURIComponent(blogCategory)}#articulos`} className="text-link">Leer contenidos relacionados →</a></div></main>;
}
