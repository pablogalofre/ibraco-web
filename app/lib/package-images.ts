export const PACKAGE_IMAGE_MAX_BYTES=3*1024*1024;
const pathPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|avif)$/;
export function validPackageImagePath(path:unknown):path is string{return typeof path==='string'&&pathPattern.test(path);}
export function offerImageUrl(path:unknown){if(!validPackageImagePath(path))return null;const base=process.env.NEXT_PUBLIC_SUPABASE_URL;if(!base)return null;return `${base.replace(/\/$/,'')}/storage/v1/object/public/package-offers/${path}`;}
export function detectPackageImage(bytes:Uint8Array):{extension:string;mime:string}|null{
 if(bytes.length<12)return null;
 if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return {extension:'jpg',mime:'image/jpeg'};
 if([137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return {extension:'png',mime:'image/png'};
 const ascii=(start:number,end:number)=>String.fromCharCode(...bytes.slice(start,end));
 if(ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP')return {extension:'webp',mime:'image/webp'};
 if(bytes.length>=20&&ascii(4,8)==='ftyp'){
  const box=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(0);
  if(box>=16&&box<=bytes.length&&box<=256){const brands=[ascii(8,12)];for(let i=16;i+4<=box;i+=4)brands.push(ascii(i,i+4));if(brands.includes('avif')||brands.includes('avis'))return {extension:'avif',mime:'image/avif'};}
 }
 return null;
}
