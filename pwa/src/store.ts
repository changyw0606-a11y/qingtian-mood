export type Mood={id:string;icon:string;label:string;score:number;color?:string};
export type Note={id:string;date:string;content:string;mood:string;moodLabel:string;moodIcon:string;moodScore:number;moodColor?:string;images?:string[];private?:boolean;recordedAt:string;timeUnknown:boolean;updatedAt:string};
export type DayMood={date:string;mood:string;moodLabel:string;moodIcon:string;moodColor?:string;summaryManual:boolean};
export type Profile={nickname:string;avatar:string};
export type PrivacySettings={salt:string;hash:string};
export type Data={profile:Profile|null;notes:Note[];days:DayMood[];customMoods:Mood[];privacy:PrivacySettings|null};
export const moods:Mood[]=[
  {id:"happy",icon:"😄",label:"开心",score:5,color:"#FFD86B"},{id:"calm",icon:"😌",label:"平静",score:4,color:"#A8DCA3"},{id:"relaxed",icon:"☺️",label:"放松",score:4,color:"#B8E1D2"},{id:"proud",icon:"😎",label:"得意",score:5,color:"#F5BF72"},{id:"moved",icon:"🥹",label:"感动",score:4,color:"#F7B8C8"},
  {id:"blank",icon:"😶",label:"发呆",score:3,color:"#D7D2CA"},{id:"tired",icon:"😫",label:"疲惫",score:2,color:"#C9BEB5"},{id:"anxious",icon:"😰",label:"焦虑",score:2,color:"#AFC3DF"},{id:"sad",icon:"😢",label:"难过",score:1,color:"#A9D5F2"},{id:"angry",icon:"😠",label:"生气",score:1,color:"#F18A7D"},
  {id:"working",icon:"💻",label:"搬砖中",score:3,color:"#B7C8D8"},{id:"studying",icon:"📚",label:"学习中",score:3,color:"#C5B9E6"},{id:"busy",icon:"🏃",label:"忙碌",score:2,color:"#F4B78E"},{id:"resting",icon:"🛋️",label:"休息",score:4,color:"#B9D8C3"},{id:"travel",icon:"✈️",label:"旅行",score:5,color:"#9FD8EA"},
  {id:"eating",icon:"🍜",label:"干饭中",score:4,color:"#F6C98C"},{id:"music",icon:"🎧",label:"听歌",score:4,color:"#B9B4E7"},{id:"exercise",icon:"🏋️",label:"运动",score:4,color:"#9ED3B2"},{id:"sleepy",icon:"🥱",label:"困了",score:2,color:"#C4C7D9"},{id:"unwell",icon:"🤒",label:"不舒服",score:1,color:"#D6B9A8"},
  {id:"healing",icon:"🌿",label:"自我疗愈",score:4,color:"#A9D6AE"},{id:"sunset",icon:"🌅",label:"看风景",score:5,color:"#F3B79F"},{id:"reading",icon:"📖",label:"阅读",score:4,color:"#C9B998"},{id:"coffee",icon:"☕",label:"喝咖啡",score:4,color:"#C6AA95"},{id:"pet",icon:"🐾",label:"撸猫狗",score:5,color:"#E2BD96"},{id:"celebrate",icon:"🎉",label:"值得庆祝",score:5,color:"#F5AFC7"}
];
export const customMoodColor="#BFAFE2";
export function moodColor(id:string,fallback?:string){return moods.find(m=>m.id===id)?.color||fallback||customMoodColor}
const KEY="qingtian-local-data-v1";
const empty:Data={profile:null,notes:[],days:[],customMoods:[],privacy:null};
export function load():Data{try{const stored=JSON.parse(localStorage.getItem(KEY)||"");return{...empty,...stored,customMoods:stored.customMoods||[],privacy:stored.privacy||null,notes:(stored.notes||[]).map((n:Note)=>({...n,images:n.images||[],private:Boolean(n.private),moodColor:moodColor(n.mood,n.moodColor)})),days:(stored.days||[]).map((d:DayMood)=>({...d,moodColor:moodColor(d.mood,d.moodColor)}))}}catch{return empty}}
export function save(data:Data){localStorage.setItem(KEY,JSON.stringify(data))}
export const pad=(n:number)=>String(n).padStart(2,"0");export const dateKey=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;export const timeText=(iso:string)=>new Date(iso).toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",hour12:false});
export function summarize(notes:Note[],date:string):Mood{const valid=notes.filter(n=>n.date===date&&n.mood!=="unknown");if(!valid.length)return{id:"unknown",icon:"❔",label:"心情未知",score:3,color:"#D7DDE0"};if(valid.length===1&&valid[0].mood.startsWith("custom:"))return{id:valid[0].mood,icon:valid[0].moodIcon,label:valid[0].moodLabel,score:valid[0].moodScore,color:moodColor(valid[0].mood,valid[0].moodColor)};const avg=valid.reduce((s,n)=>s+n.moodScore,0)/valid.length,c=moods.filter(m=>Math.abs(m.score-avg)<.6);return c.find(m=>valid.some(n=>n.mood===m.id))||c[0]||moods[1]}
