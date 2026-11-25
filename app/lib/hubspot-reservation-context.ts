import {packageDb} from './packages-server';
type Db=ReturnType<typeof packageDb>;
type Source={id:string;order_number:string|null;payload?:Record<string,unknown>|null;created_at?:string};
export type ReservationContext={kind:string;name:string;code:string;campus:string;modality:string;frequency:string;levels:number|null;prep:boolean|null;profile:string;amount:number|null;currency:string;missing:boolean};
const text=(v:unknown)=>typeof v==='string'?v.slice(0,500):'';
const number=(v:unknown)=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
export async function reservationContexts(db:Db,jobs:Source[]):Promise<Map<string,ReservationContext>>{
 const result=new Map<string,ReservationContext>();
 const refs=jobs.flatMap(j=>j.order_number?[j.order_number]:[]);
 let orders:any[]=[];let sales:any[]=[];
 if(refs.length){
  const o=await db.from('orders').select('id,order_number,product_type,course_name,campus,modality,amount,currency').in('order_number',refs);
  if(o.error)throw Error('No fue posible consultar las reservas originales.');orders=o.data||[];
  const ids=orders.filter(o=>o.product_type==='package').map(o=>o.id);
  if(ids.length){const s=await db.from('package_sales').select('order_id,snapshot,frequency').in('order_id',ids);if(s.error)throw Error('No fue posible consultar el paquete reservado.');sales=s.data||[];}
 }
 for(const job of jobs){
  const o=orders.find(o=>o.order_number===job.order_number),p=job.payload||{};
  const sale=o&&sales.find(s=>String(s.order_id)===String(o.id)),snap=sale?.snapshot||{};
  result.set(job.id,{kind:o?.product_type||(job.order_number?'unknown':'advisory'),name:o?.product_type==='package'?text(snap.name)||text(o.course_name):text(o?.course_name)||text(p.courseSlug)||text(p.program),code:text(snap.code),campus:text(snap.campus)||text(o?.campus)||text(p.campus),modality:text(o?.modality),frequency:text(sale?.frequency),levels:number(snap.levels),prep:typeof snap.prep==='boolean'?snap.prep:null,profile:text(snap.profile),amount:number(o?.amount),currency:text(o?.currency),missing:!!job.order_number&&(!o||(o.product_type==='package'&&!sale))});
 }
 return result;
}
function escape(v:unknown){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));}
export function reservationNote(job:{id:string;order_number:string|null;created_at:string},c:ReservationContext){
 if(c.kind!=='package'||c.missing||!c.name||!job.order_number)throw Error('No se encontró la selección original del paquete.');
 const lines=[['Reserva',job.order_number],['Paquete',c.name],['Código',c.code],['Sede',c.campus],['Modalidad',c.modality],['Intensidad',c.frequency],['Niveles',c.levels],['Preparación CELPE-Bras',c.prep===null?'':c.prep?'Incluida':'No incluida'],['Perfil de la oferta',c.profile],['Valor reservado',c.amount===null?'':c.currency==='COP'?new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(c.amount)+' COP':c.amount+' '+c.currency],['Fecha de reserva',new Date(job.created_at).toLocaleString('es-CO',{timeZone:'America/Bogota'})],['Origen','Nueva web IBRACO /promociones']];
 return '<h3>IBRACO · Paquete reservado</h3>'+lines.filter(([,v])=>v!==''&&v!==null&&v!==undefined).map(([k,v])=>'<p><strong>'+escape(k)+':</strong> '+escape(v)+'</p>').join('')+'<p>Esta reserva no confirma pago ni matrícula académica.</p><p>Referencia de integración: IBRACO-RESERVA-'+escape(job.id)+'</p>';
}
