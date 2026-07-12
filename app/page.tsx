"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = { id:number; date:string; mood:string; moodLabel:string; moodIcon:string; updatedAt:string };
type Note = { id:number; date:string; content:string; recordedAt:string; updatedAt:string };
type MoodOption = { id:string; icon:string; label:string; group:string };
const moodOptions: MoodOption[] = [
  {id:"happy",icon:"😄",label:"开心",group:"心情"},{id:"calm",icon:"😌",label:"平静",group:"心情"},{id:"relaxed",icon:"☺️",label:"放松",group:"心情"},{id:"proud",icon:"😎",label:"得意",group:"心情"},{id:"moved",icon:"🥹",label:"感动",group:"心情"},{id:"sad",icon:"😢",label:"难过",group:"心情"},{id:"anxious",icon:"😰",label:"焦虑",group:"心情"},{id:"angry",icon:"😠",label:"生气",group:"心情"},{id:"tired",icon:"😫",label:"疲惫",group:"心情"},{id:"blank",icon:"😶",label:"发呆",group:"心情"},
  {id:"working",icon:"💻",label:"搬砖中",group:"此刻"},{id:"studying",icon:"📚",label:"学习中",group:"此刻"},{id:"busy",icon:"🏃",label:"忙碌",group:"此刻"},{id:"resting",icon:"🛋️",label:"休息",group:"此刻"},{id:"travel",icon:"✈️",label:"旅行",group:"此刻"},{id:"eating",icon:"🍜",label:"干饭中",group:"此刻"},{id:"music",icon:"🎧",label:"听歌",group:"此刻"},{id:"exercise",icon:"🏋️",label:"运动",group:"此刻"},{id:"sleepy",icon:"🥱",label:"困了",group:"此刻"},{id:"unwell",icon:"🤒",label:"不舒服",group:"此刻"},
  {id:"healing",icon:"🌿",label:"自我疗愈",group:"生活"},{id:"sunset",icon:"🌅",label:"看风景",group:"生活"},{id:"reading",icon:"📖",label:"阅读",group:"生活"},{id:"coffee",icon:"☕",label:"喝咖啡",group:"生活"},{id:"pet",icon:"🐾",label:"撸猫狗",group:"生活"},{id:"celebrate",icon:"🎉",label:"值得庆祝",group:"生活"},
];
const pad=(n:number)=>String(n).padStart(2,"0");
const dateKey=(d:Date)=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const timeText=(iso:string)=>new Date(iso).toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",hour12:false});

