import "dotenv/config";
import { faker } from "@faker-js/faker";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { hash } from "bcrypt";
import {
  users,
  permissions,
  userPermissions,
  applications,
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

function pickOne<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Types for seed data
type Permission = { id: number; resource: string; action: string; key: string };
type User = { id: string; userType: string };
type Place = { id: string; type: string };
type Vehicle = { id: string };

// All resources and CRUD actions for generating permissions
const RESOURCES = [
  "activities",
  "places",
  "food_items",
  "vehicles",
  "users",
  "applications",
] as const;

const ACTIONS = ["create", "read", "update", "delete"] as const;

async function main() {
  const permissionValues = RESOURCES.flatMap((resource) =>
    ACTIONS.map((action) => ({
      resource,
      action,
      key: `${action}_${resource}`,
      description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource.replace(/_/g, " ")}`,
    })),
  );

  const insertedPermissions = await db
    .insert(permissions)
    .values(permissionValues)
    .onConflictDoNothing()
    .returning();

  const allPermissions: Permission[] = insertedPermissions.length
    ? insertedPermissions
    : await db.select().from(permissions);

  console.log(`Seeded ${allPermissions.length} permissions`);

  const passwordHash = await hash("Test1234!", 10);

  // Admin user (pre-approved, all permissions)
  const [adminUser]: User[] = await db
    .insert(users)
    .values({
      email: "admin@test.com",
      firstname: "Admin",
      lastname: "User",
      username: "admin",
      password: passwordHash,
      userType: "admin",
    })
    .returning();

  // Provider users (approved)
  const providerUsers: User[] = await db
    .insert(users)
    .values(
      Array.from({ length: 4 }).map(() => {
        const firstname = faker.person.firstName();
        const lastname = faker.person.lastName();
        return {
          email: faker.internet.email().toLowerCase(),
          firstname,
          lastname,
          username: `${firstname}${lastname}`.toLowerCase(),
          password: passwordHash,
          userType: "provider" as const,
        };
      }),
    )
    .returning();

  // Volunteer users (approved)
  const volunteerUsers: User[] = await db
    .insert(users)
    .values(
      Array.from({ length: 4 }).map(() => {
        const firstname = faker.person.firstName();
        const lastname = faker.person.lastName();
        return {
          email: faker.internet.email().toLowerCase(),
          firstname,
          lastname,
          username: `${firstname}${lastname}`.toLowerCase(),
          password: passwordHash,
          userType: "volunteer" as const,
        };
      }),
    )
    .returning();

  // Pending users (not yet approved — will have applications)
  const pendingUsers: User[] = await db
    .insert(users)
    .values(
      Array.from({ length: 3 }).map(() => {
        const firstname = faker.person.firstName();
        const lastname = faker.person.lastName();
        return {
          email: faker.internet.email().toLowerCase(),
          firstname,
          lastname,
          username: `${firstname}${lastname}`.toLowerCase(),
          password: passwordHash,
          userType: pickOne(["provider", "volunteer"]),
        };
      }),
    )
    .returning();

  const allApprovedUsers = [adminUser, ...providerUsers, ...volunteerUsers];

  console.log(
    `Seeded ${allApprovedUsers.length} approved + ${pendingUsers.length} pending users`,
  );

  // Admin gets ALL permissions
  await db
    .insert(userPermissions)
    .values(
      allPermissions.map((p) => ({
        userId: adminUser.id,
        permissionId: p.id,
        grantedBy: adminUser.id,
      })),
    )
    .onConflictDoNothing();

  // Providers get activity + food_items CRUD + read places/vehicles
  const providerPermKeys = [
    "create_activities",
    "read_activities",
    "update_activities",
    "delete_activities",
    "create_food_items",
    "read_food_items",
    "update_food_items",
    "delete_food_items",
    "read_places",
    "read_vehicles",
  ];
  const providerPerms = allPermissions.filter((p) =>
    providerPermKeys.includes(p.key),
  );

  for (const u of providerUsers) {
    await db
      .insert(userPermissions)
      .values(
        providerPerms.map((p) => ({
          userId: u.id,
          permissionId: p.id,
          grantedBy: adminUser.id,
        })),
      )
      .onConflictDoNothing();
  }

  // Volunteers get read activities + read places/vehicles
  const volunteerPermKeys = [
    "read_activities",
    "update_activities",
    "read_food_items",
    "read_places",
    "read_vehicles",
  ];
  const volunteerPerms = allPermissions.filter((p) =>
    volunteerPermKeys.includes(p.key),
  );

  for (const u of volunteerUsers) {
    await db
      .insert(userPermissions)
      .values(
        volunteerPerms.map((p) => ({
          userId: u.id,
          permissionId: p.id,
          grantedBy: adminUser.id,
        })),
      )
      .onConflictDoNothing();
  }

  console.log("Seeded user permissions");

  // Approved users get approved applications (including admin)
  for (const u of [adminUser, ...providerUsers, ...volunteerUsers]) {
    await db.insert(applications).values({
      userId: u.id,
      userType: u.userType,
      status: "approved",
      reviewedBy: adminUser.id,
      reviewedAt: faker.date.recent({ days: 30 }),
    });
  }

  // Pending users get pending applications
  for (const u of pendingUsers) {
    await db.insert(applications).values({
      userId: u.id,
      userType: u.userType,
      status: "pending",
    });
  }

  console.log("Seeded applications");

  const insertedPlaces: Place[] = await db
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

  const insertedVehicles: Vehicle[] = await db
    .insert(vehicles)
    .values([
      { vehicleType: "bikebag", icon: "Backpack", amount: 4 },
      { vehicleType: "bikecart", icon: "ShoppingCart", amount: 2 },
      { vehicleType: "van", icon: "Truck", amount: 1 },
    ])
    .returning();

  const centers = insertedPlaces.filter(
    (p: { id: string; type: string }) => p.type === "distribution_center",
  );

  const insertedActivities = await db
    .insert(activities)
    .values(
      Array.from({ length: 15 }).map(() => ({
        providerId: pickOne(providerUsers).id,
        pickupAddress: faker.location.streetAddress({ useFullAddress: true }),
        assignedCenterId: pickOne(centers).id,
        status: pickOne(["requested", "assigned", "completed"]),
        pickupTime: faker.date.soon({ days: 14 }),
        notes: faker.lorem.sentence(),
        details: { fragile: faker.datatype.boolean() },
        freezerItemIncluded: faker.datatype.boolean(),
        vehicleId: pickOne(insertedVehicles).id,
      })),
    )
    .returning();

  for (const a of insertedActivities) {
    const count = faker.number.int({ min: 1, max: 4 });
    await db.insert(foodItems).values(
      Array.from({ length: count }).map(() => ({
        activityId: a.id,
        itemName: faker.commerce.productName(),
        expirationDate: faker.date.soon({ days: 5 }),
        packageIncluded: faker.datatype.boolean(),
        image: faker.image.url(),
        allergies: faker.helpers
          .arrayElements(
            ["gluten", "milk", "eggs", "nuts", "soy", "fish", "sesame"],
            { min: 0, max: 3 },
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