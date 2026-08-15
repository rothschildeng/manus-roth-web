CREATE TABLE `paymentOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`itemId` varchar(96) NOT NULL,
	`chain` enum('TON','USDT_BEP20','SOLANA','BTC','ETH') NOT NULL,
	`asset` varchar(24) NOT NULL,
	`expectedUsd` decimal(18,2) NOT NULL,
	`expectedAmount` decimal(36,18) NOT NULL,
	`receivingAddress` varchar(128) NOT NULL,
	`status` enum('awaiting_payment','detected','confirming','pending_admin','approved','rejected','expired') NOT NULL DEFAULT 'awaiting_payment',
	`txHash` varchar(160),
	`confirmations` int NOT NULL DEFAULT 0,
	`requiredConfirmations` int NOT NULL DEFAULT 1,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `paymentOrders_orderId_unique` UNIQUE(`orderId`)
);
--> statement-breakpoint
CREATE TABLE `paymentTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`chain` enum('TON','USDT_BEP20','SOLANA','BTC','ETH') NOT NULL,
	`txHash` varchar(160) NOT NULL,
	`amount` decimal(36,18) NOT NULL,
	`confirmations` int NOT NULL DEFAULT 0,
	`observedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paymentTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
