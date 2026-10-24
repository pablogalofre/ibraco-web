-- IBRACO: editor de Inicio y Sedes. Run once in Supabase SQL Editor.
-- Separate draft and published tables so anonymous reads cannot include drafts.
begin;
create table if not exists public.site_content_fields (
 page_path text not null check(page_path in ('/', '/sedes')), field_key text not null,
 kind text not null check(kind in ('text','textarea','link','image')), default_value text not null,
 max_length integer not null, is_required boolean not null, primary key(page_path, field_key)
);
create table if not exists public.site_content_documents (
 page_path text primary key check(page_path in ('/', '/sedes')),
 draft_content jsonb not null default '{}'::jsonb,
 version bigint not null default 0, published_version bigint,
 updated_at timestamptz not null default now(), published_at timestamptz,
 updated_by uuid references auth.users(id) on delete set null
);
create table if not exists public.site_content_public (
 page_path text primary key references public.site_content_documents(page_path),
 content jsonb not null, version bigint not null, published_at timestamptz not null default now()
);
create table if not exists public.site_content_revisions (
 id uuid primary key default gen_random_uuid(),
 page_path text not null references public.site_content_documents(page_path),
 version bigint not null, content jsonb not null,
 action text not null check(action in ('initial','save','publish','restore')),
 created_at timestamptz not null default now(), created_by uuid references auth.users(id) on delete set null,
 unique(page_path,version)
);
create index if not exists site_content_revisions_recent on public.site_content_revisions(page_path,version desc);
insert into public.site_content_fields(page_path, field_key, kind, default_value, max_length, is_required) values
('/', 'hero.text_1', 'text', 'Instituto de Cultura Brasil Colombia', 500, true),
('/', 'hero.textarea_1', 'textarea', 'Aprende portugués en Bogotá o en modalidad virtual con IBRACO: una institución que conecta a Colombia con Brasil a través del idioma, la cultura y la comunidad.', 3000, true),
('/', 'hero.link_1', 'link', '/cursos', 2048, true),
('/', 'hero.text_2', 'text', 'Ver cursos', 500, true),
('/', 'hero.link_2', 'link', '#nivel', 2048, true),
('/', 'hero.text_3', 'text', 'Mide tu nivel', 500, true),
('/', 'hero.text_4', 'text', '✓ Sede Norte en Bogotá', 500, true),
('/', 'hero.text_5', 'text', '✓ Sede Centro CityU', 500, true),
('/', 'hero.text_6', 'text', '✓ Modalidad virtual en vivo', 500, true),
('/', 'hero.image_1', 'image', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1600&auto=format&fit=crop', 2048, false),
('/', 'hero.text_7', 'text', 'Portugués que se vive.', 500, true),
('/', 'hero.textarea_2', 'textarea', 'En IBRACO aprendes portugués por medio de conversación, música, cine, literatura, eventos y cultura real de Brasil.', 3000, true),
('/', 'hero.text_8', 'text', '3.000+', 500, true),
('/', 'hero.text_9', 'text', 'Estudiantes al año', 500, true),
('/', 'hero.text_10', 'text', '30+', 500, true),
('/', 'hero.text_11', 'text', 'Años de trayectoria', 500, true),
('/', 'hero.text_12', 'text', '260M', 500, true),
('/', 'hero.text_13', 'text', 'Personas sueñan en portugués', 500, true),
('/', 'quick-path.text_1', 'text', 'Estudia donde mejor te quede', 500, true),
('/', 'quick-path.link_1', 'link', '/cursos?sede=Norte#cursos-disponibles', 2048, true),
('/', 'quick-path.text_2', 'text', 'Sede Norte', 500, true),
('/', 'quick-path.text_3', 'text', 'Experiencia presencial en Bogotá', 500, true),
('/', 'quick-path.link_2', 'link', '/cursos?sede=Centro#cursos-disponibles', 2048, true),
('/', 'quick-path.text_4', 'text', 'Sede Centro CityU', 500, true),
('/', 'quick-path.text_5', 'text', 'Un espacio moderno en Bogotá', 500, true),
('/', 'quick-path.link_3', 'link', '/cursos?modalidad=Virtual#cursos-disponibles', 2048, true),
('/', 'quick-path.text_6', 'text', 'Virtual', 500, true),
('/', 'quick-path.text_7', 'text', 'Clases en vivo desde cualquier ciudad', 500, true),
('/', 'quick-path.link_4', 'link', '#nivel', 2048, true),
('/', 'quick-path.text_8', 'text', 'Mide tu nivel', 500, true),
('/', 'quick-path.text_9', 'text', 'Encuentra el curso adecuado', 500, true),
('/', 'campus-section.text_1', 'text', 'Sedes en Bogotá y modalidad virtual', 500, true),
('/', 'campus-section.textarea_1', 'textarea', 'La presencialidad es una fortaleza de IBRACO. La virtualidad no la reemplaza: la amplía y conecta a más personas con nuestra comunidad.', 3000, true),
('/', 'campus-section.image_1', 'image', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1400&auto=format&fit=crop', 2048, false),
('/', 'campus-section.text_2', 'text', 'Presencial', 500, true),
('/', 'campus-section.text_3', 'text', 'Sede Norte', 500, true),
('/', 'campus-section.textarea_2', 'textarea', 'Comunidad, profesores, eventos y cultura brasileña en un entorno cercano y vivo.', 3000, true),
('/', 'campus-section.link_1', 'link', '/cursos?sede=Norte#cursos-disponibles', 2048, true),
('/', 'campus-section.text_4', 'text', 'Ver cursos Norte', 500, true),
('/', 'campus-section.image_2', 'image', 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=1400&auto=format&fit=crop', 2048, false),
('/', 'campus-section.text_5', 'text', 'Presencial', 500, true),
('/', 'campus-section.text_6', 'text', 'Sede Centro CityU', 500, true),
('/', 'campus-section.textarea_3', 'textarea', 'Una sede moderna en el centro estudiantil de Bogotá, diseñada para aprender, encontrarse y vivir la cultura.', 3000, true),
('/', 'campus-section.link_2', 'link', '/cursos?sede=Centro#cursos-disponibles', 2048, true),
('/', 'campus-section.text_7', 'text', 'Ver cursos Centro', 500, true),
('/', 'campus-section.image_3', 'image', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop', 2048, false),
('/', 'campus-section.text_8', 'text', 'Virtual', 500, true),
('/', 'campus-section.text_9', 'text', 'Virtual', 500, true),
('/', 'campus-section.textarea_4', 'textarea', 'Aprende portugués en vivo desde cualquier ciudad con profesores, metodología y experiencia IBRACO.', 3000, true),
('/', 'campus-section.link_3', 'link', '/cursos?modalidad=Virtual#cursos-disponibles', 2048, true),
('/', 'campus-section.text_10', 'text', 'Ver cursos virtuales', 500, true),
('/', 'campus-section.link_4', 'link', '/sedes', 2048, true),
('/', 'campus-section.text_11', 'text', 'Conocer todas las sedes', 500, true),
('/', 'lusophone-section.text_1', 'text', '¿Por qué aprender portugués hoy?', 500, true),
('/', 'lusophone-section.textarea_1', 'textarea', 'El portugués abre oportunidades académicas, profesionales, culturales y de viaje. Brasil es el corazón de nuestra historia, pero el idioma conecta con un mundo mucho más amplio.', 3000, true),
('/', 'lusophone-section.text_2', 'text', 'BR', 500, true),
('/', 'lusophone-section.text_3', 'text', 'Brasil', 500, true),
('/', 'lusophone-section.textarea_2', 'textarea', 'El mayor mercado de habla portuguesa y una potencia cultural, académica y empresarial.', 3000, true),
('/', 'lusophone-section.text_4', 'text', 'NEG', 500, true),
('/', 'lusophone-section.text_5', 'text', 'Trabajo', 500, true),
('/', 'lusophone-section.textarea_3', 'textarea', 'Portugués para empresas, profesionales y equipos que se conectan con Brasil.', 3000, true),
('/', 'lusophone-section.text_6', 'text', 'EDU', 500, true),
('/', 'lusophone-section.text_7', 'text', 'Estudio', 500, true),
('/', 'lusophone-section.textarea_4', 'textarea', 'Una herramienta para certificaciones, movilidad académica y oportunidades internacionales.', 3000, true),
('/', 'lusophone-section.text_8', 'text', 'CUL', 500, true),
('/', 'lusophone-section.text_9', 'text', 'Cultura', 500, true),
('/', 'lusophone-section.textarea_5', 'textarea', 'Un idioma para viajar, conversar, leer, cantar y vivir nuevas experiencias.', 3000, true),
('/', 'courses-section.text_1', 'text', 'Cursos de portugués', 500, true),
('/', 'courses-section.textarea_1', 'textarea', 'Programas diseñados para empezar, avanzar rápido, certificar tu nivel o formar equipos que trabajan con Brasil.', 3000, true),
('/', 'courses-section.image_1', 'image', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop', 2048, false),
('/', 'courses-section.text_2', 'text', 'Presencial', 500, true),
('/', 'courses-section.text_3', 'text', 'Portugués presencial', 500, true),
('/', 'courses-section.textarea_2', 'textarea', 'Clases en sede con acompañamiento, comunidad y experiencia cultural IBRACO.', 3000, true),
('/', 'courses-section.link_1', 'link', '/cursos?modalidad=Presencial#cursos-disponibles', 2048, true),
('/', 'courses-section.text_4', 'text', 'Conocer programa', 500, true),
('/', 'courses-section.image_2', 'image', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop', 2048, false),
('/', 'courses-section.text_5', 'text', 'Virtual', 500, true),
('/', 'courses-section.text_6', 'text', 'Portugués virtual', 500, true),
('/', 'courses-section.textarea_3', 'textarea', 'Clases en vivo desde cualquier ciudad, con profesores y metodología IBRACO.', 3000, true),
('/', 'courses-section.link_2', 'link', '/cursos?modalidad=Virtual#cursos-disponibles', 2048, true),
('/', 'courses-section.text_7', 'text', 'Ver horarios', 500, true),
('/', 'courses-section.image_3', 'image', 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1200&auto=format&fit=crop', 2048, false),
('/', 'courses-section.text_8', 'text', 'Intensivo', 500, true),
('/', 'courses-section.text_9', 'text', 'Curso Expresso', 500, true),
('/', 'courses-section.textarea_4', 'textarea', 'Avanza más rápido con programas intensivos y semi-intensivos.', 3000, true),
('/', 'courses-section.link_3', 'link', '/cursos?programa=expresso#cursos-disponibles', 2048, true),
('/', 'courses-section.text_10', 'text', 'Ver oferta', 500, true),
('/', 'courses-section.image_4', 'image', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop', 2048, false),
('/', 'courses-section.text_11', 'text', 'Certificación', 500, true),
('/', 'courses-section.text_12', 'text', 'Celpe-Bras', 500, true),
('/', 'courses-section.textarea_5', 'textarea', 'Prepárate para certificar tu dominio del portugués con acompañamiento especializado.', 3000, true),
('/', 'courses-section.link_4', 'link', '/cursos/programas/celpe-bras', 2048, true),
('/', 'courses-section.text_13', 'text', 'Prepararme', 500, true),
('/', 'courses-section.image_5', 'image', 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1200&auto=format&fit=crop', 2048, false),
('/', 'courses-section.text_14', 'text', 'Empresas', 500, true),
('/', 'courses-section.text_15', 'text', 'Portugués corporativo', 500, true),
('/', 'courses-section.textarea_6', 'textarea', 'Programas para equipos que trabajan con Brasil o quieren abrir oportunidades regionales.', 3000, true),
('/', 'courses-section.link_5', 'link', '/empresas', 2048, true),
('/', 'courses-section.text_16', 'text', 'Cotizar', 500, true),
('/', 'courses-section.image_6', 'image', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop', 2048, false),
('/', 'courses-section.text_17', 'text', 'Cultura', 500, true),
('/', 'courses-section.text_18', 'text', 'Samba', 500, true),
('/', 'courses-section.textarea_7', 'textarea', 'Una experiencia cultural para vivir Brasil desde el ritmo, el movimiento y la conversación.', 3000, true),
('/', 'courses-section.link_6', 'link', '/agenda-cultural', 2048, true),
('/', 'courses-section.text_19', 'text', 'Ver experiencias', 500, true),
('/', 'courses-section.link_7', 'link', '/cursos', 2048, true),
('/', 'courses-section.text_20', 'text', 'Ver todos los cursos', 500, true),
('/', 'test-section.text_1', 'text', 'Mide en qué nivel estás', 500, true),
('/', 'test-section.text_2', 'text', '¿Ya sabes portugués?', 500, true),
('/', 'test-section.textarea_1', 'textarea', 'Presenta tu examen de nivel, encuentra el curso adecuado y agenda tu entrevista para iniciar el proceso de matrícula.', 3000, true),
('/', 'test-section.link_1', 'link', '/nivelacion', 2048, true),
('/', 'test-section.text_3', 'text', 'Conocer la prueba', 500, true),
('/', 'culture-section.text_1', 'text', 'El idioma entra por la cultura', 500, true),
('/', 'culture-section.textarea_1', 'textarea', 'Este es el gran diferencial de IBRACO frente a una academia tradicional: el portugués se aprende viviéndolo.', 3000, true),
('/', 'culture-section.text_2', 'text', 'O Brasil é aqui.', 500, true),
('/', 'culture-section.textarea_2', 'textarea', 'La cultura no compite con los cursos: los hace más deseables, más memorables y más valiosos.', 3000, true),
('/', 'culture-section.link_1', 'link', '/cultura', 2048, true),
('/', 'culture-section.text_3', 'text', 'Explorar cultura', 500, true),
('/', 'culture-section.image_1', 'image', 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=900&auto=format&fit=crop', 2048, false),
('/', 'culture-section.link_2', 'link', '/cultura/musica', 2048, true),
('/', 'culture-section.text_4', 'text', 'Música', 500, true),
('/', 'culture-section.text_5', 'text', 'Ritmo, escucha y expresión', 500, true),
('/', 'culture-section.image_2', 'image', 'https://images.unsplash.com/photo-1508973379184-7517410fb0bc?q=80&w=900&auto=format&fit=crop', 2048, false),
('/', 'culture-section.link_3', 'link', '/cultura/cine', 2048, true),
('/', 'culture-section.text_6', 'text', 'Cine', 500, true),
('/', 'culture-section.text_7', 'text', 'Idioma en contexto real', 500, true),
('/', 'culture-section.image_3', 'image', 'https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=900&auto=format&fit=crop', 2048, false),
('/', 'culture-section.link_4', 'link', '/cultura/gastronomia', 2048, true),
('/', 'culture-section.text_8', 'text', 'Gastronomía', 500, true),
('/', 'culture-section.text_9', 'text', 'Experiencias y conversación', 500, true),
('/', 'culture-section.image_4', 'image', 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=900&auto=format&fit=crop', 2048, false),
('/', 'culture-section.link_5', 'link', '/cultura/arte', 2048, true),
('/', 'culture-section.text_10', 'text', 'Arte', 500, true),
('/', 'culture-section.text_11', 'text', 'Creatividad y vocabulario', 500, true),
('/', 'culture-section.image_5', 'image', 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=900&auto=format&fit=crop', 2048, false),
('/', 'culture-section.link_6', 'link', '/cultura/literatura', 2048, true),
('/', 'culture-section.text_12', 'text', 'Literatura', 500, true),
('/', 'culture-section.text_13', 'text', 'Lectura y pensamiento', 500, true),
('/', 'culture-section.image_6', 'image', 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?q=80&w=900&auto=format&fit=crop', 2048, false),
('/', 'culture-section.link_7', 'link', '/cultura/viajes', 2048, true),
('/', 'culture-section.text_14', 'text', 'Viajes', 500, true),
('/', 'culture-section.text_15', 'text', 'Cuando el idioma empieza a vivirse', 500, true),
('/', 'culture-section.link_8', 'link', '/agenda-cultural', 2048, true),
('/', 'culture-section.text_16', 'text', 'Ver agenda cultural', 500, true),
('/', 'cycles-section.text_1', 'text', 'Próximos ciclos abiertos', 500, true),
('/', 'cycles-section.textarea_1', 'textarea', 'Inscríbete al curso que más se ajuste a tu horario, nivel y objetivo.', 3000, true),
('/', 'cycles-section.text_2', 'text', 'Nuevo', 500, true),
('/', 'cycles-section.text_3', 'text', 'Curso Expresso', 500, true),
('/', 'cycles-section.textarea_2', 'textarea', 'Dos niveles en un mes. Ideal para avanzar rápido.', 3000, true),
('/', 'cycles-section.text_4', 'text', 'Consulta fechas y tarifa vigente', 500, true),
('/', 'cycles-section.link_1', 'link', '/cursos?programa=expresso#cursos-disponibles', 2048, true),
('/', 'cycles-section.text_5', 'text', 'Matricularme', 500, true),
('/', 'cycles-section.text_6', 'text', 'Intensivo', 500, true),
('/', 'cycles-section.text_7', 'text', 'Intensivo', 500, true),
('/', 'cycles-section.textarea_3', 'textarea', 'Sede Norte, Sede Centro o Virtual.', 3000, true),
('/', 'cycles-section.text_8', 'text', 'Consulta fechas y tarifa vigente', 500, true),
('/', 'cycles-section.link_2', 'link', '/cursos?programa=intensivo#cursos-disponibles', 2048, true),
('/', 'cycles-section.text_9', 'text', 'Matricularme', 500, true),
('/', 'cycles-section.text_10', 'text', 'Nivelación', 500, true),
('/', 'cycles-section.text_11', 'text', 'Examen de nivel', 500, true),
('/', 'cycles-section.textarea_4', 'textarea', 'Identifica tu nivel y entra al curso adecuado.', 3000, true),
('/', 'cycles-section.text_12', 'text', 'Consulta fechas y tarifa vigente', 500, true),
('/', 'cycles-section.link_3', 'link', '/nivelacion', 2048, true),
('/', 'cycles-section.text_13', 'text', 'Consultar prueba', 500, true),
('/', 'cycles-section.text_14', 'text', 'Cultura', 500, true),
('/', 'cycles-section.text_15', 'text', 'Curso de Samba', 500, true),
('/', 'cycles-section.textarea_5', 'textarea', 'Una experiencia cultural para vivir Brasil desde el ritmo.', 3000, true),
('/', 'cycles-section.text_16', 'text', 'Consulta fechas y tarifa vigente', 500, true),
('/', 'cycles-section.link_4', 'link', 'https://wa.me/573125841068?text=Hola%2C%20quiero%20consultar%20las%20fechas%20y%20cupos%20del%20curso%20de%20Samba.', 2048, true),
('/', 'cycles-section.text_17', 'text', 'Reservar cupo', 500, true),
('/', 'cycles-section.link_5', 'link', '/cursos', 2048, true),
('/', 'cycles-section.text_18', 'text', 'Ver oferta completa', 500, true),
('/', 'dual-section.text_1', 'text', 'Nuevas formas de vivir Brasil', 500, true),
('/', 'dual-section.textarea_1', 'textarea', 'IBRACO puede ampliar la experiencia sin perder foco: cursos primero, cultura como diferenciador.', 3000, true),
('/', 'dual-section.image_1', 'image', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=1200&auto=format&fit=crop', 2048, false),
('/', 'dual-section.text_2', 'text', 'Próximamente', 500, true),
('/', 'dual-section.text_3', 'text', 'IBRACO Niños', 500, true),
('/', 'dual-section.textarea_2', 'textarea', 'Portugués para niños a través de juego, música, creatividad y cultura brasileña.', 3000, true),
('/', 'dual-section.link_1', 'link', 'https://wa.me/573125841068', 2048, true),
('/', 'dual-section.text_4', 'text', 'Quiero saber más', 500, true),
('/', 'dual-section.image_2', 'image', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1200&auto=format&fit=crop', 2048, false),
('/', 'dual-section.text_5', 'text', 'Próximamente', 500, true),
('/', 'dual-section.text_6', 'text', 'IBRACO Viajes', 500, true),
('/', 'dual-section.textarea_3', 'textarea', 'Experiencias culturales, académicas e inmersivas para viajar, estudiar y vivir Brasil.', 3000, true),
('/', 'dual-section.link_2', 'link', 'https://wa.me/573125841068', 2048, true),
('/', 'dual-section.text_7', 'text', 'Quiero saber más', 500, true),
('/', 'final-cta.text_1', 'text', 'O BRASIL É AQUI.', 500, true),
('/', 'final-cta.textarea_1', 'textarea', 'Empieza hoy a aprender portugués con IBRACO y descubre Brasil a través de su idioma, su cultura y su comunidad.', 3000, true),
('/', 'final-cta.link_1', 'link', '/cursos', 2048, true),
('/', 'final-cta.text_2', 'text', 'Ver cursos', 500, true),
('/sedes', 'inner-hero.text_1', 'text', 'Bogotá y modalidad virtual', 500, true),
('/sedes', 'inner-hero.text_2', 'text', 'Sedes IBRACO', 500, true),
('/sedes', 'inner-hero.textarea_1', 'textarea', 'Estudia donde mejor te quede y vive la experiencia IBRACO de manera presencial en Bogotá o desde cualquier ciudad.', 3000, true),
('/sedes', 'inner-hero.link_1', 'link', '/cursos', 2048, true),
('/sedes', 'inner-hero.text_3', 'text', 'Ver cursos', 500, true),
('/sedes', 'inner-grid.image_1', 'image', '', 2048, false),
('/sedes', 'inner-grid.text_1', 'text', '🌿', 500, true),
('/sedes', 'inner-grid.text_2', 'text', 'Sede Norte', 500, true),
('/sedes', 'inner-grid.textarea_1', 'textarea', 'Una sede cercana, tradicional y llena de vida cultural para aprender portugués en comunidad.', 3000, true),
('/sedes', 'inner-grid.link_1', 'link', '/cursos?sede=Norte#cursos-disponibles', 2048, true),
('/sedes', 'inner-grid.text_3', 'text', 'Ver cursos en Norte →', 500, true),
('/sedes', 'inner-grid.image_2', 'image', '', 2048, false),
('/sedes', 'inner-grid.text_4', 'text', '🏙️', 500, true),
('/sedes', 'inner-grid.text_5', 'text', 'Sede Centro · CityU', 500, true),
('/sedes', 'inner-grid.textarea_2', 'textarea', 'Un espacio contemporáneo y universitario en el centro estudiantil de Bogotá.', 3000, true),
('/sedes', 'inner-grid.link_2', 'link', '/cursos?sede=Centro#cursos-disponibles', 2048, true),
('/sedes', 'inner-grid.text_6', 'text', 'Ver cursos en Centro →', 500, true),
('/sedes', 'inner-grid.image_3', 'image', '', 2048, false),
('/sedes', 'inner-grid.text_7', 'text', '🌎', 500, true),
('/sedes', 'inner-grid.text_8', 'text', 'IBRACO Virtual', 500, true),
('/sedes', 'inner-grid.textarea_3', 'textarea', 'Clases en vivo con profesores de IBRACO, estés donde estés, con la misma metodología y acompañamiento.', 3000, true),
('/sedes', 'inner-grid.link_3', 'link', '/cursos?modalidad=Virtual#cursos-disponibles', 2048, true),
('/sedes', 'inner-grid.text_9', 'text', 'Ver cursos virtuales →', 500, true),
('/sedes', 'inner-cta.text_1', 'text', 'Una sola comunidad', 500, true),
('/sedes', 'inner-cta.textarea_1', 'textarea', 'Presencial en Bogotá o virtual desde cualquier ciudad: estudias con la misma identidad académica y cultural de IBRACO.', 3000, true),
('/sedes', 'inner-cta.link_1', 'link', '/cursos', 2048, true),
('/sedes', 'inner-cta.text_2', 'text', 'Elige tu curso', 500, true)
on conflict(page_path, field_key) do update set kind=excluded.kind, default_value=excluded.default_value, max_length=excluded.max_length, is_required=excluded.is_required;
insert into public.site_content_documents(page_path,draft_content)
 select page_path,jsonb_object_agg(field_key,default_value) from public.site_content_fields group by page_path
 on conflict(page_path) do nothing;
insert into public.site_content_revisions(page_path,version,content,action)
 select page_path,version,draft_content,'initial' from public.site_content_documents where version=0
 on conflict(page_path,version) do nothing;

create or replace function public.site_content_can_edit() returns boolean
 language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.admin_profiles where user_id = (select auth.uid()) and (can_content is true or is_superadmin is true));
$$;
revoke all on function public.site_content_can_edit() from public, anon;
grant execute on function public.site_content_can_edit() to authenticated;

alter table public.site_content_fields enable row level security;
alter table public.site_content_documents enable row level security;
alter table public.site_content_public enable row level security;
alter table public.site_content_revisions enable row level security;
revoke all on public.site_content_fields, public.site_content_documents, public.site_content_public, public.site_content_revisions from public, anon, authenticated;
grant select on public.site_content_public to anon, authenticated;
grant select on public.site_content_documents, public.site_content_revisions to authenticated;
drop policy if exists site_content_public_read on public.site_content_public;
create policy site_content_public_read on public.site_content_public for select to anon, authenticated using(true);
drop policy if exists site_content_editor_read on public.site_content_documents;
create policy site_content_editor_read on public.site_content_documents for select to authenticated using((select public.site_content_can_edit()));
drop policy if exists site_content_history_read on public.site_content_revisions;
create policy site_content_history_read on public.site_content_revisions for select to authenticated using((select public.site_content_can_edit()));

create or replace function public.site_content_normalize(p_page_path text, p_content jsonb) returns jsonb
 language plpgsql security definer set search_path = '' as $$
declare f record; val text; result jsonb; k text;
begin
 if p_page_path not in ('/','/sedes') or p_content is null or jsonb_typeof(p_content) <> 'object' or octet_length(p_content::text) > 300000 then
  raise exception 'Contenido no válido.' using errcode='22023';
 end if;
 for k in select jsonb_object_keys(p_content) loop
  if not exists(select 1 from public.site_content_fields where page_path=p_page_path and field_key=k) then
   raise exception 'Campo no permitido: %', k using errcode='22023';
  end if;
 end loop;
 select jsonb_object_agg(field_key,default_value) into result from public.site_content_fields where page_path=p_page_path;
 if result is null then raise exception 'Página no habilitada.' using errcode='22023'; end if;
 result := result || p_content;
 for f in select * from public.site_content_fields where page_path=p_page_path loop
  if jsonb_typeof(result->f.field_key) <> 'string' then raise exception 'El campo % debe ser texto.', f.field_key using errcode='22023'; end if;
  val := result->>f.field_key;
  if length(val) > f.max_length or (f.is_required and btrim(val)='') then
   raise exception 'Revisa el contenido del campo %.', f.field_key using errcode='22023';
  end if;
  if f.kind in ('link','image') and val <> '' then
   if val ~ '[[:space:][:cntrl:]]' or position(chr(92) in val)>0 or
      not ((left(val,1)='/' and left(val,2)<>'//') or
           (val ~ '^https://[^/?#@]+([/?#].*)?$') or
           (f.kind='link' and val ~ '^#[a-zA-Z][a-zA-Z0-9_-]*$')) then
    raise exception 'Dirección no válida en %.', f.field_key using errcode='22023';
   end if;
  elsif f.kind='link' and val='' then raise exception 'Falta el destino del enlace.' using errcode='22023';
  end if;
 end loop;
 return result;
end;
$$;
revoke all on function public.site_content_normalize(text,jsonb) from public, anon, authenticated;

-- Every mutation, including restore and publish, checks auth and the expected version.
-- FOR UPDATE makes the check and the write atomic; publication and its history commit together.
create or replace function public.site_content_write(
 p_page_path text, p_expected_version bigint, p_action text,
 p_content jsonb default null, p_revision_id uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare d public.site_content_documents%rowtype; c jsonb;
begin
 if auth.uid() is null or not public.site_content_can_edit() then raise exception 'No tienes permiso para editar contenidos.' using errcode='42501'; end if;
 if p_action is null or p_action not in ('save','publish','restore') then raise exception 'Acción no válida.' using errcode='22023'; end if;
 select * into d from public.site_content_documents where page_path=p_page_path for update;
 if not found then raise exception 'Página no habilitada.' using errcode='22023'; end if;
 if p_expected_version is null or d.version <> p_expected_version then raise exception 'Otra persona cambió esta página. Recarga antes de guardar.' using errcode='40001'; end if;
 if p_action='restore' then
  select content into c from public.site_content_revisions where id=p_revision_id and page_path=p_page_path;
  if not found then raise exception 'Versión no encontrada.' using errcode='22023'; end if;
 elsif p_action='publish' then c := d.draft_content;
 else c := p_content;
 end if;
 c := public.site_content_normalize(p_page_path,c);
 d.version := d.version+1;
 if p_action='publish' then
  insert into public.site_content_public(page_path,content,version,published_at) values(p_page_path,c,d.version,now())
   on conflict(page_path) do update set content=excluded.content, version=excluded.version, published_at=excluded.published_at;
  d.published_version := d.version; d.published_at := now();
 end if;
 update public.site_content_documents set draft_content=c, version=d.version,
  published_version=d.published_version,published_at=d.published_at, updated_at=now(),updated_by=auth.uid()
  where page_path=p_page_path returning * into d;
 insert into public.site_content_revisions(page_path,version,content,action,created_by) values(p_page_path,d.version,c,p_action,auth.uid());
 return to_jsonb(d);
end;
$$;
revoke all on function public.site_content_write(text,bigint,text,jsonb,uuid) from public, anon;
grant execute on function public.site_content_write(text,bigint,text,jsonb,uuid) to authenticated;

-- Uploaded files use unique paths; replacing a file cannot silently rewrite old revisions.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('site-content','site-content',true,5242880,array['image/jpeg','image/png','image/webp','image/avif'])
 on conflict(id) do nothing;
drop policy if exists site_content_upload on storage.objects;
create policy site_content_upload on storage.objects for insert to authenticated
 with check(bucket_id='site-content' and (storage.foldername(name))[1]=(select auth.uid())::text and (select public.site_content_can_edit()));
commit;
