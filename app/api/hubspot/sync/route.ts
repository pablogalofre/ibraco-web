import {staff,sameOrigin} from '@/app/lib/packages-server';
import {processDelivery} from '@/app/lib/hubspot-deliveries';
import {reservationContexts} from '@/app/lib/hubspot-reservation-context';
import {processReservationNote} from '@/app/lib/hubspot-reservation-notes';
export const maxDuration=60;
const headers={'Cache-Control':'no-store, private',Vary:'Authorization'};
export async function GET(req:Request){try{
 const {db,profile}=await staff(req,'leads');
 const {data,error}=await db.from('hubspot_deliveries').select('id,order_number,email,payload,status,attempts,message,created_at,updated_at,next_attempt_at,contact_id,reservation_note_status,reservation_note_attempts,reservation_note_message,reservation_note_locked_at').order('created_at',{ascending:false}).limit(100);
 if(error)return Response.json({error:'Falta ejecutar INSTALAR_DETALLE_RESERVAS.sql en Supabase IBRACO.'},{status:503,headers});
 const contexts=await reservationContexts(db,data||[]);
 // No devolver el payload interno, IP, claves ni tokens de la reserva.
 const deliveries=(data||[]).map(({payload,...row})=>({...row,selection:contexts.get(row.id)}));
 return Response.json({deliveries,configured:!!process.env.HUBSPOT_ACCESS_TOKEN,canProcess:!!profile.is_superadmin},{headers});
 }catch{return Response.json({error:'No fue posible consultar. Revisa tu sesión, permisos de Marketing y contenidos y conexión.'},{status:403,headers});}}
export async function POST(req:Request){try{
 sameOrigin(req);const {db,profile}=await staff(req,'read');if(!profile.is_superadmin)return Response.json({error:'Acceso exclusivo de superadministrador.'},{status:403,headers});
 if(!process.env.HUBSPOT_ACCESS_TOKEN)return Response.json({error:'Falta HUBSPOT_ACCESS_TOKEN.'},{status:503,headers});
 const raw=await req.text();if(raw.length>300)throw Error();const b=JSON.parse(raw);
 if(typeof b.id!=='string'||!/^[a-f0-9-]{36}$/.test(b.id)||!['contact','note'].includes(b.action||'contact'))throw Error();
 if(b.action==='note'){const result=await processReservationNote({id:b.id},db);return Response.json({success:true,processed:result.processed},{headers});}
 const {data:job,error}=await db.from('hubspot_deliveries').select('id,status,locked_at,attempts').eq('id',b.id).single();
 if(error||!job)throw Error();
 const stale=job.status==='processing'&&Date.parse(job.locked_at||'')<Date.now()-300000;
 if(!['pending','error'].includes(job.status)&&!stale)return Response.json({error:'Este contacto ya fue procesado, está en curso o requiere revisar el mapeo.'},{status:409,headers});
 if(job.attempts>=8)return Response.json({error:'Se alcanzó el límite de intentos. Revisa la configuración.'},{status:409,headers});
 const {error:reset}=await db.from('hubspot_deliveries').update({next_attempt_at:new Date().toISOString()}).eq('id',job.id).eq('status',job.status);
 if(reset)throw Error();await processDelivery({id:job.id},db);return Response.json({success:true},{headers});
 }catch{return Response.json({error:'No fue posible procesar el envío. Revisa la sesión y vuelve a consultar.'},{status:400,headers});}}
