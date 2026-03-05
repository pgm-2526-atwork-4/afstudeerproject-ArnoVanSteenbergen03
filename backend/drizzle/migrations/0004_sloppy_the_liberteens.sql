CREATE TABLE "collection_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"good_type" text NOT NULL,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit" text NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"source_place_id" uuid,
	"current_place_id" uuid,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"geom" jsonb,
	"source_activity_id" serial NOT NULL,
	"distribution_activity_id" uuid,
	"metadata" jsonb,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
DROP TABLE "food_items" CASCADE;--> statement-breakpoint
ALTER TABLE "activities" RENAME COLUMN "pickup_address" TO "location";--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "activity_type" varchar(20) DEFAULT 'collection';--> statement-breakpoint
UPDATE "activities" SET "activity_type" = 'collection' WHERE "activity_type" IS NULL;--> statement-breakpoint
ALTER TABLE "activities" ALTER COLUMN "activity_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_activities" ADD CONSTRAINT "collection_activities_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods" ADD CONSTRAINT "goods_source_place_id_places_id_fk" FOREIGN KEY ("source_place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods" ADD CONSTRAINT "goods_current_place_id_places_id_fk" FOREIGN KEY ("current_place_id") REFERENCES "public"."places"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods" ADD CONSTRAINT "goods_source_activity_id_collection_activities_id_fk" FOREIGN KEY ("source_activity_id") REFERENCES "public"."collection_activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods" ADD CONSTRAINT "goods_distribution_activity_id_activities_id_fk" FOREIGN KEY ("distribution_activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goods" ADD CONSTRAINT "goods_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "collection_activity_idx" ON "collection_activities" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX "goods_type_status_idx" ON "goods" USING btree ("good_type","status");--> statement-breakpoint
CREATE INDEX "goods_source_place_idx" ON "goods" USING btree ("source_place_id");--> statement-breakpoint
CREATE INDEX "goods_current_place_idx" ON "goods" USING btree ("current_place_id");--> statement-breakpoint
CREATE INDEX "goods_source_activity_idx" ON "goods" USING btree ("source_activity_id");