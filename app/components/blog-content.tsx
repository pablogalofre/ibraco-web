import {createElement, type ReactNode} from 'react';
export const BLOG_FORMAT='IBRACO_RICH_V1\n';
export type RichNode=string|{tag:'p'|'h2'|'h3'|'strong'|'em'|'ul'|'ol'|'li'|'br';children:RichNode[]};
const tags=new Set(['p','h2','h3','strong','em','ul','ol','li','br']);
export function readContent(value:string):RichNode[]{
 if(value.startsWith(BLOG_FORMAT)){
  try{let count=0;const validate=(x:unknown,depth:number):RichNode=>{
   if(++count>20000||depth>30)throw Error('Documento demasiado complejo');
   if(typeof x==='string')return x;
   if(!x||typeof x!=='object')throw Error('Nodo inválido');
   const v=x as {tag:string;children:unknown[]};
   if(!tags.has(v.tag)||!Array.isArray(v.children))throw Error('Formato inválido');
   return {tag:v.tag,children:v.children.map(c=>validate(c,depth+1))} as RichNode;
  };const raw:unknown=JSON.parse(value.slice(BLOG_FORMAT.length));if(!Array.isArray(raw))throw Error('Formato inválido');return raw.map(n=>validate(n,0));}catch{/* Los datos inválidos se muestran como texto, nunca como HTML. */}
 }
 // Compatibilidad con los artículos antiguos: texto y saltos de línea.
 return value.replace(/\r\n/g,'\n').split(/\n\s*\n/).map(text=>({tag:'p',children:text.split('\n').flatMap((s,i)=>i?[{tag:'br',children:[]} as RichNode,s]:[s])}));
}
export function textContent(value:string):string{
 const text=(n:RichNode):string=>typeof n==='string'?n:n.tag==='br'?'\n':n.children.map(text).join('')+(['p','h2','h3','li'].includes(n.tag)?'\n':'');
 return readContent(value).map(text).join('');
}
export function serializeContent(nodes:RichNode[]):string{return textNodes(nodes).trim()?BLOG_FORMAT+JSON.stringify(nodes):'';}
function textNodes(nodes:RichNode[]):string{return nodes.map(n=>typeof n==='string'?n:n.tag==='br'?'\n':textNodes(n.children)).join('');}
const escape=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
// Solo etiquetas autorizadas; nunca se generan atributos desde el documento.
export function contentHTML(nodes:RichNode[]):string{return nodes.map(n=>typeof n==='string'?escape(n):n.tag==='br'?'<br>':`<${n.tag}>${contentHTML(n.children)}</${n.tag}>`).join('');}
export function BlogContent({value}:{value:string}){
 const render=(n:RichNode,key:string):ReactNode=>typeof n==='string'?n:createElement(n.tag,{key,style:n.tag==='h2'?{fontSize:'1.55em',lineHeight:1.3,margin:'1.4em 0 .6em',textTransform:'none',letterSpacing:'normal'}:n.tag==='h3'?{fontSize:'1.25em',lineHeight:1.4,margin:'1.2em 0 .5em',textTransform:'none',letterSpacing:'normal'}:n.tag==='ul'||n.tag==='ol'?{paddingLeft:'1.6em',listStyleType:n.tag==='ul'?'disc':'decimal',margin:'1em 0'}:n.tag==='li'?{display:'list-item',margin:'.35em 0'}:n.tag==='p'?{whiteSpace:'pre-wrap',margin:'0 0 1em',fontSize:'inherit',lineHeight:'inherit'}:undefined},...(n.tag==='br'?[]:n.children.map((c,i)=>render(c,`${key}-${i}`))));
 return <div style={{overflowWrap:'anywhere',lineHeight:1.8,textTransform:'none'}}>{readContent(value).map((n,i)=>render(n,String(i)))}</div>;
}
