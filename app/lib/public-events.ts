import { supabase } from "../../lib/supabase";
import { normalize } from "./course-catalog";
import { eventTerms } from "./culture-topics";
export type PublicEvent = { id:number; slug:string; name:string; description:string|null; event_date:string; start_time:string|null; end_time:string|null; venue:string|null; address:string|null; price:number|null; capacity:number|null; status:string|null; image_url:string|null; };
export function filterEvents(events: PublicEvent[], topic: string) {
 if (!topic) return events;
 const key = normalize(topic).replace(/ /g,"-");
 const terms = eventTerms[key] || [normalize(topic)];
 return events.filter(event => {const text = normalize(`${event.name} ${event.description || ""}`);return terms.some(term => new RegExp(`(^| )${term}( |$)`).test(text));});
}
export async function loadPublicEvents() {
 const today = new Intl.DateTimeFormat("en-CA", {timeZone:"America/Bogota",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
 const {data,error} = await supabase.from("events").select("*").eq("status","published").gte("event_date",today).order("event_date",{ascending:true});
 return {events: (error ? [] : data || []) as PublicEvent[], error};
}
