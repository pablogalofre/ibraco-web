import {createHmac,timingSafeEqual} from 'node:crypto';
type Order={order_number:string;product_type:string;payment_status:string;amount:unknown;currency:string};
type Sale={eligibility:string;validated_at:string|null;token_hash:string;pay_until:string;entitlement_status:string};
function secret(){const value=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!value||value.length<20)throw Error('No fue posible generar el enlace. Revisa la configuración del servidor.');return value;}
function signature(order:Order,sale:Sale){
 if(order.product_type!=='package'||!order.order_number||!sale.validated_at||!Number.isFinite(Date.parse(sale.validated_at))||!/^[a-f0-9]{64}$/.test(sale.token_hash))throw Error('La reserva requiere una validación completa antes de generar el enlace.');
 // Token distinto del original, ligado a esta reserva y a su validación vigente.
 // No se envía la clave de servidor ni se reemplaza el enlace del estudiante.
 return createHmac('sha256',secret()).update(JSON.stringify(['ibraco-package-payment-link-v1',order.order_number,sale.token_hash,new Date(sale.validated_at).toISOString()])).digest('hex');
}
export function validSharedPackageToken(token:unknown,order:Order,sale:Sale){
 if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)||sale.eligibility!=='approved')return false;
 try{return timingSafeEqual(Buffer.from(token,'hex'),Buffer.from(signature(order,sale),'hex'));}catch{return false;}
}
export function packagePaymentPath(order:Order,sale:Sale,now=Date.now()){
 if(sale.eligibility!=='approved')throw Error('Confirma el perfil del estudiante y el paquete antes de generar el enlace.');
 if(['paid','refunded'].includes(order.payment_status))throw Error('Este pedido ya tiene un pago recibido o en revisión.');
 if(sale.entitlement_status!=='unpaid')throw Error('La reserva tiene niveles activos o un pago en revisión. Revisa con Contabilidad.');
 const end=Date.parse(sale.pay_until);if(!Number.isFinite(end)||now>=end)throw Error('El plazo de pago de esta reserva terminó.');
 if(order.currency!=='COP'||!Number.isSafeInteger(Number(order.amount))||Number(order.amount)<=0)throw Error('Revisa el valor y la moneda de la reserva.');
 return '/promociones/reserva?pedido='+encodeURIComponent(order.order_number)+'#token='+signature(order,sale);
}
