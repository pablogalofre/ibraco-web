import {after} from 'next/server';
import {createHmac} from 'node:crypto';
import {packageDb,sameOrigin} from '@/app/lib/packages-server';
import {mapCourse} from '@/app/lib/hubspot-contact-sync';
import {processDelivery} from '@/app/lib/hubspot-deliveries';
export const maxDuration=60;
const headers={'Cache-Control':'no-store'};
export async function POST(req:Request){
 try{
  sameOrigin(req);if(Number(req.headers.get('content-length')||0)>3000)return Response.json({error:'Solicitud demasiado extensa.'},{status:413,headers});
  const raw=await req.text();if(raw.length>3000)return Response.json({error:'Solicitud demasiado extensa.'},{status:413,headers});
  const b=JSON.parse(raw);
  if(b.website)return Response.json({success:true},{headers});
  if(b.consent!==true||typeof b.requestId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.requestId))throw Error();
  for(const field of ['firstname','lastname','email','phone','courseSlug'])if(typeof b[field]!=='string'||!b[field].trim()||b[field].length>180)throw Error();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)||!/^[-+()\d\s.]{7,40}$/.test(b.phone))throw Error();
  const db=packageDb();const {data:course,error:cError}=await db.from('courses').select('name,campus,modality,days').eq('slug',b.courseSlug).eq('status','published').maybeSingle();
  if(cError||!course)return Response.json({error:'El curso no está disponible. Consulta la oferta de cursos.'},{status:400,headers});
  let mapped;try{mapped=mapCourse(course);}catch{return Response.json({error:'Para este programa, solicita asesoría por WhatsApp.'},{status:400,headers});}
  const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!secret)throw Error();
  // Sólo se conserva el hash del IP, con clave de servidor; nunca se devuelve al cliente.
  const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||'unknown';
  const ipHash=createHmac('sha256',secret).update(ip).digest('hex');
  const payload={email:b.email.trim().toLowerCase(),firstname:b.firstname.trim(),lastname:b.lastname.trim(),phone:b.phone.trim(),...mapped,courseSlug:b.courseSlug};
  const {data:id,error}=await db.rpc('submit_ibraco_course_lead',{p_request:b.requestId,p_payload:payload,p_ip:ipHash});
  if(error)return Response.json({error:error.message?.includes('LEAD_RATE_LIMIT')?'Ya recibimos solicitudes recientes. Intenta más tarde o escríbenos por WhatsApp.':'No fue posible guardar tu solicitud. Intenta nuevamente o escríbenos por WhatsApp.'},{status:error.message?.includes('LEAD_RATE_LIMIT')?429:503,headers});
  after(async()=>{await processDelivery({id:String(id)});});
  return Response.json({success:true},{status:202,headers});
 }catch{return Response.json({error:'Revisa los datos y autoriza el contacto para enviar la solicitud.'},{status:400,headers});}
}
