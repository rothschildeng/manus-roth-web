CREATE TABLE `productAvailability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` varchar(256) NOT NULL,
	`unavailable` boolean NOT NULL DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productAvailability_id` PRIMARY KEY(`id`),
	CONSTRAINT `productAvailability_productId_unique` UNIQUE(`productId`)
);
--> statement-breakpoint
ALTER TABLE `paymentOrders` MODIFY COLUMN `itemId` varchar(256) NOT NULL;--> statement-breakpoint
ALTER TABLE `paymentOrders` ADD `customerId` int;