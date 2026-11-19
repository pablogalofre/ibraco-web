'use client';
import {useEffect,useRef,useState} from 'react';
import {contentHTML,readContent,serializeContent,type RichNode} from './blog-content';
import styles from './blog-editor.module.css';
export function nodesFromDOM(root:Node):RichNode[]{
 let count=0;
 const walk=(node:Node,depth:number):RichNode[]=>{
  if(++count>20000||depth>30)return [];
  if(node.nodeType===Node.TEXT_NODE)return [node.textContent||''];
  if(node.nodeType!==Node.ELEMENT_NODE)return [];
  const e=node as HTMLElement,tag=e.tagName.toLowerCase();
  if(['script','style','iframe','object','embed','svg','math','img','video','audio','input','button','template','noscript'].includes(tag))return [];
  let children=Array.from(e.childNodes).flatMap(c=>walk(c,depth+1));
  // Word/Google Docs suelen representar negrita y cursiva mediante estilos.
  if(!['strong','b'].includes(tag)&&(/bold|[6-9]00/.test(e.style.fontWeight)))children=[{tag:'strong',children}];
  if(!['em','i'].includes(tag)&&e.style.fontStyle==='italic')children=[{tag:'em',children}];
  const mapped=({b:'strong',i:'em',h1:'h2',h4:'h3',h5:'h3',h6:'h3',div:'p'} as Record<string,string>)[tag]||tag;
  if(['p','h2','h3','strong','em'].includes(mapped)&&children.some(c=>typeof c!=='string'&&['p','h2','h3','ul','ol'].includes(c.tag)))return children;
  if(['p','h2','h3','ul','ol','li','strong','em','br'].includes(mapped))return [{tag:mapped,children:mapped==='br'?[]:children} as RichNode];
  return children;
 };
 return Array.from(root.childNodes).flatMap(n=>walk(n,0));
}
export default function BlogEditor({value,onChange}:{value:string;onChange:(v:string)=>void}){
 const ref=useRef<HTMLDivElement>(null),last=useRef<string|null>(null),range=useRef<Range|null>(null);
 const [warning,setWarning]=useState('');
 useEffect(()=>{if(ref.current&&last.current!==value){ref.current.innerHTML=contentHTML(readContent(value));last.current=value;range.current=null;}},[value]);
 function remember(){const s=window.getSelection();if(s?.rangeCount&&ref.current?.contains(s.anchorNode)&&ref.current?.contains(s.focusNode))range.current=s.getRangeAt(0).cloneRange();}
 function sync(){if(!ref.current)return;const next=serializeContent(nodesFromDOM(ref.current));last.current=next;onChange(next);remember();}
 function command(cmd:string,arg?:string){const el=ref.current;if(!el)return;el.focus();const selection=window.getSelection();if(range.current&&el.contains(range.current.commonAncestorContainer)){selection?.removeAllRanges();selection?.addRange(range.current);}
  if(!document.queryCommandSupported(cmd)){setWarning('Tu navegador no admite esta opción. Prueba con una versión actual de Chrome, Edge, Firefox o Safari.');return;}
  document.execCommand(cmd,false,arg);sync();
 }
 return <div className={styles.editor}>
 <div className={styles.toolbar} role="toolbar" aria-label="Formato del artículo">{[['Párrafo','formatBlock','p'],['H2','formatBlock','h2'],['H3','formatBlock','h3'],['Negrita','bold',''],['Cursiva','italic',''],['Viñetas','insertUnorderedList',''],['Lista numerada','insertOrderedList',''],['Deshacer','undo',''],['Rehacer','redo','']].map(([label,cmd,arg])=><button key={label} type="button" title={label==='H2'?'Encabezado principal de sección':label==='H3'?'Subsección dentro de un H2':label} onMouseDown={e=>{e.preventDefault();remember();}} onClick={()=>command(cmd,arg||undefined)}>{label}</button>)}</div>
 <div ref={ref} id="ib-content" className={styles.body} role="textbox" aria-label="Contenido del artículo" aria-multiline="true" contentEditable suppressContentEditableWarning onInput={sync} onBlur={remember} onKeyUp={remember} onMouseUp={remember} onDrop={e=>{e.preventDefault();setWarning('Para agregar texto con formato, cópialo y pégalo en el editor.');}} onPaste={e=>{e.preventDefault();remember();const raw=e.clipboardData.getData('text/html');const template=document.createElement('template');let html:string;if(raw){template.innerHTML=raw;html=contentHTML(nodesFromDOM(template.content));}else{html=contentHTML([e.clipboardData.getData('text/plain')]).replace(/\r?\n/g,'<br>');}command('insertHTML',html);}}/>
 <p className={styles.hint}>Pon el cursor en un título y pulsa H2 o H3. Selecciona texto para aplicar negrita. El título del artículo ya es H1. Puedes pegar desde Word o Google Docs; revisa los encabezados en Vista previa.</p>
 {warning&&<p role="status">{warning}</p>}
 </div>;
}
