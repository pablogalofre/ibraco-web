import {staff} from '@/app/lib/packages-server';
import {inspectHubspot} from '@/app/lib/hubspot-inspection';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const headers={'Cache-Control':'no-store, private','Vary':'Authorization'};
 try{const {profile}=await staff(req,'read');if(!profile.is_superadmin)return Response.json({error:'Sólo superadministradores.'},{status:403,headers});}
 catch{return Response.json({error:'Inicia sesión con tu cuenta de superadministrador.'},{status:403,headers});}
 const report=await inspectHubspot(process.env.HUBSPOT_ACCESS_TOKEN||'');
 return Response.json(report,{headers});
}
