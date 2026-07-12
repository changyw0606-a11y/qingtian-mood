DROP INDEX `mood_entries_date_unique`;--> statement-breakpoint
ALTER TABLE `mood_entries` ADD `owner_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `mood_entries` ADD `summary_manual` integer DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `mood_entries_owner_date_unique` ON `mood_entries` (`owner_id`,`date`);--> statement-breakpoint
ALTER TABLE `journal_notes` ADD `owner_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `journal_notes` ADD `mood` text DEFAULT 'calm' NOT NULL;--> statement-breakpoint
ALTER TABLE `journal_notes` ADD `mood_label` text DEFAULT '平静' NOT NULL;--> statement-breakpoint
ALTER TABLE `journal_notes` ADD `mood_icon` text DEFAULT '😌' NOT NULL;--> statement-breakpoint
ALTER TABLE `journal_notes` ADD `mood_score` integer DEFAULT 3 NOT NULL;