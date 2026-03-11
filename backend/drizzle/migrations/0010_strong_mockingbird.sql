DROP INDEX "goods_type_status_idx";--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "damaged_goods" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "goods" ADD COLUMN "good_state" text DEFAULT 'fresh' NOT NULL;--> statement-breakpoint
ALTER TABLE "goods" ADD COLUMN "over_due_date" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "goods_state_status_idx" ON "goods" USING btree ("good_state","status");--> statement-breakpoint
ALTER TABLE "goods" DROP COLUMN "good_type";