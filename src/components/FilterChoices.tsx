import { Briefcase, CalendarDays, Flower2, Heart, Leaf, Moon, Shirt, Snowflake, Sun, type LucideIcon } from 'lucide-react';
const icons: Record<string,LucideIcon> = { spring:Flower2,summer:Sun,autumn:Leaf,winter:Snowflake,daily:CalendarDays,work:Briefcase,evening:Moon,formal:Shirt,date:Heart };
export function FilterChoices({label,labels,value,onChange}:{label:string;labels:Record<string,string>;value?:string;onChange:(value:string|undefined)=>void}) {
 return <fieldset className="filter-capsules"><legend>{label}</legend><div><button type="button" aria-pressed={!value} onClick={()=>onChange(undefined)}>همه</button>{Object.entries(labels).map(([key,text])=>{const Icon=icons[key];return <button type="button" key={key} aria-pressed={value===key} onClick={()=>onChange(value===key?undefined:key)}>{Icon&&<Icon size={17} aria-hidden="true"/>}{text}</button>;})}</div></fieldset>;
}
