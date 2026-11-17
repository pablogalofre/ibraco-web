import {createClient} from '@supabase/supabase-js';
import document from '@/app/lib/intranet-proposal-document';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','Vary':'Authorization','X-Content-Type-Options':'nosniff'};
export async function GET(req:Request){try{
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token)return Response.json({error:'Inicia sesión'},{status:401,headers});
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}});
 const {data:{user},error}=await db.auth.getUser(token);
 if(error||!user)return Response.json({error:'Inicia sesión'},{status:401,headers});
 const {data:access,error:problem}=await db.rpc('intranet_access');
 if(problem||!access?.allowed)return Response.json({error:'Acceso a Intranet requerido'},{status:403,headers});
 return new Response(document,{headers:{...headers,'Content-Type':'text/html;charset=utf-8','Content-Security-Policy':"sandbox allow-scripts allow-downloads allow-modals"}});
 }catch{return Response.json({error:'No fue posible comprobar el acceso'},{status:503,headers});}}
