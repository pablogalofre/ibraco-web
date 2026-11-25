import {randomUUID} from 'node:crypto';
import {packageDb} from './packages-server';
import {reservationContexts,reservationNote} from './hubspot-reservation-context';
type Db=ReturnType<typeof packageDb>;
class NoteError extends Error{constructor(message:string,public uncertain=false){super(message);}}
const stale=(v:string|null)=>!v||Date.parse(v)<Date.now()-300000;
export async function processReservationNote(options:{id?:string;orderNumber?:string},db:Db=packageDb(),fetcher:typeof fetch=fetch){
 const token=process.env.HUBSPOT_ACCESS_TOKEN;if(!token)return {processed:false};
 let query=db.from('hubspot_deliveries').select('id,order_number,payload,created_at,status,contact_id,reservation_note_status,reservation_note_attempts,reservation_note_locked_at,reservation_note_lock_token');
 query=options.id?query.eq('id',options.id):query.eq('order_number',options.orderNumber||'');
 const {data:j,error}=await query.maybeSingle();
 if(error){console.error('HUBSPOT_NOTE_SCHEMA',error.code);return {processed:false};}
 if(!j||!j.order_number||!['created','existing'].includes(j.status)||!/^[0-9]+$/.test(j.contact_id||'')||j.reservation_note_status==='sent')return {processed:false};
 if(j.reservation_note_status==='processing'&&!stale(j.reservation_note_locked_at))return {processed:false};
 const context=(await reservationContexts(db,[j])).get(j.id)!;
 if(context.kind!=='package')return {processed:false};
 const reconcileOnly=['review','processing'].includes(j.reservation_note_status);
 if(!reconcileOnly&&(j.reservation_note_attempts||0)>=8)return {processed:false};
 const lock=randomUUID();
 const claimed=await db.from('hubspot_deliveries').update({reservation_note_status:'processing',reservation_note_attempts:(j.reservation_note_attempts||0)+1,reservation_note_lock_token:lock,reservation_note_locked_at:new Date().toISOString()}).eq('id',j.id).eq('reservation_note_status',j.reservation_note_status).eq('reservation_note_attempts',j.reservation_note_attempts).select('id');
 if(claimed.error||!claimed.data?.length)return {processed:false};
 let update:Record<string,unknown>;
 const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
 try{
  if(reconcileOnly){
   const found=await findReservationNote(j.contact_id,j.id,headers,fetcher);
   update=found?{reservation_note_status:'sent',reservation_note_id:found,reservation_note_message:'Detalle localizado en el historial del contacto.'}:{reservation_note_status:'review',reservation_note_message:'No se confirmó la nota. Revisar el historial de HubSpot antes de cualquier reenvío.'};
  }else{
   const body=reservationNote(j,context);
   let r:Response;
   try{r=await fetcher('https://api.hubapi.com/crm/v3/objects/notes',{method:'POST',headers,redirect:'error',signal:AbortSignal.timeout(10000),body:JSON.stringify({properties:{hs_timestamp:new Date(j.created_at).toISOString(),hs_note_body:body},associations:[{to:{id:j.contact_id},types:[{associationCategory:'HUBSPOT_DEFINED',associationTypeId:202}]}]})});}catch{throw new NoteError('Respuesta incierta al enviar el detalle. Comprobar el historial antes de reenviar.',true);}
   if(!r.ok)throw new NoteError(r.status===401||r.status===403?'HubSpot no autorizó la nota. Revisar los permisos de la integración.':r.status===429?'HubSpot limitó el envío. Reintentar más tarde.':r.status===400?'HubSpot rechazó el detalle. Revisar la integración.':'HubSpot no confirmó la nota. Comprobar el historial antes de reenviar.',r.status!==401&&r.status!==403&&r.status!==429&&r.status!==400);
   let id='';try{id=String((await r.json()).id||'');}catch{}
   if(!/^[0-9]+$/.test(id))throw new NoteError('Respuesta incierta al guardar la nota. Comprobar el historial antes de reenviar.',true);
   update={reservation_note_status:'sent',reservation_note_id:id,reservation_note_message:'Paquete reservado enviado al historial del contacto.'};
  }
 }catch(e){const uncertain=reconcileOnly||(e instanceof NoteError&&e.uncertain);update={reservation_note_status:uncertain?'review':(j.reservation_note_attempts||0)>=7?'review':'error',reservation_note_message:e instanceof Error?e.message:'No fue posible enviar el detalle.'};}
 const saved=await db.from('hubspot_deliveries').update({...update,reservation_note_locked_at:null,reservation_note_lock_token:null}).eq('id',j.id).eq('reservation_note_lock_token',lock);
 if(saved.error)console.error('HUBSPOT_NOTE_SAVE',saved.error.code);
 return {processed:true};
}
// Una respuesta incierta sólo se consulta. Nunca vuelve a crear automáticamente.
async function findReservationNote(contact:string,delivery:string,headers:Record<string,string>,fetcher:typeof fetch){
 const marker='IBRACO-RESERVA-'+delivery,deadline=Date.now()+30000;let after='';
 for(let page=0;page<5;page++){
  if(Date.now()>deadline)throw new NoteError('La revisión de notas quedó incompleta.',true);
  const r=await fetcher('https://api.hubapi.com/crm/v3/objects/contacts/'+contact+'/associations/notes?limit=100'+(after?'&after='+encodeURIComponent(after):''),{method:'GET',headers,redirect:'error',cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!r.ok)throw new NoteError('No se pudo consultar el historial de notas. Revisar permisos de HubSpot.',true);
  const body=await r.json();if(!Array.isArray(body.results))throw new NoteError('No se pudo validar el historial de notas.',true);
  const ids=body.results.map((v:{id:string})=>String(v.id)).filter((id:string)=>/^[0-9]+$/.test(id));
  if(ids.length){
   const notes=await fetcher('https://api.hubapi.com/crm/v3/objects/notes/batch/read',{method:'POST',headers,redirect:'error',signal:AbortSignal.timeout(5000),body:JSON.stringify({properties:['hs_note_body'],inputs:ids.map((id:string)=>({id}))})});
   if(!notes.ok)throw new NoteError('No se pudo verificar el contenido de las notas.',true);
   const b=await notes.json();if(!Array.isArray(b.results))throw new NoteError('Historial incompleto.',true);
   const found=b.results.find((n:{properties?:{hs_note_body?:string}})=>n.properties?.hs_note_body?.includes(marker));if(found&&/^[0-9]+$/.test(String(found.id)))return String(found.id);
  }
  after=String(body.paging?.next?.after||'');if(!after)return null;
 }
 throw new NoteError('El contacto tiene más notas de las que se pudieron revisar. Revisar manualmente.',true);
}
