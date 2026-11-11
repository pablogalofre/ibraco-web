import {packageDb,fail} from '@/app/lib/packages-server';
export const dynamic='force-dynamic';
export async function GET(){try{const now=new Date().toISOString();const {data,error}=await packageDb().from('package_offers').select('*').eq('enabled',true).or('profile.eq.Nuevo,prep.eq.true').lte('starts_at',now).gt('ends_at',now).order('levels');if(error)throw Error('No fue posible cargar las promociones');return Response.json({offers:data},{headers:{'Cache-Control':'no-store'}});}catch(e){return fail(e,503);}}
