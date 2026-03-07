ALTER TABLE "goods" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "goods" DROP COLUMN "latitude";--> statement-breakpoint
ALTER TABLE "goods" DROP COLUMN "longitude";--> statement-breakpoint
ALTER TABLE "goods" DROP COLUMN "geom";--> statement-breakpoint
ALTER TABLE "goods" DROP COLUMN "notes";