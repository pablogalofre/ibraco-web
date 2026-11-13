import {createClient} from '@supabase/supabase-js';
import {intranetCsv,HourRecord} from '@/app/lib/intranet-export';
export async function GET(req:Request){try{
 const token=req.headers.get('authorization')?.replace(/^Bearer /,'');if(!token)return Response.json({error:'Inicia sesión'},{status:401});
 const db=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:`Bearer ${token}`}}});
 const {data:{user},error}=await db.auth.getUser(token);if(error||!user)return Response.json({error:'Inicia sesión'},{status:401});
 const {data:access,error:ae}=await db.rpc('intranet_access');if(ae||access?.role!=='administrativo')return Response.json({error:'Solo administrativos autorizados'},{status:403});
 const url=new URL(req.url),from=url.searchParams.get('from')||'',to=url.searchParams.get('to')||'';if(!/^\d{4}-\d{2}-\d{2}$/.test(from)||!/^\d{4}-\d{2}-\d{2}$/.test(to))return Response.json({error:'Selecciona las fechas'},{status:400});
 const {data,error:problem}=await db.rpc('intranet_list',{p_from:from,p_to:to});if(problem) return Response.json({error:'No fue posible consultar el período'},{status:400});
 return new Response(intranetCsv(data.records as HourRecord[]),{headers:{'Content-Type':'text/csv;charset=utf-8','Content-Disposition':`attachment; filename="IBRACO-horas-${from}-${to}.csv"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return Response.json({error:'No fue posible exportar'},{status:400,headers:{'Cache-Control':'no-store'}});}}
