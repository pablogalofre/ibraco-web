import {packageDb,tokenHash,sameOrigin,fail} from '@/app/lib/packages-server';
export async function POST(req:Request){try{sameOrigin(req);const raw=await req.text();if(raw.length>10000)throw Error('Solicitud demasiado extensa');const b=JSON.parse(raw);if(!/^[a-f0-9]{64}$/.test(b.token||'')||!/^[a-f0-9-]{36}$/.test(b.offerId||''))throw Error('Reserva inválida');const s=b.student||{};
 for(const f of ['first_name','last_name','email','phone','document_type','document_number','city_name'])if(typeof s[f]!=='string'||!s[f].trim()||s[f].length>180)throw Error('Completa los datos del estudiante');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)||!['CC','TI','CE','PAS'].includes(s.document_type))throw Error('Revisa correo y documento');
 if(s.birth_date&&!/^\d{4}-\d{2}-\d{2}$/.test(s.birth_date))throw Error('Fecha de nacimiento inválida');
 for(const f of ['address','gender'])if(s[f]&&(typeof s[f]!=='string'||s[f].length>250))throw Error('Datos inválidos');
 const {data,error}=await packageDb().rpc('reserve_package',{p_offer:b.offerId,p_frequency:b.frequency,p_student:s,p_hash:tokenHash(b.token)});if(error)throw Error(error.message);return Response.json(data,{headers:{'Cache-Control':'no-store'}});}catch(e){return fail(e);}}
