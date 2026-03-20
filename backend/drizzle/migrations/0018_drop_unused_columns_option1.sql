ALTER TABLE "goods" DROP CONSTRAINT "goods_distribution_activity_id_activities_id_fk";
--> statement-breakpoint
ALTER TABLE "goods" DROP CONSTRAINT "goods_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "goods" DROP COLUMN "distribution_activity_id";--> statement-breakpoint
ALTER TABLE "goods" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "user_permissions" DROP COLUMN "granted_at";