CREATE TABLE `deep_analysis_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`final_content` text NOT NULL,
	`sections` text NOT NULL,
	`rating` text,
	`target_price_low` real,
	`target_price_high` real,
	`model_version` text NOT NULL,
	`prompt_version` text NOT NULL,
	`duration_ms` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
