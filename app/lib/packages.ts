export type PackageOffer = {id:string; code:string; name:string; campus:string; profile:string; frequencies:string[]; levels:number; prep:boolean; tuition:number; materials:number; base_tuition:number; conditions:string; starts_at:string; ends_at:string; pay_until:string; enabled:boolean; version:number};
export const cop=(value:number)=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(value);
export const colombiaDate=(value:string)=>new Date(value).toLocaleDateString('es-CO',{timeZone:'America/Bogota'});
