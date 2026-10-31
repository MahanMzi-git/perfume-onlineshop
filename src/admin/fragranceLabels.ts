import {fragranceFamilies} from '../data/fragranceFamilies';
export const familyEnglish=Object.fromEntries(fragranceFamilies.map(f=>[f.name,f.slug==='aquatic'?'Fresh / Aquatic':f.slug[0].toUpperCase()+f.slug.slice(1)]));
