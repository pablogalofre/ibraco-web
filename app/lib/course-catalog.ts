export type Course = {
  id: number;
  slug: string;
  name: string;
  cycle: string | null;
  year: number | null;
  shift: string | null;
  modality: string | null;
  campus: string | null;
  start_date: string | null;
  end_date: string | null;
  days: string[] | null;
  start_time: string | null;
  end_time: string | null;
  level: string | null;
  price: number | null;
  capacity: number | null;
  status: string | null;
  image_url: string | null;
};
export const programs = [
  {
    slug: "intensivo",
    eyebrow: "5 semanas · 50 horas",
    title: "Intensivo",
    description:
      "Avanza un nivel en cinco semanas con clases de alta intensidad. Disponible según programación en Sede Norte, Sede Centro y modalidad virtual.",
    image:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    slug: "semi-intensivo",
    eyebrow: "Entre semana · 50 horas",
    title: "Semi-intensivo",
    description:
      "Estudia de manera más pausada entre semana. Cada nivel se desarrolla durante diez semanas.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    slug: "semi-intensivo-sabados",
    eyebrow: "Sábados · 48 horas",
    title: "Semi-intensivo sábados",
    description:
      "Una alternativa para quienes necesitan concentrar su formación los sábados durante doce semanas.",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    slug: "expresso",
    eyebrow: "Vacaciones · avance rápido",
    title: "Curso Expresso",
    description:
      "Una experiencia intensiva diseñada para avanzar dos niveles en un periodo corto durante temporadas especiales.",
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    slug: "celpe-bras",
    eyebrow: "Preparación especializada",
    title: "Celpe-Bras",
    description:
      "Prepárate para el certificado oficial de dominio del portugués de Brasil con acompañamiento especializado.",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    slug: "particulares",
    eyebrow: "Atención personalizada",
    title: "Clases particulares",
    description:
      "Un programa flexible y personalizado según tu nivel, disponibilidad y objetivos específicos.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    slug: "empresas",
    eyebrow: "Equipos y organizaciones",
    title: "Portugués para empresas",
    description:
      "Programas corporativos adaptados al sector, las funciones y los objetivos de cada organización.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
  {
    slug: "instituciones-educativas",
    eyebrow: "Instituciones educativas",
    title: "Colegios y universidades",
    description:
      "Alianzas, clases extracurriculares, currículo, certificación y beneficios para comunidades educativas.",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1400&q=85",
    imagePosition: "center",
  },
];

export function normalize(value: string | null | undefined) {
  return (value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
export function matchesProgram(name: string, slug: string) {
  const text = normalize(name);
  if (slug === "intensivo") return text.includes("intensivo") && !text.includes("semi");
  if (slug === "semi-intensivo") return text.includes("semi") && !text.includes("sabado");
  if (slug === "semi-intensivo-sabados") return text.includes("semi") && text.includes("sabado");
  const words: Record<string, string[]> = { expresso: ["expresso", "expreso"], "celpe-bras": ["celpe"], particulares: ["particular"], empresas: ["empresa", "corporativo"], "instituciones-educativas": ["colegio", "universidad", "educativa"] };
  return (words[slug] || [normalize(slug)]).some(word => text.includes(word));
}
export type CourseFilters = { sede?: string; modalidad?: string; programa?: string };
export function filterCourses(courses: Course[], filters: CourseFilters) {
  return courses.filter(course =>
    (!filters.sede || normalize(course.campus).includes(normalize(filters.sede))) &&
    (!filters.modalidad || normalize(course.modality).includes(normalize(filters.modalidad))) &&
    (!filters.programa || matchesProgram(course.name, filters.programa))
  );
}
export function courseListUrl(filters: CourseFilters) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  return "/cursos" + (query.size ? "?" + query.toString() : "") + "#cursos-disponibles";
}
export function consultation(message: string) { return "https://wa.me/573125841068?text=" + encodeURIComponent(message); }
