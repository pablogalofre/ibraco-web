import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { programs, courseListUrl, consultation } from "../../../lib/course-catalog";
export async function generateMetadata({ params }: { params: Promise<{programa: string}> }): Promise<Metadata> {
 const slug = (await params).programa;
 return {title: `${programs.find(p => p.slug === slug)?.title || "Programa"} | IBRACO`};
}
export default async function ProgramPage({ params }: { params: Promise<{programa: string}> }) {
 const slug = (await params).programa;
 const item = programs.find(p => p.slug === slug);
 if (!item) notFound();
 return <main className="qa-detail"><a href="/cursos#programas" className="text-link">← Todos los programas</a><h1>{item.title}</h1><span className="alumni-tag">{item.eyebrow}</span><p>{item.description}</p><img src={item.image} alt="" style={{width:"100%",height:320,objectFit:"cover",borderRadius:24}}/><h2>Fechas, horarios y matrícula</h2><p>Consulta la programación publicada para este programa. En cada curso encontrarás sede, modalidad, nivel, fechas, horario y precio. Si no hay una opción publicada, nuestro equipo puede orientarte sobre las próximas aperturas.</p><div className="hero-actions"><a className="btn btn-yellow" href={courseListUrl({programa: item.slug})}>Ver disponibilidad de {item.title}</a><a className="btn btn-secondary" href={consultation(`Hola, quiero conocer el programa ${item.title} de IBRACO y sus próximas fechas.`)} target="_blank" rel="noopener noreferrer">Consultar este programa</a></div></main>;
}
