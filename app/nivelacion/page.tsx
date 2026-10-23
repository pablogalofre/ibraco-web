import type { Metadata } from "next";
import LevelConsultation from "../components/level-consultation";
export const metadata: Metadata = { title: "Prueba de nivel de portugués | IBRACO", description: "Consulta el proceso de nivelación de portugués y recibe orientación de IBRACO." };
export default function LevelPage() {
 return <main className="qa-detail"><a className="text-link" href="/cursos">← Ver cursos</a><h1>Encuentra tu nivel de portugués</h1><p>Si ya tienes conocimientos de portugués, la prueba de nivelación ayuda a orientarte hacia el curso adecuado. El proceso contempla una prueba escrita y una entrevista oral.</p><h2>Consulta el proceso con IBRACO</h2><p>Completa estos datos para consultar fechas, tarifa vigente, pago y programación de la entrevista con nuestro equipo.</p><LevelConsultation /></main>;
}
