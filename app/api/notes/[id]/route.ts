import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { journalNotes } from "../../../../db/schema";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const content = String(((await request.json()) as { content?: string }).content ?? "").trim().slice(0, 500);
  if (!content) return Response.json({ error: "随笔不能为空" }, { status: 400 });
  const [note] = await getDb().update(journalNotes).set({ content, updatedAt: new Date().toISOString() }).where(eq(journalNotes.id, Number(id))).returning();
  return note ? Response.json({ note }) : Response.json({ error: "记录不存在" }, { status: 404 });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await getDb().delete(journalNotes).where(eq(journalNotes.id, Number(id)));
  return new Response(null, { status: 204 });
}
