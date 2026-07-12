import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const moodEntries = sqliteTable("mood_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull().default(""),
  date: text("date").notNull(),
  mood: text("mood").notNull(),
  moodLabel: text("mood_label").notNull().default(""),
  moodIcon: text("mood_icon").notNull().default("😊"),
  summaryManual: integer("summary_manual", { mode: "boolean" }).notNull().default(false),
  note: text("note").notNull().default(""),
  updatedAt: text("updated_at").notNull(),
}, (table) => [uniqueIndex("mood_entries_owner_date_unique").on(table.ownerId, table.date)]);

export const journalNotes = sqliteTable("journal_notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull().default(""),
  date: text("date").notNull(),
  content: text("content").notNull(),
  mood: text("mood").notNull().default("calm"),
  moodLabel: text("mood_label").notNull().default("平静"),
  moodIcon: text("mood_icon").notNull().default("😌"),
  moodScore: integer("mood_score").notNull().default(3),
  timeUnknown: integer("time_unknown", { mode: "boolean" }).notNull().default(false),
  recordedAt: text("recorded_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const userProfiles = sqliteTable("user_profiles", {
  ownerId: text("owner_id").primaryKey(),
  nickname: text("nickname").notNull(),
  avatar: text("avatar").notNull().default("🌤️"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
