export type Mood={id:string;icon:string;label:string;score:number;color?:string};
export type Note={id:string;date:string;content:string;mood:string;moodLabel:string;moodIcon:string;moodScore:number;moodColor?:string;images?:string[];private?:boolean;recordedAt:string;timeUnknown:boolean;updatedAt:string};
export type DayMood={date:string;mood:string;moodLabel:string;moodIcon:string;moodColor?:string;summaryManual:boolean};
export type Profile={nickname:string;avatar:string};
export type PrivacySettings={salt:string;hash:string};
export type Data={profile:Profile|null;notes:Note[];days:DayMood[];customMoods:Mood[];privacy:PrivacySettings|null};

export const moods:Mood[]=[
  {id:"super_happy",icon:"",label:"超开心",score:5,color:"#FBCC34"},
  {id:"small_happy",icon:"",label:"小开心",score:4,color:"#E5E384"},
  {id:"light",icon:"",label:"轻松",score:4,color:"#CEE9D5"},
  {id:"shy",icon:"",label:"害羞",score:4,color:"#FAB3AF"},
  {id:"calm",icon:"",label:"平静",score:3,color:"#BFD15E"},
  {id:"speechless",icon:"",label:"无语",score:2,color:"#BFB9B4"},
  {id:"tired",icon:"",label:"疲惫",score:2,color:"#D6BFAD"},
  {id:"anxious",icon:"",label:"焦虑",score:1,color:"#A7AEDE"},
  {id:"sad",icon:"",label:"难过",score:1,color:"#B1DBF0"},
  {id:"angry",icon:"",label:"生气",score:1,color:"#F78570"}
];

export const customMoodColor="#BFAFE2";
export const moodPalette=[
  {id:"sunny",label:"阳光黄",color:"#FBCC34"},
  {id:"sprout",label:"嫩芽黄绿",color:"#E5E384"},
  {id:"mint",label:"薄荷青",color:"#CEE9D5"},
  {id:"shy",label:"害羞粉",color:"#FAB3AF"},
  {id:"leaf",label:"草木绿",color:"#BFD15E"},
  {id:"cloud",label:"云朵灰",color:"#BFB9B4"},
  {id:"oat",label:"燕麦色",color:"#D6BFAD"},
  {id:"mist",label:"雾紫",color:"#A7AEDE"},
  {id:"sky",label:"晴空蓝",color:"#B1DBF0"},
  {id:"coral",label:"珊瑚红",color:"#F78570"}
] as const;
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
  return direct?{...direct,color:record.moodColor||direct.color}: {id:record.mood,icon:record.moodIcon||"",label:record.moodLabel||"自定义",score:record.moodScore||3,color:record.moodColor||moodColor(record.mood)};
}

const KEY="qingtian-local-data-v1";
const empty:Data={profile:null,notes:[],days:[],customMoods:[],privacy:null};
const legacyMoodColors:Record<string,string>={
  "#FFD04D":"#FBCC34","#DFE86D":"#E5E384","#C9EBDD":"#CEE9D5","#F5A0A7":"#FAB3AF","#A9D65D":"#BFD15E",
  "#B9B9B7":"#BFB9B4","#CDBBAA":"#D6BFAD","#9EA9EA":"#A7AEDE","#8FD1F3":"#B1DBF0","#F47B68":"#F78570",
  "#F3A3B7":"#FAB3AF","#F7AAA9":"#FAB3AF","#E9A4A6":"#FAB3AF","#F2B77E":"#D6BFAD",
  "#A9D36F":"#BFD15E","#8FC9EA":"#B1DBF0","#B1A3E1":"#A7AEDE"
};
function migrateMood<T extends {mood:string;moodLabel:string;moodIcon:string;moodColor?:string}>(record:T):T{
  const nextId=legacyPrimary[record.mood];
  if(!nextId){const storedColor=record.moodColor&&(legacyMoodColors[record.moodColor]||record.moodColor);return{...record,moodColor:storedColor||moodColor(record.mood)}}
  const next=moodById.get(nextId)!;
  return{...record,mood:next.id,moodLabel:next.label,moodIcon:next.icon,moodColor:next.color};
}
export function normalizeData(stored:Partial<Data>):Data{
  const notes=(stored.notes||[]).map(n=>{const migrated=migrateMood({...n,images:n.images||[],private:Boolean(n.private)});return{...migrated,moodScore:moodById.get(migrated.mood)?.score||migrated.moodScore}});
  const migratedDays=(stored.days||[]).map(d=>migrateMood(d)),manualDays=migratedDays.filter(d=>d.summaryManual),manualDates=new Set(manualDays.map(d=>d.date)),noteDates=[...new Set(notes.map(n=>n.date))],automaticDays=noteDates.filter(date=>!manualDates.has(date)).map(date=>{const s=summarize(notes,date);return{date,mood:s.id,moodLabel:s.label,moodIcon:s.icon,moodColor:s.color,summaryManual:false}});
  return{...empty,...stored,customMoods:stored.customMoods||[],privacy:stored.privacy||null,notes,days:[...manualDays,...automaticDays]};
}
export function load():Data{try{return normalizeData(JSON.parse(localStorage.getItem(KEY)||""))}catch{return empty}}
export function save(data:Data){localStorage.setItem(KEY,JSON.stringify(data))}
export const pad=(n:number)=>String(n).padStart(2,"0");export const dateKey=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;export const timeText=(iso:string)=>new Date(iso).toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",hour12:false});
export function summarize(notes:Note[],date:string):Mood{
  const valid=notes.filter(n=>n.date===date&&n.mood!=="unknown").sort((a,b)=>a.recordedAt.localeCompare(b.recordedAt));
  if(!valid.length)return{id:"unknown",icon:"",label:"心情未知",score:3,color:"#D7DDE0"};
  const support=new Map<string,{weight:number;count:number;last:number}>(),last=Math.max(1,valid.length-1);
  valid.forEach((note,index)=>{
    // 比起简单平均，出现次数是主要依据；较晚的感受有温和加权，时间未知的补记稍降权。
    const recency=.9+.35*(index/last),weight=recency*(note.timeUnknown?.9:1),current=support.get(note.mood)||{weight:0,count:0,last:-1};
    support.set(note.mood,{weight:current.weight+weight,count:current.count+1,last:index});
  });
  const winner=[...support.entries()].sort((a,b)=>{
    const aScore=a[1].weight*(1+Math.min(.24,(a[1].count-1)*.08)),bScore=b[1].weight*(1+Math.min(.24,(b[1].count-1)*.08));
    return bScore-aScore||b[1].last-a[1].last;
  })[0][0],representative=[...valid].reverse().find(n=>n.mood===winner)!;
  return moodForRecord(representative);
}
