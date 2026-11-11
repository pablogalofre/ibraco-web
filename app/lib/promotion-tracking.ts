"use client";
export function recordPromotion(kind:'page_view'|'course_entry'|'reserve_click',offerId?:string){
 try{const body=JSON.stringify({id:crypto.randomUUID(),kind,offerId:offerId||null});void fetch('/api/public/package-interactions',{method:'POST',headers:{'Content-Type':'application/json'},body,keepalive:true}).catch(()=>{});}catch{}
}
