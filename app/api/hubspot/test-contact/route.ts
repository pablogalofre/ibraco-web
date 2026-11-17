import {staff,sameOrigin} from '@/app/lib/packages-server';
import {createTestContact} from '@/app/lib/hubspot-test-contact';
export const runtime='nodejs';
const headers={'Cache-Control':'no-store, private','Vary':'Authorization'};
export async function POST(req:Request){
 try{const {profile}=await staff(req,'read');if(!profile.is_superadmin)throw Error();}catch{return Response.json({error:'Sólo superadministradores.'},{status:403,headers});}
 try{sameOrigin(req);const raw=await req.text();if(raw.length>2000)throw Error('Solicitud demasiado extensa.');const data=JSON.parse(raw);return Response.json(await createTestContact(process.env.HUBSPOT_ACCESS_TOKEN||'',data),{headers});}
 catch(e){return Response.json({error:e instanceof Error?e.message:'No fue posible completar la prueba.'},{status:400,headers});}
}
