// Servidor: únicamente consulta por correo y creación de contactos nuevos.
// Nunca PATCH/DELETE, cambios de propietario, estados existentes ni workflows.
export type ContactInput={email:string;firstname:string;lastname:string;phone:string;program:string;campus:string};
export const CONTACT_PROGRAMS=['Cursos Intensivos','Cursos Semi Intensivos Sábados','Cursos Semi Intensivos Entre Semana','Otros Cursos','Preparatorio Celpe Bras','Examen Celpe-Bras'];
export class DeliveryError extends Error {constructor(public code:string,public review=false){super(code);}}
export function normalizeContactText(v:unknown){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
export function mapCourse(course:{name?:unknown;campus?:unknown;modality?:unknown;days?:unknown;frequency?:unknown}){
 const name=normalizeContactText(course.name),frequency=normalizeContactText(course.frequency);
 const text=name+' '+frequency;
 let program='';
 if(name.includes('celpe'))program=name.includes('examen')?'Examen Celpe-Bras':'Preparatorio Celpe Bras';
 else if(text.includes('semi')){
  const days=Array.isArray(course.days)?course.days.map(normalizeContactText):[];
  if(text.includes('sabado')||(days.length===1&&['sabado','sabados','sat','saturday'].includes(days[0])))program='Cursos Semi Intensivos Sábados';
  else if(frequency==='semi intensivo'||text.includes('entre semana')||days.some(d=>['lunes','martes','miercoles','jueves','viernes'].includes(d)))program='Cursos Semi Intensivos Entre Semana';
 }else if(text.includes('intensivo'))program='Cursos Intensivos';
 // Sin equivalencias inventadas para particulares, empresas o cursos desconocidos.
 const place=normalizeContactText(course.campus),modality=normalizeContactText(course.modality);
 const campus=modality.includes('virtual')||place==='virtual'?'Virtual':(['centro','sede centro','cityu','sede cityu'].includes(place))?'Centro':(['norte','sede norte'].includes(place))?'Norte':'';
 if(!program||!campus)throw new DeliveryError('mapping',true);
 return {program,campus};
}
export async function syncNewContact(token:string,input:ContactInput,fetcher:typeof fetch=fetch){
 if(!token)throw new DeliveryError('configuration');
 const email=input.email.trim().toLowerCase();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!CONTACT_PROGRAMS.includes(input.program)||!['Centro','Norte','Virtual'].includes(input.campus))throw new DeliveryError('mapping',true);
 const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
 const options={headers,cache:'no-store' as const,redirect:'error' as const};
 let existing:Response;
 try{existing=await fetcher('https://api.hubapi.com/crm/v3/objects/contacts/'+encodeURIComponent(email)+'?idProperty=email&properties=hs_lead_status,hubspot_owner_id',{...options,method:'GET',signal:AbortSignal.timeout(10000)});}catch{throw new DeliveryError('lookup');}
 if(existing.ok){const b=await existing.json();if(!b.id)throw new DeliveryError('lookup');return {status:'existing' as const,id:String(b.id)};}
 if(existing.status!==404)throw new DeliveryError(existing.status===401||existing.status===403?'authorization':existing.status===429?'rate_limit':'lookup');
 let response:Response;
 try{response=await fetcher('https://api.hubapi.com/crm/v3/objects/contacts',{...options,method:'POST',signal:AbortSignal.timeout(10000),body:JSON.stringify({properties:{email,firstname:input.firstname.slice(0,120),lastname:input.lastname.slice(0,120),phone:input.phone.slice(0,60),hs_lead_status:'NEW',programa_de_interes:input.program,sedepauta:input.campus}})});}catch{throw new DeliveryError('uncertain');}
 // Una carrera con otra fuente no autoriza modificar el registro que acaba de aparecer.
 if(response.status===409)throw new DeliveryError('conflict');
 if(!response.ok)throw new DeliveryError(response.status===401||response.status===403?'authorization':response.status===429?'rate_limit':response.status===400?'properties':'uncertain',response.status===400);
 try{const b=await response.json();if(!b.id)throw Error();return {status:'created' as const,id:String(b.id)};}catch{throw new DeliveryError('uncertain');}
}
