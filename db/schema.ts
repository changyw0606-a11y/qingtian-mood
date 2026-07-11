import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const moodEntries = sqliteTable("mood_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  date: text("date").notNull(),
  mood: text("mood", { enum: ["sunny", "calm", "cloudy", "rainy", "stormy"] }).notNull(),
  note: text("note").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("mood_entries_date_unique").on(table.date)]);
