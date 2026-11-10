import {createClient} from '@supabase/supabase-js';
import {createHash,timingSafeEqual} from 'node:crypto';
export function packageDb(){return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});}
export function tokenHash(token:string){return createHash('sha256').update(token).digest('hex');}
export function validToken(token:unknown,hash:string){if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return false; return timingSafeEqual(Buffer.from(tokenHash(token)),Buffer.from(hash));}
export function sameOrigin(req:Request,contentType="application/json"){
 const origin=req.headers.get('origin'),site=req.headers.get('sec-fetch-site'),host=req.headers.get('host')||new URL(req.url).host;
 if(site==='cross-site'||site==='same-site')throw Error('Origen no permitido');
 if(origin){const u=new URL(origin);if(!['http:','https:'].includes(u.protocol)||u.host!==host)throw Error('Origen no permitido');}
 else if(site!=='same-origin')throw Error('Origen no permitido');
 if(!req.headers.get('content-type')?.startsWith(contentType))throw Error('Formato no permitido');
}
export async function staff(req:Request,permission:'courses'|'accounting'|'read'='courses'){
 const db=packageDb(), token=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';
 const {data:{user},error}=await db.auth.getUser(token);if(error||!user)throw Error('Inicia sesión como administrador');
 // Leer permisos con la misma identidad/RLS que el panel, tras verificar el token.
 const publicKey=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!publicKey)throw Error('Falta configurar la clave pública de Supabase');
 const userDb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,publicKey,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}});
 const {data:p,error:profileError}=await userDb.from('admin_profiles').select('can_courses,can_accounting,is_superadmin').eq('user_id',user.id).single();
 if(profileError){console.error('PACKAGE_PROFILE_LOOKUP',profileError.code);throw Error('No fue posible consultar tus permisos. Cierra sesión e ingresa nuevamente.');}
 if(!p||!(p.is_superadmin||(permission==='accounting'?p.can_accounting:permission==='read'?(p.can_courses||p.can_accounting):p.can_courses)))throw Error('No tienes permisos para esta acción');
 return {db,user,profile:p};
}
export async function packageSale(orderNumber:string,token:unknown){const db=packageDb();const {data:o}=await db.from('orders').select('*').eq('order_number',orderNumber).eq('product_type','package').single();if(!o)throw Error('Reserva no encontrada');const {data:s}=await db.from('package_sales').select('*').eq('order_id',o.id).single();if(!s||!validToken(token,s.token_hash))throw Error('Enlace de reserva inválido');return {db,order:o,sale:s};}
export function fail(e:unknown,status=400){console.error('Paquetes:',e instanceof Error?e.message:'Error');return Response.json({error:e instanceof Error?e.message:'No fue posible completar la operación'},{status,headers:{'Cache-Control':'no-store'}});}
