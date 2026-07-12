import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const moodEntries = sqliteTable("mood_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  mood: text("mood").notNull(),
  moodLabel: text("mood_label").notNull().default(""),
  moodIcon: text("mood_icon").notNull().default("😊"),
  note: text("note").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("mood_entries_date_unique").on(table.date)]);

export const journalNotes = sqliteTable("journal_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  content: text("content").notNull(),
  recordedAt: text("recorded_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
