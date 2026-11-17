'use client';
import {useEffect,useState} from 'react';
import {supabase} from '../../../../lib/supabase';
export default function Proposal(){
 const [html,setHtml]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let active=true;const controller=new AbortController();
 async function load(){try{
 const {data:{session}}=await supabase.auth.getSession();
 if(!session){window.location.assign('/admin/login');return;}
 const response=await fetch('/api/intranet/propuesta',{headers:{Authorization:`Bearer ${session.access_token}`},cache:'no-store',signal:controller.signal});
 if(!response.ok)throw Error(response.status===403?'Tu cuenta no tiene acceso a Intranet.':'No fue posible abrir la propuesta. Inicia sesión e intenta de nuevo.');
 const content=await response.text();if(active)setHtml(content);
 }catch(e){if(active)setError(e instanceof Error?e.message:'No fue posible abrir la propuesta.');}}
 void load();const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||!session){setHtml('');window.location.assign('/admin/login');}});
 return()=>{active=false;controller.abort();subscription.unsubscribe();};},[]);
 return <main style={{height:'100dvh',display:'flex',flexDirection:'column',background:'#faf7eb'}}><header style={{padding:'12px 20px',background:'#12633f',color:'white',display:'flex',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}><a href="/admin/intranet" style={{color:'white'}}>← Volver a Intranet</a><span>Propuesta · Demostración con datos ficticios</span></header>{error?<p role="alert" style={{padding:24}}>{error}</p>:html?<iframe title="Propuesta de gestión docente IBRACO" srcDoc={html} sandbox="allow-scripts allow-downloads allow-modals" style={{width:'100%',flex:1,border:0,minHeight:0}}/>:<p style={{padding:24}}>Comprobando acceso a Intranet…</p>}</main>;
}
