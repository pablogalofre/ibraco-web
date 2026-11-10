import {packageDb} from './packages-server';
// Solo se llama con el resultado obtenido directamente de Mercado Pago por el webhook.
export async function handlePackagePayment(mp: any, reference:string){
 const db=packageDb();const {data:o,error}=await db.from('orders').select('*').eq('order_number',reference).single();if(error)throw error;if(o.product_type!=='package')return null;
 const {data:s,error:se}=await db.from('package_sales').select('*').eq('order_id',o.id).single();if(se||!s)throw Error('Falta la reserva del paquete');
 if(!s.mp_order_id||String(mp.id)!==s.mp_order_id)throw Error('Referencia de pago no corresponde a la reserva');
 const paid=['processed','approved'].includes(mp.status);
 const reversed=['refunded','charged_back','partially_refunded'].includes(mp.status)||mp.transactions?.refunds?.length>0||mp.transactions?.payments?.some((p:any)=>['refunded','charged_back'].includes(p.status));
 if(reversed){const r=await db.from('package_sales').update({entitlement_status:'frozen',payment_detail:{status:mp.status,mp_id:mp.id}}).eq('order_id',o.id);if(r.error)throw r.error;const r2=await db.from('orders').update({payment_status:'refunded',order_status:'payment_review'}).eq('id',o.id);if(r2.error)throw r2.error;return {received:true,productType:'package',status:'frozen'};}
 if(paid){
  if(Number(mp.total_amount)!==Number(o.amount)||mp.currency_id&&mp.currency_id!=='COP')throw Error('El monto o moneda no coincide con el paquete');
  const approval=mp.transactions?.payments?.map((p:any)=>p.date_approved).filter(Boolean).sort().at(-1)||mp.date_approved;
  // Sin fecha de aprobación autoritativa se requiere revisión humana, no se asume que la recepción fue la fecha de pago.
  const review=!approval||!Number.isFinite(Date.parse(approval))||Date.parse(approval)>=Date.parse(s.pay_until)||s.entitlement_status==='frozen';
  const r=await db.from('orders').update({payment_status:'paid',order_status:'paid',payment_reference:String(mp.id),payment_provider:'mercadopago',...(approval?{payment_approved_at:approval}:{}),q10_status:'awaiting_course'}).eq('id',o.id);if(r.error)throw r.error;
  const detail=await db.from('package_sales').update({payment_detail:{...s.payment_detail,status:mp.status,mp_id:mp.id,approval:approval||null,reason:review?'Verificar fecha de aprobación y plazo en Mercado Pago':null}}).eq('order_id',o.id);if(detail.error)throw detail.error;
  // Una revisión aprobada por Contabilidad sobrevive a webhooks repetidos del mismo pago.
  const alreadyReviewed=s.entitlement_status!=='frozen'&&s.payment_detail?.reviewed_by&&String(s.payment_detail?.mp_id)===String(mp.id);
  const a=await db.rpc('activate_package',{p_order:o.id,p_review:review&&!alreadyReviewed});if(a.error)throw a.error;return {received:true,productType:'package',paymentStatus:'paid',credits:a.data};
 }
 if(o.payment_status!=='paid'&&!['frozen','active'].includes(s.entitlement_status)){
 const failed=['failed','cancelled','rejected'].includes(mp.status);const r=await db.from('orders').update({payment_status:failed?'failed':'pending',order_status:failed?'payment_failed':'pending'}).eq('id',o.id);if(r.error)throw r.error;
 }
 return {received:true,productType:'package',paymentStatus:o.payment_status};
}
