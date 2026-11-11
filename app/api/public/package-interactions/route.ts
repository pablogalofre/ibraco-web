import {packageDb,sameOrigin} from '@/app/lib/packages-server';
export async function POST(req:Request){try{
 sameOrigin(req);const raw=await req.text();if(raw.length>500)return new Response(null,{status:413});const b=JSON.parse(raw);
 const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
 if(!uuid.test(b.id)||!['page_view','course_entry','reserve_click'].includes(b.kind)|| (b.kind==='reserve_click'?!uuid.test(b.offerId):b.offerId!==null))return new Response(null,{status:400});
 const {error}=await packageDb().from('package_interactions').upsert({id:b.id,kind:b.kind,offer_id:b.offerId},{onConflict:'id',ignoreDuplicates:true});
 return new Response(null,{status:error?503:204});
 }catch{return new Response(null,{status:400});}}
