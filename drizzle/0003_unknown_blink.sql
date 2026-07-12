CREATE TABLE `user_profiles` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`avatar` text DEFAULT '🌤️' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `journal_notes` ADD `time_unknown` integer DEFAULT false NOT NULL;