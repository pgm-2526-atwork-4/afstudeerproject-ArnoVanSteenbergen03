import { db } from "@/config/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function generateUsername(firstname: string, lastname: string): Promise<string> {
  let username = `${firstname}${lastname}`.toLowerCase().replace(/\s+/g, "");
  let counter = 1;

  while (
    await db.query.users.findFirst({
      where: eq(users.username, username),
    })
  ) {
    username = `${firstname}${lastname}${counter}`.toLowerCase().replace(/\s+/g, "");
    counter++;
  }

  return username;
}
