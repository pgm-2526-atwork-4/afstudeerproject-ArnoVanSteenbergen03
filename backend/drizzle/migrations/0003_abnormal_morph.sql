ALTER TABLE "activities" DROP CONSTRAINT "activities_provider_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "applications" DROP CONSTRAINT "applications_reviewed_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_granted_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;