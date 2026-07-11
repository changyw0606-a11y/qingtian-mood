import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { moodEntries } from "../../../db/schema";

const validMoods = new Set(["sunny", "calm", "cloudy", "rainy", "stormy"]);
const validDate = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  try {
    const entries = await getDb().select().from(moodEntries).orderBy(desc(moodEntries.date)).limit(370);
    return Response.json({ entries });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "读取失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { date?: string; mood?: string; note?: string };
    if (!body.date || !validDate.test(body.date) || !body.mood || !validMoods.has(body.mood)) {
      return Response.json({ error: "请提供有效的日期和心情" }, { status: 400 });
    }
    const note = String(body.note ?? "").trim().slice(0, 300);
    const updatedAt = new Date().toISOString();
    const db = getDb();
    await db.insert(moodEntries).values({ date: body.date, mood: body.mood as "sunny", note, updatedAt })
      .onConflictDoUpdate({ target: moodEntries.date, set: { mood: body.mood as "sunny", note, updatedAt } });
    const [entry] = await db.select().from(moodEntries).where(eq(moodEntries.date, body.date)).limit(1);
    return Response.json({ entry });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "保存失败" }, { status: 500 });
  }
}
