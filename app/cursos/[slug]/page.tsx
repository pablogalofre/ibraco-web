import { displayCampusText } from "../../lib/campus-label";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { consultation, type Course } from "../../lib/course-catalog";
export const dynamic = "force-dynamic";
async function load(slug: string) {
  const { data, error } = await supabase.from("courses").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) throw new Error("No fue posible consultar el curso. Intenta nuevamente.");
  return data as Course | null;
}
export async function generateMetadata({ params }: { params: Promise<{slug: string}> }): Promise<Metadata> {
  const course = await load((await params).slug);
  return { title: course ? `${displayCampusText(course.name)} | IBRACO` : "Curso no disponible | IBRACO" };
}
export default async function CoursePage({ params }: { params: Promise<{slug: string}> }) {
  const course = await load((await params).slug);
  if (!course) notFound();
  const date = (value: string | null) => value ? new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "UTC" }).format(new Date(value + "T00:00:00Z")) : "Por confirmar";
  const facts = [["Modalidad", course.modality], ["Sede", displayCampusText(course.campus)], ["Jornada", course.shift], ["Nivel", course.level], ["Inicio", date(course.start_date)], ["Finaliza", date(course.end_date)], ["Días", course.days?.join(", ")], ["Horario", [course.start_time?.slice(0,5), course.end_time?.slice(0,5)].filter(Boolean).join(" – ")]];
  return <main className="qa-detail">
    <a href="/cursos#cursos-disponibles" className="text-link">← Volver a cursos</a>
    <h1>{displayCampusText(course.name)}</h1>
    <p>Revisa la sede, las fechas y el horario de esta opción antes de continuar con tu matrícula.</p>
    {course.image_url && <img src={course.image_url} alt={displayCampusText(course.name)} style={{maxHeight: 380, objectFit: "contain", marginBottom: 28}} />}
    <dl className="qa-facts">{facts.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value || "Por confirmar"}</dd></div>)}</dl>
    <h2>{course.price == null ? "Precio por confirmar" : new Intl.NumberFormat("es-CO", {style:"currency",currency:"COP",maximumFractionDigits:0}).format(course.price)}</h2>
    <div className="hero-actions"><a href={`/matricula/${encodeURIComponent(course.slug)}`} className="btn btn-yellow">Continuar con la matrícula</a><a href={consultation(`Hola, quiero información sobre ${displayCampusText(course.name)}, sede ${displayCampusText(course.campus) || "por confirmar"}, modalidad ${course.modality || "por confirmar"}, inicio ${course.start_date || "por confirmar"}. Referencia: ${course.slug}`)} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">Consultar este curso</a></div>
  </main>;
}
