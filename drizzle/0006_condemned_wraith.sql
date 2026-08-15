CREATE TABLE `walletNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`depositRequestId` int NOT NULL,
	`event` enum('deposit_created','deposit_approved','deposit_rejected') NOT NULL,
	`channel` enum('in_app','email','whatsapp','telegram') NOT NULL DEFAULT 'in_app',
	`status` enum('recorded','queued','sent','failed') NOT NULL DEFAULT 'recorded',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `walletNotifications_id` PRIMARY KEY(`id`)
);