export default function Home(){
  const today=useMemo(()=>new Date(),[]);
  const [selectedDate,setSelectedDate]=useState(dateKey(today));
  const [viewDate,setViewDate]=useState(new Date(today.getFullYear(),today.getMonth(),1));
  const [entries,setEntries]=useState<Entry[]>([]); const [notes,setNotes]=useState<Note[]>([]);
  const [selected,setSelected]=useState<MoodOption|null>(null); const [content,setContent]=useState("");
  const [showAll,setShowAll]=useState(false); const [customOpen,setCustomOpen]=useState(false); const [customLabel,setCustomLabel]=useState(""); const [customIcon,setCustomIcon]=useState("✨");
  const [editingId,setEditingId]=useState<number|null>(null); const [editingText,setEditingText]=useState("");
  const [status,setStatus]=useState<"idle"|"saving"|"saved"|"error">("idle");

  useEffect(()=>{ if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js"); fetch("/api/moods").then(r=>r.ok?r.json():Promise.reject()).then(d=>{setEntries(d.entries??[]);setNotes(d.notes??[])}).catch(()=>setStatus("error")); },[]);
  useEffect(()=>{ const entry=entries.find(e=>e.date===selectedDate); setSelected(entry?{id:entry.mood,icon:entry.moodIcon||"😊",label:entry.moodLabel||entry.mood,group:"已记录"}:null); setContent(""); setEditingId(null); },[selectedDate,entries]);
  const days=useMemo(()=>{const y=viewDate.getFullYear(),m=viewDate.getMonth(),first=new Date(y,m,1).getDay(),total=new Date(y,m+1,0).getDate();return [...Array(first).fill(null),...Array.from({length:total},(_,i)=>i+1)]},[viewDate]);
  const dayNotes=notes.filter(n=>n.date===selectedDate).sort((a,b)=>a.recordedAt.localeCompare(b.recordedAt));
  const visibleMoods=showAll?moodOptions:moodOptions.slice(0,10);

  async function save(){ if(!selected)return; setStatus("saving"); try{const r=await fetch("/api/moods",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({date:selectedDate,mood:selected.id,moodLabel:selected.label,moodIcon:selected.icon,content})});if(!r.ok)throw new Error();const d=await r.json();setEntries(cur=>[...cur.filter(e=>e.date!==selectedDate),d.entry]);if(d.note)setNotes(cur=>[...cur,d.note]);setContent("");setStatus("saved");setTimeout(()=>setStatus("idle"),1600)}catch{setStatus("error")}}
  async function updateNote(id:number){const text=editingText.trim();if(!text)return;const r=await fetch(`/api/notes/${id}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({content:text})});if(r.ok){const {note}=await r.json();setNotes(cur=>cur.map(n=>n.id===id?note:n));setEditingId(null)}}
  async function deleteNote(id:number){if(!window.confirm("删除这条随笔吗？删除后无法恢复。"))return;const r=await fetch(`/api/notes/${id}`,{method:"DELETE"});if(r.ok)setNotes(cur=>cur.filter(n=>n.id!==id))}
  function addCustom(){const label=customLabel.trim().slice(0,20);if(!label)return;setSelected({id:`custom:${label}`,icon:customIcon||"✨",label,group:"自定义"});setCustomOpen(false);setCustomLabel("")}
  const displayDate=new Date(`${selectedDate}T12:00:00`),isToday=selectedDate===dateKey(today);

  return <main>
    <header className="topbar"><a className="brand" href="#today"><span className="brand-sun">☀</span>晴天</a><p>把每一种心情，都好好收下</p></header>
    <section className="hero" id="today"><div className="sky-decor cloud-one"/><div className="sky-decor cloud-two"/>
      <div className="date-pill">{isToday?"今天":`${displayDate.getMonth()+1}月${displayDate.getDate()}日`} · {displayDate.toLocaleDateString("zh-CN",{weekday:"long"})}</div>
      <h1>{isToday?"此刻，你是什么状态？":"那一天，你是什么状态？"}</h1><p className="hero-copy">情绪、生活、身体，都可以被看见。</p>
      <div className="mood-panel"><div className="mood-grid">{visibleMoods.map(item=><button key={item.id} className={`mood-chip ${selected?.id===item.id?"selected":""}`} onClick={()=>setSelected(item)} aria-pressed={selected?.id===item.id}><span>{item.icon}</span><small>{item.label}</small></button>)}<button className="mood-chip custom" onClick={()=>setCustomOpen(true)}><span>＋</span><small>自定义</small></button></div><button className="expand-button" onClick={()=>setShowAll(v=>!v)}>{showAll?"收起状态":"更多状态 · 生活与此刻"} {showAll?"↑":"↓"}</button></div>
      {customOpen&&<div className="custom-box"><div className="custom-row"><input className="emoji-input" value={customIcon} maxLength={4} onChange={e=>setCustomIcon(e.target.value)} aria-label="状态图标"/><input value={customLabel} maxLength={20} onChange={e=>setCustomLabel(e.target.value)} placeholder="比如：想静一静" aria-label="自定义状态名称"/></div><div className="custom-actions"><button onClick={()=>setCustomOpen(false)}>取消</button><button className="primary" onClick={addCustom}>使用这个状态</button></div></div>}
      <div className={`note-card ${selected?"active":""}`}><div className="note-heading"><span>{selected?.icon??"✍️"}</span><div><strong>{selected?`记录「${selected.label}」时的这一刻`:"先选一个最接近的状态"}</strong><small>保存时会自动记录当前时间</small></div></div><textarea value={content} onChange={e=>setContent(e.target.value)} disabled={!selected} maxLength={500} placeholder="刚刚发生了什么？想写多少都可以……"/><div className="note-footer"><span>{content.length} / 500</span><button onClick={save} disabled={!selected||status==="saving"}>{status==="saving"?"保存中…":status==="saved"?"已保存 ✓":content.trim()?"保存这条随笔":"只保存状态"}</button></div>{status==="error"&&<p className="error">暂时没保存成功，请稍后再试。</p>}</div>
      {dayNotes.length>0&&<div className="timeline"><div className="timeline-title"><strong>{selected?.icon} {displayDate.getMonth()+1}月{displayDate.getDate()}日的随笔</strong><span>{dayNotes.length} 条</span></div>{dayNotes.map(note=><article className="note-item" key={note.id}><time>{timeText(note.recordedAt)}</time>{editingId===note.id?<div className="edit-area"><textarea value={editingText} maxLength={500} onChange={e=>setEditingText(e.target.value)}/><div><button onClick={()=>setEditingId(null)}>取消</button><button className="primary" onClick={()=>updateNote(note.id)}>保存修改</button></div></div>:<><p>{note.content}</p><div className="item-actions"><button onClick={()=>{setEditingId(note.id);setEditingText(note.content)}}>修改</button><button className="danger" onClick={()=>deleteNote(note.id)}>删除</button></div></>}</article>)}</div>}
    </section>
    <section className="calendar-section"><div className="section-title"><div><span>心情足迹</span><h2>这个月的天空</h2></div><p>点开有记录的一天，查看那天每个时刻。</p></div><div className="calendar-card"><div className="calendar-nav"><button onClick={()=>setViewDate(new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1))}>←</button><strong>{viewDate.getFullYear()}年 {viewDate.getMonth()+1}月</strong><button onClick={()=>setViewDate(new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1))}>→</button></div><div className="weekdays">{["日","一","二","三","四","五","六"].map(d=><span key={d}>{d}</span>)}</div><div className="calendar-grid">{days.map((day,i)=>{if(!day)return <span key={`b${i}`}/>;const key=dateKey(new Date(viewDate.getFullYear(),viewDate.getMonth(),day)),entry=entries.find(e=>e.date===key);return <button key={key} className={`${key===selectedDate?"selected-day":""} ${key===dateKey(today)?"today":""}`} onClick={()=>{setSelectedDate(key);window.setTimeout(()=>document.getElementById("today")?.scrollIntoView(),30)}}><span>{day}</span><em>{entry?.moodIcon??""}</em></button>})}</div></div></section>
    <footer><span>☀</span><p>添加到手机主屏幕，随时记下这一刻。<br/>云层后面，光一直都在。</p></footer>
  </main>
}
