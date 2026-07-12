CREATE TABLE `journal_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`content` text NOT NULL,
	`recorded_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `mood_entries` ADD `mood_label` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `mood_entries` ADD `mood_icon` text DEFAULT '😊' NOT NULL;
--> statement-breakpoint
INSERT INTO `journal_notes` (`date`, `content`, `recorded_at`, `updated_at`)
SELECT `date`, `note`, `updated_at`, `updated_at` FROM `mood_entries` WHERE trim(`note`) <> '';
--> statement-breakpoint
UPDATE `mood_entries` SET `mood_label` = CASE `mood`
  WHEN 'sunny' THEN '开心' WHEN 'calm' THEN '平静' WHEN 'cloudy' THEN '低落'
  WHEN 'rainy' THEN '难过' WHEN 'stormy' THEN '很糟' ELSE `mood` END
WHERE `mood_label` = '';
--> statement-breakpoint
UPDATE `mood_entries` SET `mood_icon` = CASE `mood`
  WHEN 'sunny' THEN '😊' WHEN 'calm' THEN '😌' WHEN 'cloudy' THEN '😕'
  WHEN 'rainy' THEN '😢' WHEN 'stormy' THEN '😭' ELSE '✨' END;
