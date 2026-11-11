"use client";
import {recordPromotion} from '../lib/promotion-tracking';
export default function PromotionEntry(){return <div style={{marginTop:20,maxWidth:480}}><p style={{margin:'0 0 12px',fontSize:16,lineHeight:1.6}}>Paquetes y beneficios para estudiar varios niveles.</p><a href="/promociones" className="btn btn-primary" style={{display:'inline-flex',justifyContent:'center',whiteSpace:'normal',textAlign:'center'}} onClick={()=>recordPromotion('course_entry')}>Ver ofertas de Días IBRACO</a></div>;}
