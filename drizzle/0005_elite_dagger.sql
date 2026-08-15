CREATE TABLE `giftCardEntitlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderId` varchar(64),
	`title` varchar(255) NOT NULL,
	`codeMasked` varchar(128) NOT NULL,
	`status` enum('issued','redeemed','expired') NOT NULL DEFAULT 'issued',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `giftCardEntitlements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referralCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`code` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referralCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referralCodes_ownerUserId_unique` UNIQUE(`ownerUserId`),
	CONSTRAINT `referralCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referralEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralCodeId` int NOT NULL,
	`referrerUserId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`status` enum('registered','qualified','credited','rejected') NOT NULL DEFAULT 'registered',
	`bonusAmount` decimal(18,2) NOT NULL DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referralEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `referralEvents_referredUserId_unique` UNIQUE(`referredUserId`)
);
--> statement-breakpoint
CREATE TABLE `walletAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currency` enum('USD') NOT NULL DEFAULT 'USD',
	`availableBalance` decimal(18,2) NOT NULL DEFAULT '0.00',
	`version` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `walletAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `walletAccounts_user_currency_unique` UNIQUE(`userId`,`currency`)
);
--> statement-breakpoint
CREATE TABLE `walletDeposits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requestCode` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`currency` enum('USD') NOT NULL DEFAULT 'USD',
	`requestedAmount` decimal(18,2) NOT NULL,
	`proposedBonus` decimal(18,2) NOT NULL DEFAULT '0.00',
	`sourceType` enum('gift_card_review','other_manual') NOT NULL DEFAULT 'gift_card_review',
	`referenceMasked` varchar(128) NOT NULL,
	`status` enum('pending_review','approved','rejected','cancelled') NOT NULL DEFAULT 'pending_review',
	`adminId` int,
	`reviewNote` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `walletDeposits_id` PRIMARY KEY(`id`),
	CONSTRAINT `walletDeposits_requestCode_unique` UNIQUE(`requestCode`)
);
--> statement-breakpoint
CREATE TABLE `walletLedger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletAccountId` int NOT NULL,
	`userId` int NOT NULL,
	`depositRequestId` int,
	`kind` enum('deposit_credit','deposit_bonus','manual_adjustment','order_debit') NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`balanceAfter` decimal(18,2) NOT NULL,
	`idempotencyKey` varchar(96) NOT NULL,
	`description` varchar(255) NOT NULL,
	`createdByAdminId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `walletLedger_id` PRIMARY KEY(`id`),
	CONSTRAINT `walletLedger_idempotencyKey_unique` UNIQUE(`idempotencyKey`)
);
