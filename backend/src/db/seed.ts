import "dotenv/config";
import { faker } from "@faker-js/faker";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { hash } from "bcrypt";
import {
  users,
  roles,
  userRoles,
  places,
  vehicles,
  activities,
  foodItems,
} from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is missing");

const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

faker.seed(42);

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  // roles
  const insertedRoles = await db
    .insert(roles)
    .values([
      { roleName: "admin" },
      { roleName: "provider" },
      { roleName: "volunteer" },
      { roleName: "centerManager" },
      { roleName: "manager" },
    ])
    .onConflictDoNothing()
    .returning();

  const allRoles = insertedRoles.length
    ? insertedRoles
    : await db.select().from(roles);

  // users
  const passwordHash = await hash("Test1234!", 10);
  const insertedUsers = await db
    .insert(users)
    .values(
      Array.from({ length: 12 }).map(() => {
        const firstname = faker.person.firstName();
        const lastname = faker.person.lastName();
        let username = `${firstname}${lastname}`.toLowerCase();
        return {
          email: faker.internet.email().toLowerCase(),
          firstname,
          lastname,
          username,
          password: passwordHash,
        };
      }),
    )
    .returning();

  // user_roles
  for (const u of insertedUsers) {
    const count = faker.number.int({ min: 1, max: 2 });
    const picked = faker.helpers.arrayElements(allRoles, count);
    await db
      .insert(userRoles)
      .values(picked.map((r) => ({ userId: u.id, roleId: r.id })))
      .onConflictDoNothing();
  }

  // places
  const insertedPlaces = await db
    .insert(places)
    .values(
      Array.from({ length: 8 }).map((_, i) => ({
        name: faker.company.name(),
        geojson: {
          type: "Point",
          coordinates: [faker.location.longitude(), faker.location.latitude()],
        },
        type: i < 4 ? "provider" : "distribution_center",
        operatingInfo: {
          monday: { open: "08:00", close: "17:00" },
          tuesday: { open: "08:00", close: "17:00" },
          wednesday: { open: "08:00", close: "17:00" },
          thursday: { open: "08:00", close: "17:00" },
          friday: { open: "08:00", close: "16:00" },
          saturday: null,
          sunday: null,
        },
        contactInfo: {
          phone: faker.phone.number(),
          email: faker.internet.email(),
        },
      })),
    )
    .returning();

  // vehicles
  const insertedVehicles = await db
    .insert(vehicles)
    .values([
      { vehicleType: "bikebag", amount: 4 },
      { vehicleType: "bikecart", amount: 2 },
      { vehicleType: "van", amount: 1 },
    ])
    .returning();

  // activities
  const providers = insertedPlaces.filter((p) => p.type === "provider");
  const centers = insertedPlaces.filter(
    (p) => p.type === "distribution_center",
  );

  const insertedActivities = await db
    .insert(activities)
    .values(
      Array.from({ length: 15 }).map(() => ({
        providerId: pickOne(insertedUsers).id,
        pickupLocationId: pickOne(providers).id,
        assignedCenterId: pickOne(centers).id,
        status: pickOne(["requested", "assigned", "completed"]),
        pickupTime: faker.date.soon({ days: 14 }),
        notes: faker.lorem.sentence(),
        details: { fragile: faker.datatype.boolean() },
        vehicleId: pickOne(insertedVehicles).id,
      })),
    )
    .returning();

  // food items
  for (const a of insertedActivities) {
    const count = faker.number.int({ min: 1, max: 4 });
    await db.insert(foodItems).values(
      Array.from({ length: count }).map(() => ({
        activityId: a.id,
        itemName: faker.commerce.productName(),
        servings: faker.number.int({ min: 1, max: 40 }),
        expirationDate: faker.date.soon({ days: 5 }),
        freezerItemIncluded: faker.datatype.boolean(),
        packageIncluded: faker.datatype.boolean(),
        image: faker.image.url(),
        notes: faker.lorem.words(5),
        allergies: faker.helpers
          .arrayElements(
            ["gluten", "milk", "eggs", "nuts", "soy", "fish", "sesame"],
            {
              min: 0,
              max: 3,
            },
          )
          .join(", "),
      })),
    );
  }

  console.log("Seed completed");
  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});