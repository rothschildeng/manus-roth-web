CREATE TABLE `orderNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`customerId` int,
	`event` enum('payment_confirmed','pending_review','approved','rejected','fulfillment_ready','delivered') NOT NULL,
	`channel` enum('in_app','email','whatsapp','telegram') NOT NULL DEFAULT 'in_app',
	`status` enum('recorded','queued','sent','failed') NOT NULL DEFAULT 'recorded',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orderNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productFavorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productId` varchar(256) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productFavorites_id` PRIMARY KEY(`id`),
	CONSTRAINT `productFavorites_user_product_unique` UNIQUE(`userId`,`productId`)
);
--> statement-breakpoint
CREATE TABLE `savedAddresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(64) NOT NULL,
	`recipientName` varchar(160) NOT NULL,
	`line1` varchar(255) NOT NULL,
	`line2` varchar(255),
	`city` varchar(120) NOT NULL,
	`region` varchar(120),
	`postalCode` varchar(32) NOT NULL,
	`country` varchar(96) NOT NULL,
	`phone` varchar(48),
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedAddresses_id` PRIMARY KEY(`id`)
);
