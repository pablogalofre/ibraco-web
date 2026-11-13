export type HourRecord={id:string;teacher_id:string;teacher_name:string;class_date:string;labels:string[];hours:number[];status:string;decided_at:string|null;decided_by:string|null;decision_note:string};
// Agrega aquí las fórmulas reales y sus encabezados cuando Contabilidad las defina.
// No se calculan tarifas, nómina ni retenciones sin reglas aprobadas.
export const calculatedColumns:{title:string;calculate:(r:HourRecord)=>string|number}[]=[];
export function procesarRegistrosAprobados(records:HourRecord[]){
 const ids=new Set<string>(),dates=new Set<string>();
 return records.filter(r=>r.status==='approved').map(r=>{
  if(ids.has(r.id)||dates.has(r.teacher_id+':'+r.class_date))throw Error('Se detectaron registros duplicados');ids.add(r.id);dates.add(r.teacher_id+':'+r.class_date);
  if(r.hours.length!==5||r.labels.length!==5||r.hours.some(h=>!Number.isFinite(Number(h))||Number(h)<0))throw Error('Registro inconsistente');
  const total=r.hours.reduce((n,h)=>n+Math.round(Number(h)*100),0)/100;
  return [r.id,r.teacher_id,r.teacher_name,r.class_date,...r.hours.map(h=>Number(h).toFixed(2)),total.toFixed(2),...r.labels,r.decided_at||'',r.decided_by||'',...calculatedColumns.map(c=>c.calculate(r))];
 });
}
export function intranetCsv(records:HourRecord[]){const headers=['ID registro','ID docente','Nombre docente','Fecha de clases','Horas concepto 1','Horas concepto 2','Horas concepto 3','Horas concepto 4','Horas concepto 5','Total horas','Nombre concepto 1','Nombre concepto 2','Nombre concepto 3','Nombre concepto 4','Nombre concepto 5','Fecha aprobación','ID aprobador',...calculatedColumns.map(c=>c.title)];const cell=(v:unknown)=>'"'+String(v??'').replace(/^[\s=+@-]/,"'$&").replace(/"/g,'""')+'"';return '\ufeff'+[headers,...procesarRegistrosAprobados(records)].map(r=>r.map(cell).join(';')).join('\r\n');}
