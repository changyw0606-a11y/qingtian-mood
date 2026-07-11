"use client";

import { useEffect, useMemo, useState } from "react";

type Mood = "sunny" | "calm" | "cloudy" | "rainy" | "stormy";
type Entry = { id: number; date: string; mood: Mood; note: string; updatedAt: string };

const moods: { id: Mood; face: string; label: string; color: string }[] = [
  { id: "sunny", face: "😊", label: "开心", color: "#ffc857" },
  { id: "calm", face: "😌", label: "平静", color: "#9ac8bd" },
  { id: "cloudy", face: "😕", label: "低落", color: "#aeb7c5" },
  { id: "rainy", face: "😢", label: "难过", color: "#7ea7cf" },
  { id: "stormy", face: "😭", label: "很糟", color: "#8f8aaa" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function Home() {
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(dateKey(today));
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [mood, setMood] = useState<Mood | null>(null);
  const [note, setNote] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetch("/api/moods")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => setEntries(data.entries ?? []))
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    const entry = entries.find((item) => item.date === selectedDate);
    setMood(entry?.mood ?? null);
    setNote(entry?.note ?? "");
    setStatus("idle");
  }, [selectedDate, entries]);

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];
  }, [viewDate]);

  async function saveEntry() {
    if (!mood) return;
    setStatus("saving");
    try {
      const response = await fetch("/api/moods", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ date: selectedDate, mood, note }),
      });
      if (!response.ok) throw new Error();
      const { entry } = await response.json();
      setEntries((current) => [...current.filter((item) => item.date !== selectedDate), entry]);
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 1800);
    } catch { setStatus("error"); }
  }

  const chosen = moods.find((item) => item.id === mood);
  const displayDate = new Date(`${selectedDate}T12:00:00`);
  const isToday = selectedDate === dateKey(today);

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#today" aria-label="晴天首页"><span className="brand-sun">☀</span> 晴天</a>
        <p>把每一种心情，都好好收下</p>
      </header>

      <section className="hero" id="today">
        <div className="sky-decor cloud-one" /><div className="sky-decor cloud-two" />
        <div className="date-pill">{isToday ? "今天" : `${displayDate.getMonth() + 1}月${displayDate.getDate()}日`} · {displayDate.toLocaleDateString("zh-CN", { weekday: "long" })}</div>
        <h1>{isToday ? "今天的心里，是什么天气？" : "那一天，心里是什么天气？"}</h1>
        <p className="hero-copy">不用急着变好，先诚实地感受这一刻。</p>

        <div className="mood-picker" role="radiogroup" aria-label="选择心情">
          {moods.map((item) => (
            <button key={item.id} type="button" className={`mood-button ${mood === item.id ? "selected" : ""}`}
              style={{ "--mood-color": item.color } as React.CSSProperties}
              onClick={() => setMood(item.id)} aria-pressed={mood === item.id}>
              <span>{item.face}</span><small>{item.label}</small>
            </button>
          ))}
        </div>

        <div className={`note-card ${mood ? "active" : ""}`}>
          <div className="note-heading"><span>{chosen?.face ?? "✍️"}</span><div><strong>{mood ? `想和「${chosen?.label}」的自己说点什么？` : "选一个最接近的心情"}</strong><small>写几句也好，一个词也好</small></div></div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} disabled={!mood}
            maxLength={300} placeholder="今天发生了什么？此刻的身体和心里，有什么感觉……" aria-label="心情笔记" />
          <div className="note-footer"><span>{note.length} / 300</span><button onClick={saveEntry} disabled={!mood || status === "saving"}>{status === "saving" ? "保存中…" : status === "saved" ? "已收进晴天里 ✓" : "保存今天"}</button></div>
          {status === "error" && <p className="error">暂时没保存成功，请稍后再试。</p>}
        </div>
      </section>

      <section className="calendar-section">
        <div className="section-title"><div><span>心情足迹</span><h2>这个月的天空</h2></div><p>回头看，每一天都算数。</p></div>
        <div className="calendar-card">
          <div className="calendar-nav"><button aria-label="上个月" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>←</button><strong>{viewDate.getFullYear()}年 {viewDate.getMonth() + 1}月</strong><button aria-label="下个月" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>→</button></div>
          <div className="weekdays">{["日","一","二","三","四","五","六"].map((d) => <span key={d}>{d}</span>)}</div>
          <div className="calendar-grid">{days.map((day, i) => {
            if (!day) return <span key={`blank-${i}`} />;
            const key = dateKey(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
            const entry = entries.find((item) => item.date === key);
            const itemMood = moods.find((item) => item.id === entry?.mood);
            return <button key={key} className={`${key === selectedDate ? "selected-day" : ""} ${key === dateKey(today) ? "today" : ""}`} onClick={() => setSelectedDate(key)}><span>{day}</span><em>{itemMood?.face ?? ""}</em></button>;
          })}</div>
        </div>
      </section>

      <footer><span>☀</span><p>愿你允许天空有阴晴，也始终记得——<br />云层后面，光一直都在。</p></footer>
    </main>
  );
}
