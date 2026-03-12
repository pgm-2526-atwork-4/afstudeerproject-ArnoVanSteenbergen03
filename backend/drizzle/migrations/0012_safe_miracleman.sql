ALTER TABLE "activities" ADD COLUMN "weekly" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "monthly" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "recurrence_days" jsonb;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "recurrence_time" text;