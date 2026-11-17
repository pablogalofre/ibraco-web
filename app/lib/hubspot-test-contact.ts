export const TEST_EMAIL='pgalofre@turismoencasasyfincas.com.co';
const PROGRAMS=['Cursos Intensivos','Cursos Semi Intensivos Sábados','Cursos Semi Intensivos Entre Semana','Otros Cursos','Preparatorio Celpe Bras','Examen Celpe-Bras'];
export async function createTestContact(token:string,input:{program?:unknown;campus?:unknown;confirmed?:unknown},fetcher:typeof fetch=fetch){
 if(!token)throw Error('Falta configurar HUBSPOT_ACCESS_TOKEN.');
 if(input.confirmed!==true||!PROGRAMS.includes(input.program as string)||!['Centro','Norte','Virtual'].includes(input.campus as string))throw Error('Confirma la prueba y selecciona programa y sede válidos.');
 const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
 // La dirección está fijada en servidor: el cliente no puede crear contactos arbitrarios.
 let existing:Response;
 try{existing=await fetcher('https://api.hubapi.com/crm/v3/objects/contacts/'+encodeURIComponent(TEST_EMAIL)+'?idProperty=email&properties=hs_lead_status,hubspot_owner_id',{method:'GET',headers,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(12000)});}catch{throw Error('No fue posible verificar el contacto. No se intentó crearlo.');}
 if(existing.ok)throw Error('El contacto ya existe. Se conservó toda su información. Pulsa Comprobar conexión.');
 if(existing.status!==404)throw Error('No se pudo verificar si el contacto existe. No se intentó crearlo.');
 let created:Response;
 try{created=await fetcher('https://api.hubapi.com/crm/v3/objects/contacts',{method:'POST',headers,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(12000),body:JSON.stringify({properties:{email:TEST_EMAIL,firstname:'Pablo',lastname:'PRUEBA IBRACO WEB',hs_lead_status:'NEW',programa_de_interes:input.program,sedepauta:input.campus}})});}catch{throw Error('La respuesta de HubSpot no llegó. Comprueba la conexión antes de intentar otra vez; el contacto puede haberse creado.');}
 if(created.status===409)throw Error('El contacto ya existe. No se modificó. Pulsa Comprobar conexión.');
 if(!created.ok)throw Error(created.status===403?'La clave no tiene permiso de crear contactos.':created.status===401?'HubSpot rechazó la clave.':'HubSpot no confirmó la creación. Comprueba la conexión antes de repetir.');
 return {success:true,email:TEST_EMAIL};
}
