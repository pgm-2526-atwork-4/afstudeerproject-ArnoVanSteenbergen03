import "dotenv/config";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing");
}

const sql = postgres(connectionString, { max: 1 });

async function main() {
  await sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`;

  await sql`
    DO $$
    DECLARE
      record_item RECORD;
    BEGIN
      FOR record_item IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
      LOOP
        EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', 'public', record_item.tablename);
      END LOOP;
    END $$;
  `;

  console.log(
    "Dropped all tables in public schema and cleared drizzle migration history",
  );
  await sql.end();
}

main().catch(async (error) => {
  console.error(error);
  await sql.end();
  process.exit(1);
});
