CREATE TABLE `analysis_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`content` text NOT NULL,
	`rating` text,
	`target_price_low` real,
	`target_price_high` real,
	`model_version` text NOT NULL,
	`prompt_version` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `financial_cache` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`report_type` text NOT NULL,
	`period` text NOT NULL,
	`fiscal_year` text NOT NULL,
	`data` text NOT NULL,
	`fetched_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `financial_cache_unique` ON `financial_cache` (`symbol`,`report_type`,`period`,`fiscal_year`);--> statement-breakpoint
CREATE TABLE `stock_prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`price` real,
	`change_percent` real,
	`market_cap` real,
	`pe_ratio` real,
	`week_52_high` real,
	`week_52_low` real,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stock_prices_symbol_unique` ON `stock_prices` (`symbol`);--> statement-breakpoint
CREATE TABLE `watchlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`symbol` text NOT NULL,
	`name` text NOT NULL,
	`sector` text,
	`added_at` text DEFAULT CURRENT_TIMESTAMP,
	`notes` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `watchlist_symbol_unique` ON `watchlist` (`symbol`);