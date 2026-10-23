import { loadPublicEvents } from "../lib/public-events";
export default async function PublicEventList() {
 const {events,error} = await loadPublicEvents();
 return <section id="proximos-eventos" className="agenda-events-grid">
 {error ? <div className="inner-card"><h2>No pudimos cargar la agenda</h2><p>Intenta nuevamente o consulta con IBRACO.</p><a className="text-link" href="https://wa.me/573125841068">Consultar agenda →</a></div> : !events.length ? <div className="inner-card"><h2>Pronto anunciaremos nuevas actividades</h2><p>Consulta con nuestro equipo por la próxima programación cultural.</p><a className="text-link" href="https://wa.me/573125841068">Consultar programación →</a></div> : events.map(event => <article className="agenda-event-card" key={event.id}>
 {event.image_url && <img src={event.image_url} alt="" style={{width:"100%",height:240,objectFit:"cover"}}/>}<div className="agenda-event-content"><p><time dateTime={event.event_date}>{new Intl.DateTimeFormat("es-CO",{dateStyle:"long",timeZone:"UTC"}).format(new Date(event.event_date+"T00:00:00Z"))}</time>{event.start_time ? ` · ${event.start_time.slice(0,5)}` : ""}</p><h2>{event.name}</h2><p>{event.description}</p><p>{event.venue}</p><a className="btn btn-primary" href={`/eventos/${encodeURIComponent(event.slug)}`}>Ver evento e inscripción</a></div></article>)}
 </section>;
}
