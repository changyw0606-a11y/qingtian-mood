export type MoodOption={id:string;icon:string;label:string;score:number};
export const moods:MoodOption[]=[
 {id:"happy",icon:"😄",label:"开心",score:5},{id:"calm",icon:"😌",label:"平静",score:4},{id:"relaxed",icon:"☺️",label:"放松",score:4},{id:"proud",icon:"😎",label:"得意",score:5},{id:"moved",icon:"🥹",label:"感动",score:4},{id:"blank",icon:"😶",label:"发呆",score:3},{id:"tired",icon:"😫",label:"疲惫",score:2},{id:"anxious",icon:"😰",label:"焦虑",score:2},{id:"sad",icon:"😢",label:"难过",score:1},{id:"angry",icon:"😠",label:"生气",score:1},
 {id:"working",icon:"💻",label:"搬砖中",score:3},{id:"studying",icon:"📚",label:"学习中",score:3},{id:"busy",icon:"🏃",label:"忙碌",score:2},{id:"resting",icon:"🛋️",label:"休息",score:4},{id:"travel",icon:"✈️",label:"旅行",score:5},{id:"eating",icon:"🍜",label:"干饭中",score:4},{id:"music",icon:"🎧",label:"听歌",score:4},{id:"exercise",icon:"🏋️",label:"运动",score:4},{id:"sleepy",icon:"🥱",label:"困了",score:2},{id:"unwell",icon:"🤒",label:"不舒服",score:1},{id:"healing",icon:"🌿",label:"自我疗愈",score:4},{id:"sunset",icon:"🌅",label:"看风景",score:5},{id:"reading",icon:"📖",label:"阅读",score:4},{id:"coffee",icon:"☕",label:"喝咖啡",score:4},{id:"pet",icon:"🐾",label:"撸猫狗",score:5},{id:"celebrate",icon:"🎉",label:"值得庆祝",score:5}
];
export const pad=(n:number)=>String(n).padStart(2,"0");
export const dateKey=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
export const timeText=(iso:string)=>new Date(iso).toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",hour12:false});
