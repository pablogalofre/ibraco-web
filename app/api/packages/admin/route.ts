import {staff,sameOrigin,fail} from '@/app/lib/packages-server';
import {createQ10Preinscription} from '@/app/lib/q10';
export async function GET(req:Request){try{const {db,profile}=await staff(req,'read');const [offers,sales,courses]=await Promise.all([db.from('package_offers').select('*').order('campus').order('levels'),db.from('package_sales').select('*,orders(*),package_credits(*)').order('created_at',{ascending:false}).limit(500),db.from('courses').select('id,name,cycle,campus,modality,level,q10_program_code,q10_period_id,q10_site_journey_id').eq('status','published').order('start_date',{ascending:false})]);for(const r of [offers,sales,courses])if(r.error)throw Error('No fue posible consultar el módulo. Verifica la instalación SQL.');return Response.json({offers:offers.data,sales:sales.data,courses:courses.data,profile},{headers:{'Cache-Control':'no-store'}});}catch(e){return fail(e,403);}}
export async function POST(req:Request){try{sameOrigin(req);const b=await req.json();const {db,user}=await staff(req,b.action==='release_payment'?'accounting':'courses');
 if(b.action==='save_offer'){
  const f=b.offer||{};const payload={code:String(f.code||'').trim(),name:String(f.name||'').trim(),campus:f.campus,profile:f.profile,frequencies:f.frequencies,levels:Number(f.levels),prep:!!f.prep,tuition:Number(f.tuition),materials:Number(f.materials),base_tuition:Number(f.base_tuition),conditions:String(f.conditions||'').trim(),starts_at:f.starts_at,ends_at:f.ends_at,pay_until:f.pay_until,enabled:!!f.enabled,version:Number(f.version||0)+1,updated_at:new Date().toISOString()};
  if(!/^[a-zA-Z0-9_-]{3,100}$/.test(payload.code)||![payload.tuition,payload.materials,payload.base_tuition,payload.levels].every(Number.isSafeInteger))throw Error('Revisa código y valores enteros en pesos');
  const query=f.id?db.from('package_offers').update(payload).eq('id',f.id).eq('version',f.version):db.from('package_offers').insert(payload);
  const {data,error}=await query.select('id');if(error)throw Error('No fue posible guardar: revisa fechas, intensidad y valores');if(!data?.length)throw Error('Otro administrador modificó esta oferta. Recarga antes de guardar');return Response.json({ok:true});
 }
 const {data:s,error}=await db.from('package_sales').select('*,orders(*)').eq('order_id',b.orderId).single();if(error||!s)throw Error('Reserva no encontrada');
 if(b.action==='eligibility'){
  if(!['approved','rejected'].includes(b.value)||String(b.note||'').trim().length<10)throw Error('Registra la validación de perfil, sede, intensidad y nivel de ingreso');
  if(s.orders.payment_status==='paid'&&b.value==='rejected')throw Error('Un pago recibido debe revisarse con Contabilidad');
  const {error}=await db.from('package_sales').update({eligibility:b.value,eligibility_note:String(b.note).slice(0,2000),validated_by:user.id,validated_at:new Date().toISOString()}).eq('order_id',b.orderId);if(error)throw error;
 }else if(b.action==='release_payment'){
  if(s.orders.payment_status!=='paid'||s.eligibility!=='approved'||s.entitlement_status!=='review'||String(b.note||'').trim().length<10)throw Error('Verifica pago, elegibilidad y motivo de revisión');
  const {error}=await db.from('package_sales').update({payment_detail:{...s.payment_detail,reviewed_by:user.id,review_note:String(b.note).slice(0,2000),reviewed_at:new Date().toISOString()}}).eq('order_id',b.orderId);if(error)throw error;
  const r=await db.rpc('activate_package',{p_order:b.orderId,p_review:false});if(r.error)throw r.error;
 }else if(b.action==='complete'){
  if(s.entitlement_status!=='active'||String(b.note||'').trim().length<10)throw Error('Confirma la aprobación académica del nivel');
  const {data,error}=await db.from('package_credits').update({status:'completed',completed_by:user.id,completed_at:new Date().toISOString(),prerequisite_note:String(b.note).slice(0,2000)}).eq('id',b.creditId).eq('order_id',b.orderId).eq('status','assigned').select('id');if(error||!data?.length)throw Error('El nivel no está asignado o ya fue completado');
 }else if(b.action==='reconcile'){
  if(!['found','absent'].includes(b.result)||String(b.note||'').trim().length<10||b.result==='found'&&!String(b.q10Reference||'').trim())throw Error('Registra resultado, evidencia y referencia Q10 cuando exista');
  const r=await db.from('package_credits').update({status:b.result==='found'?'assigned':'available',q10_response:{manual_review_by:user.id,manual_review_at:new Date().toISOString(),result:b.result,evidence:String(b.note).slice(0,2000),reference:String(b.q10Reference||'').slice(0,200)}}).eq('id',b.creditId).eq('order_id',b.orderId).in('status',['review','processing']).select('id');if(r.error||!r.data?.length)throw Error('El crédito no está pendiente de conciliación');
 }else if(b.action==='assign'){
  // Validar datos ANTES del bloqueo: fallos locales no deben crear estados ambiguos.
  const o=s.orders;
  if(o.document_type!=='CC')throw Error('El mapeo Q10 actual solo confirma CC. Revisa este documento en Q10 antes de asignar');
  if(!/bogot[aá]/i.test(o.city_name||''))throw Error('El mapeo Q10 actual solo confirma Bogotá. Configura la ciudad antes de asignar');
  if(!process.env.Q10_API_KEY)throw Error('Falta configurar Q10_API_KEY en el servidor');
  if(!s.package_credits){const cr=await db.from('package_credits').select('id').eq('id',b.creditId).eq('order_id',b.orderId).single();if(cr.error||!cr.data)throw Error('El crédito no corresponde a esta reserva');}
  const claim=await db.rpc('claim_package_credit',{p_credit:b.creditId,p_course:b.courseId,p_actor:user.id,p_level:String(b.academicLevel||'').slice(0,100),p_note:String(b.note||'').slice(0,2000)});if(claim.error)throw Error(claim.error.message);const c=claim.data;if(c.order_id!==s.order_id)throw Error('Crédito ajeno a la orden');
  const split=(v:string)=>{const [first,...rest]=v.trim().split(/\s+/);return {first,rest:rest.join(' ')||undefined}};const n=split(o.first_name),a=split(o.last_name);
  try{
   const response=await createQ10Preinscription({Fecha_preinscripcion:new Intl.DateTimeFormat('en-CA',{timeZone:'America/Bogota',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),Primer_nombre:n.first,Segundo_nombre:n.rest,Primer_apellido:a.first,Segundo_apellido:a.rest,Codigo_tipo_identificacion:'1',Numero_identificacion:o.document_number,Email:o.email,Telefono:o.phone,Celular:o.phone,Fecha_nacimiento:o.birth_date||undefined,Genero:o.gender||undefined,Direccion:o.address||undefined,Lugar_residencia:'11001',Codigo_programa:c.mapping.program,Consecutivo_periodo:c.mapping.period,Consecutivo_sedejornada:c.mapping.site});
   const r=await db.from('package_credits').update({status:'assigned',q10_response:response}).eq('id',c.id).eq('status','processing');if(r.error)throw Error('Respuesta Q10 recibida pero sin guardar. Reconciliar sin reenviar');
  }catch(e){await db.from('package_credits').update({status:'review',q10_response:{error:'Resultado Q10 incierto. Revisar preinscripciones antes de cualquier reintento.'}}).eq('id',c.id).eq('status','processing');throw Error('La asignación requiere revisión en Q10. No se reenvía automáticamente para evitar duplicados');}
 }else throw Error('Acción desconocida');
 return Response.json({ok:true});
 }catch(e){return fail(e);}}
