ALTER TABLE `walletDeposits` MODIFY COLUMN `sourceType` enum('gift_card_review','crypto_review','other_manual') NOT NULL DEFAULT 'gift_card_review';--> statement-breakpoint
ALTER TABLE `walletDeposits` MODIFY COLUMN `status` enum('awaiting_payment','pending_review','approved','rejected','cancelled') NOT NULL DEFAULT 'pending_review';--> statement-breakpoint
ALTER TABLE `paymentOrders` ADD `quantity` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `paymentOrders` ADD `purpose` enum('purchase','wallet_deposit') DEFAULT 'purchase' NOT NULL;--> statement-breakpoint
ALTER TABLE `walletDeposits` ADD `paymentOrderId` varchar(64);--> statement-breakpoint
ALTER TABLE `walletDeposits` ADD CONSTRAINT `walletDeposits_paymentOrderId_unique` UNIQUE(`paymentOrderId`);