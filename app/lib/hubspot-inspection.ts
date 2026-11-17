// Sólo lo consume la ruta de servidor; nunca devuelve credenciales ni respuestas sin filtrar.
type Property = {name:string;label:string;type?:string;fieldType?:string;modificationMetadata?:{readOnlyValue?:boolean};options?:{label:string;value:string;hidden?:boolean}[]};
export type Check = {ok:boolean;status:number;message:string};
export type Inspection = {checkedAt:string;checks:Record<string,Check>;properties:Property[];testContact:{email:string;exists:boolean|null;id?:string;leadStatus?:string;ownerAssigned?:boolean};ownerCount:number|null};
export async function inspectHubspot(token:string,fetcher:typeof fetch=fetch):Promise<Inspection>{
 const result:Inspection={checkedAt:new Date().toISOString(),checks:{},properties:[],testContact:{email:'info@turismoencasasyfincas.com.co',exists:null},ownerCount:null};
 if(!token){result.checks.configuration={ok:false,status:0,message:'Falta HUBSPOT_ACCESS_TOKEN en este despliegue.'};return result;}
 async function read(path:string){try{const r=await fetcher('https://api.hubapi.com'+path,{method:'GET',headers:{Authorization:`Bearer ${token}`},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(12000)});if(r.ok)return {status:r.status,data:await r.json()};return {status:r.status,data:null};}catch{return {status:0,data:null};}}
 function status(code:number,label:string):Check{return {ok:code>=200&&code<300,status:code,message:code===401?'HubSpot rechazó la clave. Revisa que sea la clave de servicio vigente.':code===403?'Faltan permisos para esta consulta.':code===429?'HubSpot limitó temporalmente las consultas. Intenta después.':code===0?'No fue posible conectar con HubSpot.':code>=200&&code<300?label:'HubSpot no pudo completar esta consulta.'};}
 const [props,contact,owners]=await Promise.all([
 read('/crm/v3/properties/contacts'),
 read('/crm/v3/objects/contacts/info%40turismoencasasyfincas.com.co?idProperty=email&properties=hs_lead_status,hubspot_owner_id'),
 read('/crm/v3/owners?limit=100&archived=false')]);
 result.checks.properties=status(props.status,'Campos consultados.');
 if(props.data&&Array.isArray(props.data.results)){result.properties=props.data.results.filter((p:Property)=>{const n=(p.name+' '+p.label).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return ['hs_lead_status','hubspot_owner_id','hs_object_source','hs_object_source_detail_1'].includes(p.name)||/programa.*interes|sede.?pauta|sede.*interes|campus/.test(n);}).map((p:Property)=>({name:p.name,label:p.label,type:p.type,fieldType:p.fieldType,modificationMetadata:{readOnlyValue:p.modificationMetadata?.readOnlyValue===true},options:(p.options||[]).filter(o=>!o.hidden).map(o=>({label:o.label,value:o.value}))}));}
 result.checks.testContact=contact.status===404?{ok:true,status:404,message:'El correo de prueba no existe; no se creó ningún contacto.'}:status(contact.status,'Registro de prueba consultado; no se modificó.');
 if(contact.status===404)result.testContact.exists=false;
 else if(contact.data){result.testContact={email:'info@turismoencasasyfincas.com.co',exists:true,id:String(contact.data.id),leadStatus:String(contact.data.properties?.hs_lead_status||''),ownerAssigned:Boolean(contact.data.properties?.hubspot_owner_id)};}
 result.checks.owners=status(owners.status,'Acceso de consulta de asesores verificado.');
 if(Array.isArray(owners.data?.results))result.ownerCount=owners.data.paging?.next?null:owners.data.results.length;
 return result;
}
