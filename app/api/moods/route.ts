import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { journalNotes, moodEntries } from "../../../db/schema";

const validDate = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  try {
    const db = getDb();
    const [entries, notes] = await Promise.all([
      db.select().from(moodEntries).orderBy(desc(moodEntries.date)).limit(370),
      db.select().from(journalNotes).orderBy(asc(journalNotes.recordedAt)).limit(2000),
    ]);
    return Response.json({ entries, notes });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "读取失败" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { date?: string; mood?: string; moodLabel?: string; moodIcon?: string; content?: string };
    if (!body.date || !validDate.test(body.date) || !body.mood || !body.moodLabel || !body.moodIcon) return Response.json({ error: "请先选择状态" }, { status: 400 });
    const db = getDb();
    const now = new Date().toISOString();
    await db.insert(moodEntries).values({ date: body.date, mood: body.mood.slice(0, 40), moodLabel: body.moodLabel.slice(0, 20), moodIcon: body.moodIcon.slice(0, 8), updatedAt: now })
      .onConflictDoUpdate({ target: moodEntries.date, set: { mood: body.mood.slice(0, 40), moodLabel: body.moodLabel.slice(0, 20), moodIcon: body.moodIcon.slice(0, 8), updatedAt: now } });
    let note = null;
    const content = String(body.content ?? "").trim().slice(0, 500);
    if (content) [note] = await db.insert(journalNotes).values({ date: body.date, content, recordedAt: now, updatedAt: now }).returning();
    const [entry] = await db.select().from(moodEntries).where(eq(moodEntries.date, body.date)).limit(1);
    return Response.json({ entry, note });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 500 }); }
}
