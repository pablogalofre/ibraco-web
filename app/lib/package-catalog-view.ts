import type {PackageOffer} from './packages';
export type OfferFilters={campus:string;category:'Nuevo'|'CELPE';frequency:string;levels:string};
export function matchingOffers(offers:PackageOffer[],filters:OfferFilters){
 if(!filters.campus)return [];
 return offers.filter(f=>(filters.campus==='*'||f.campus===filters.campus||f.campus==='Todas')&&(f.profile==='Nuevo'||f.prep)&&(filters.category==='CELPE'?f.prep:!f.prep)&&f.frequencies.includes(filters.frequency)&&(!filters.levels||f.levels===Number(filters.levels))).sort((a,b)=>a.levels-b.levels||a.tuition+a.materials-b.tuition-b.materials||a.campus.localeCompare(b.campus,'es')||a.name.localeCompare(b.name,'es')||a.id.localeCompare(b.id));
}
export function packageCardTitle(offer:PackageOffer){return offer.name.replace(/\s*·\s*(Días IBRACO|Nuevos estudiantes)\s*$/i,'');}
