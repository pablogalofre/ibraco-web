import {randomUUID} from 'node:crypto';
import {staff,sameOrigin,fail} from '@/app/lib/packages-server';
import {detectPackageImage,PACKAGE_IMAGE_MAX_BYTES} from '@/app/lib/package-images';
export async function POST(req:Request){try{
 sameOrigin(req,'multipart/form-data');
 const {db,user}=await staff(req,'courses');
 if(Number(req.headers.get('content-length')||0)>PACKAGE_IMAGE_MAX_BYTES+65536)throw Error('La imagen supera el máximo de 3 MB');
 const form=await req.formData(),file=form.get('image');
 if(!(file instanceof File)||file.size<12||file.size>PACKAGE_IMAGE_MAX_BYTES)throw Error('Selecciona una imagen de hasta 3 MB');
 const bytes=new Uint8Array(await file.arrayBuffer()),format=detectPackageImage(bytes);
 if(!format||file.type!==format.mime)throw Error('Formato no válido. Usa JPG, PNG, WebP o AVIF');
 const path=`${user.id}/${randomUUID()}.${format.extension}`;
 const {error}=await db.storage.from('package-offers').upload(path,bytes,{contentType:format.mime,cacheControl:'31536000',upsert:false});
 if(error){console.error('PACKAGE_IMAGE_UPLOAD',error.message);throw Error('No fue posible subir la imagen. Verifica que se ejecutó el SQL de imágenes');}
 return Response.json({path},{headers:{'Cache-Control':'no-store'}});
}catch(e){return fail(e);}}
