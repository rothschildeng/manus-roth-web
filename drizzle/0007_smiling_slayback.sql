CREATE TABLE `vccEntitlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`maskedReference` varchar(128) NOT NULL,
	`status` enum('prepared','handed_off','revoked') NOT NULL DEFAULT 'prepared',
	`handoffNote` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vccEntitlements_id` PRIMARY KEY(`id`),
	CONSTRAINT `vccEntitlements_orderId_unique` UNIQUE(`orderId`)
);
