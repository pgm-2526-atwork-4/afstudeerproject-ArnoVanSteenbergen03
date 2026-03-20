CREATE TABLE "activity_drivers" (
	"activity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'helper' NOT NULL,
	"accepted_at" timestamp DEFAULT now(),
	CONSTRAINT "activity_drivers_activity_id_user_id_pk" PRIMARY KEY("activity_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "activity_drivers" ADD CONSTRAINT "activity_drivers_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_drivers" ADD CONSTRAINT "activity_drivers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_drivers_user_idx" ON "activity_drivers" USING btree ("user_id");