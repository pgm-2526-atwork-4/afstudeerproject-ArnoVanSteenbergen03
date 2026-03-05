ALTER TABLE "activities" ADD COLUMN "order_time" timestamp;--> statement-breakpoint
UPDATE "activities" SET "order_time" = "pickup_time";--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "order_time" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" DROP COLUMN "pickup_time";