export type Mood={id:string;icon:string;label:string;score:number;color?:string};
export type Note={id:string;date:string;content:string;mood:string;moodLabel:string;moodIcon:string;moodScore:number;moodColor?:string;images?:string[];private?:boolean;recordedAt:string;timeUnknown:boolean;updatedAt:string};
export type DayMood={date:string;mood:string;moodLabel:string;moodIcon:string;moodColor?:string;summaryManual:boolean};
export type Profile={nickname:string;avatar:string};
export type PrivacySettings={salt:string;hash:string};
export type Data={profile:Profile|null;notes:Note[];days:DayMood[];customMoods:Mood[];privacy:PrivacySettings|null};

export const moods:Mood[]=[
  {id:"super_happy",icon:"",label:"超开心",score:5,color:"#FFD04D"},
  {id:"small_happy",icon:"",label:"小开心",score:4,color:"#DFE86D"},
  {id:"light",icon:"",label:"轻松",score:4,color:"#C9EBDD"},
  {id:"shy",icon:"",label:"害羞",score:4,color:"#F5A0A7"},
  {id:"calm",icon:"",label:"平静",score:3,color:"#A9D65D"},
  {id:"speechless",icon:"",label:"无语",score:2,color:"#B9B9B7"},
  {id:"tired",icon:"",label:"疲惫",score:2,color:"#CDBBAA"},
  {id:"anxious",icon:"",label:"焦虑",score:1,color:"#9EA9EA"},
  {id:"sad",icon:"",label:"难过",score:1,color:"#8FD1F3"},
  {id:"angry",icon:"",label:"生气",score:1,color:"#F47B68"}
];

export const customMoodColor="#BFAFE2";
const moodById=new Map(moods.map(m=>[m.id,m]));
const legacyPrimary:Record<string,string>={happy:"small_happy",proud:"super_happy",relaxed:"light",moved:"shy",blank:"calm"};
const legacyVisual:Record<string,string>={
  happy:"small_happy",proud:"super_happy",celebrate:"super_happy",relaxed:"light",resting:"light",music:"light",healing:"light",sunset:"light",coffee:"light",travel:"light",
  moved:"shy",blank:"calm",calm:"calm",working:"calm",studying:"calm",reading:"calm",tired:"tired",sleepy:"tired",anxious:"anxious",busy:"anxious",
  sad:"sad",unwell:"sad",angry:"angry",eating:"small_happy",exercise:"small_happy",pet:"small_happy"
};

export function moodAssetKey(id:string){
  if(id.startsWith("custom:"))return "custom";
  if(moodById.has(id))return id.replaceAll("_","-");
  const mapped=legacyVisual[id];
  return mapped?mapped.replaceAll("_","-"):"custom";
}
export function moodColor(id:string,fallback?:string){const normalized=legacyPrimary[id]||id;return moodById.get(normalized)?.color||fallback||customMoodColor}
export function moodForRecord(record:{mood:string;moodLabel:string;moodIcon:string;moodScore:number;moodColor?:string}):Mood{
  const direct=moodById.get(record.mood);
  return direct||{id:record.mood,icon:record.moodIcon||"",label:record.moodLabel||"自定义",score:record.moodScore||3,color:record.moodColor||moodColor(record.mood)};
}

const KEY="qingtian-local-data-v1";
const empty:Data={profile:null,notes:[],days:[],customMoods:[],privacy:null};
function migrateMood<T extends {mood:string;moodLabel:string;moodIcon:string;moodColor?:string}>(record:T):T{
  const nextId=legacyPrimary[record.mood];
  if(!nextId)return{...record,moodColor:moodColor(record.mood,record.moodColor)};
  const next=moodById.get(nextId)!;
  return{...record,mood:next.id,moodLabel:next.label,moodIcon:next.icon,moodColor:next.color};
}
export function normalizeData(stored:Partial<Data>):Data{return{
  ...empty,...stored,
  customMoods:stored.customMoods||[],privacy:stored.privacy||null,
  notes:(stored.notes||[]).map(n=>{const migrated=migrateMood({...n,images:n.images||[],private:Boolean(n.private)});return{...migrated,moodScore:moodById.get(migrated.mood)?.score||migrated.moodScore}}),
  days:(stored.days||[]).map(d=>migrateMood(d))
}}
export function load():Data{try{return normalizeData(JSON.parse(localStorage.getItem(KEY)||""))}catch{return empty}}
export function save(data:Data){localStorage.setItem(KEY,JSON.stringify(data))}
export const pad=(n:number)=>String(n).padStart(2,"0");export const dateKey=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;export const timeText=(iso:string)=>new Date(iso).toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",hour12:false});
export function summarize(notes:Note[],date:string):Mood{const valid=notes.filter(n=>n.date===date&&n.mood!=="unknown");if(!valid.length)return{id:"unknown",icon:"",label:"心情未知",score:3,color:"#D7DDE0"};if(valid.length===1&&valid[0].mood.startsWith("custom:"))return{id:valid[0].mood,icon:valid[0].moodIcon,label:valid[0].moodLabel,score:valid[0].moodScore,color:moodColor(valid[0].mood,valid[0].moodColor)};const avg=valid.reduce((s,n)=>s+n.moodScore,0)/valid.length,c=moods.filter(m=>Math.abs(m.score-avg)<.6);return c.find(m=>valid.some(n=>n.mood===m.id))||c[0]||moods[4]}
