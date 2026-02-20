ALTER TABLE "activities"
    RENAME COLUMN "metrics" TO "vehicle_id";
--> statement-breakpoint
ALTER TABLE "activities"
    ALTER COLUMN "vehicle_id" TYPE uuid
    USING (
        CASE
            WHEN "vehicle_id" IS NULL THEN NULL
            WHEN jsonb_typeof("vehicle_id") = 'string'
                AND trim(both '"' from "vehicle_id"::text) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
            THEN trim(both '"' from "vehicle_id"::text)::uuid
            ELSE NULL
        END
    );
--> statement-breakpoint
ALTER TABLE "activities"
ADD CONSTRAINT "activities_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;