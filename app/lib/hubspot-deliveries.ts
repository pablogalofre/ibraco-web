import {packageDb} from './packages-server';
import {DeliveryError,mapCourse,syncNewContact,type ContactInput} from './hubspot-contact-sync';
type Db=ReturnType<typeof packageDb>;
type Job={id:string;order_number:string|null;payload:any;lock_token:string;attempts:number};
const MESSAGES:Record<string,string>={configuration:'Falta configurar HUBSPOT_ACCESS_TOKEN.',mapping:'Revisar la equivalencia de programa y sede antes de enviar.',lookup:'No fue posible comprobar el contacto. No se intentó crearlo.',authorization:'Revisar la clave y los permisos de HubSpot.',rate_limit:'HubSpot limitó las consultas. Reintentar más tarde.',uncertain:'La respuesta no confirmó la creación. El siguiente intento consultará primero el correo.',conflict:'El correo apareció durante el envío. El siguiente intento consultará el registro sin modificarlo.',properties:'HubSpot rechazó los campos. Revisar el mapeo.',database:'No fue posible consultar el registro de origen.'};
async function resolveInput(db:Db,job:Job):Promise<ContactInput>{
 if(!job.order_number){if(!job.payload)throw new DeliveryError('mapping',true);return job.payload as ContactInput;}
 const {data:o,error}=await db.from('orders').select('id,product_type,course_id,first_name,last_name,email,phone,accepted_privacy,campus,modality').eq('order_number',job.order_number).single();
 if(error||!o)throw new DeliveryError('database');
 if(o.accepted_privacy!==true)throw new DeliveryError('mapping',true);
 let mapped:{program:string;campus:string};
 if(o.product_type==='course'){
  const {data:c,error:e}=await db.from('courses').select('name,campus,modality,days').eq('id',o.course_id).single();
  if(e||!c)throw new DeliveryError('database');mapped=mapCourse(c);
 }else if(o.product_type==='package'){
  const {data:s,error:e}=await db.from('package_sales').select('snapshot,frequency').eq('order_id',o.id).single();
  if(e||!s)throw new DeliveryError('database');
  // El paquete prepara niveles regulares; la preparación CELPE adicional no cambia su intensidad.
  mapped=mapCourse({name:'',frequency:s.frequency,campus:s.snapshot?.campus,modality:o.modality});
 }else throw new DeliveryError('mapping',true);
 return {email:o.email,firstname:o.first_name,lastname:o.last_name,phone:o.phone,...mapped};
}
export async function processDelivery(options:{orderNumber?:string;id?:string}={},db:Db=packageDb(),fetcher:typeof fetch=fetch){
 // Si falta la clave, no consumir intentos ni sacar el trabajo de la cola.
 const token=process.env.HUBSPOT_ACCESS_TOKEN;if(!token)return {processed:false};
 const {data,error}=await db.rpc('claim_ibraco_hubspot',{p_order:options.orderNumber||null,p_id:options.id||null});
 if(error){console.error('HUBSPOT_QUEUE_CLAIM',error.code);return {processed:false};}
 const job=(data as Job[]|null)?.[0];if(!job)return {processed:false};
 let update:Record<string,unknown>;
 try{const result=await syncNewContact(token,await resolveInput(db,job),fetcher);update={status:result.status,contact_id:result.id,message:result.status==='created'?'Contacto nuevo creado; el workflow existente gestiona el reparto y la bienvenida.':'El correo ya existe. Se conservó toda su información.'};}
 catch(e){const code=e instanceof DeliveryError?e.code:'database';const review=(e instanceof DeliveryError&&e.review)||job.attempts>=8;update={status:review?'review':'error',message:MESSAGES[code]||MESSAGES.database,next_attempt_at:new Date(Date.now()+Math.min(60,Math.pow(2,job.attempts))*60000).toISOString()};}
 const {error:saveError}=await db.from('hubspot_deliveries').update({...update,locked_at:null,lock_token:null,updated_at:new Date().toISOString()}).eq('id',job.id).eq('lock_token',job.lock_token);
 if(saveError)console.error('HUBSPOT_QUEUE_SAVE',saveError.code);
 return {processed:true};
}
