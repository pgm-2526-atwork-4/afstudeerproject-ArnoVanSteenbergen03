import "dotenv/config";
import { faker } from "@faker-js/faker";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import {
  users,
  permissions,
  userPermissions,
  applications,
  places,
  vehicles,
  activities,
  goods,
  collectionActivities,
  lookupValues,
  chatMembers,
  channels,
  messages,
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
type User = {
  id: string;
  userType: string;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
};
type Place = { id: string; type: string; name: string; userId: string | null };
type Vehicle = { id: string };

// All resources and CRUD actions for generating permissions
const RESOURCES = [
  "activities",
  "places",
  "food_items",
  "vehicles",
  "users",
  "applications",
  "channels",
] as const;

const ACTIONS = ["create", "read", "update", "delete"] as const;

// Page-view permissions (resource = "page", action = "view")
const PAGE_KEYS = [
  "view_dashboard",
  "view_orders",
  "view_deliveries",
  "view_chatroom",
  "view_profile",
  "view_users",
  "view_suppliers",
  "view_distribution_centers",
] as const;

// Special admin permissions
const ADMIN_PERMS = ["manage_chat_members"] as const;

async function main() {
  const permissionValues = RESOURCES.flatMap((resource) =>
    ACTIONS.map((action) => ({
      resource,
      action,
      key: `${action}_${resource}`,
      description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource.replace(/_/g, " ")}`,
    })),
  );

  // Add page-view permissions
  const pagePermissionValues = PAGE_KEYS.map((key) => ({
    resource: "page",
    action: "view",
    key,
    description: `View ${key.replace("view_", "").replace(/_/g, " ")} page`,
  }));

  // Add special admin permissions
  const adminPermissionValues = ADMIN_PERMS.map((key) => ({
    resource: "special",
    action: "admin",
    key,
    description:
      key.replace(/_/g, " ").charAt(0).toUpperCase() +
      key.replace(/_/g, " ").slice(1),
  }));

  const insertedPermissions = await db
    .insert(permissions)
    .values([
      ...permissionValues,
      ...pagePermissionValues,
      ...adminPermissionValues,
    ])
    .onConflictDoNothing()
    .returning();

  const allPermissions: Permission[] = insertedPermissions.length
    ? insertedPermissions
    : await db.select().from(permissions);

  console.log(`Seeded ${allPermissions.length} permissions`);

  // Seed lookup values (good_state, category, unit)
  await db
    .insert(lookupValues)
    .values([
      // Good states
      { type: "good_state", value: "fresh", label: "Fresh", sortOrder: 1 },
      { type: "good_state", value: "old", label: "Old", sortOrder: 2 },
      { type: "good_state", value: "dry", label: "Dry", sortOrder: 3 },
      // Categories
      { type: "category", value: "meat", label: "Meat", sortOrder: 1 },
      { type: "category", value: "dairy", label: "Dairy", sortOrder: 2 },
      { type: "category", value: "vegies", label: "Vegies", sortOrder: 3 },
      { type: "category", value: "fruits", label: "Fruits", sortOrder: 4 },
      { type: "category", value: "bakery", label: "Bakery", sortOrder: 5 },
      {
        type: "category",
        value: "prepared food (hot/warm)",
        label: "Prepared Food (Hot/Warm)",
        sortOrder: 6,
      },
      {
        type: "category",
        value: "prepared food (cold)",
        label: "Prepared Food (Cold)",
        sortOrder: 7,
      },
      {
        type: "category",
        value: "packaged goods",
        label: "Packaged Goods",
        sortOrder: 8,
      },
      // Units
      { type: "unit", value: "items", label: "Items", sortOrder: 1 },
      { type: "unit", value: "kg", label: "Kg", sortOrder: 2 },
      { type: "unit", value: "boxes", label: "Boxes", sortOrder: 3 },
      { type: "unit", value: "pallets", label: "Pallets", sortOrder: 4 },
      { type: "unit", value: "liters", label: "Liters", sortOrder: 5 },
    ])
    .onConflictDoNothing();

  console.log("Seeded lookup values");

  const passwordHash = await hash("Test1234!", 10);

  // Admin user (pre-approved, all permissions)
  await db
    .insert(users)
    .values({
      email: "admin@test.com",
      firstname: "Admin",
      lastname: "User",
      username: "admin",
      password: passwordHash,
      userType: "admin",
    })
    .onConflictDoNothing();

  // Ensure password is up to date
  await db
    .update(users)
    .set({ password: passwordHash })
    .where(eq(users.email, "admin@test.com"));

  const [adminUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@test.com"));

  if (!adminUser) {
    throw new Error("Failed to create/fetch admin user");
  }

  // Manager user (approved, dashboard + order management + read-only admin pages)
  await db
    .insert(users)
    .values({
      email: "manager@test.com",
      firstname: "Manager",
      lastname: "User",
      username: "manager",
      password: passwordHash,
      userType: "manager",
    })
    .onConflictDoNothing();

  // Ensure password is up to date
  await db
    .update(users)
    .set({ password: passwordHash })
    .where(eq(users.email, "manager@test.com"));

  const [managerUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, "manager@test.com"));

  if (!managerUser) {
    throw new Error("Failed to create/fetch manager user");
  }

  // Provider users (approved)
  const providerData = Array.from({ length: 4 }).map(() => {
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
  });

  const providerUsers: User[] = [];
  for (const data of providerData) {
    await db.insert(users).values(data).onConflictDoNothing();

    // Ensure password is up to date for existing users
    await db
      .update(users)
      .set({ password: passwordHash })
      .where(eq(users.email, data.email));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    if (user) {
      providerUsers.push(user);
    }
  }

  // Volunteer users (approved)
  const volunteerData = Array.from({ length: 4 }).map(() => {
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
  });

  const volunteerUsers: User[] = [];
  for (const data of volunteerData) {
    await db.insert(users).values(data).onConflictDoNothing();

    // Ensure password is up to date for existing users
    await db
      .update(users)
      .set({ password: passwordHash })
      .where(eq(users.email, data.email));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    if (user) {
      volunteerUsers.push(user);
    }
  }

  // Pending users (not yet approved — will have applications)
  const pendingData = Array.from({ length: 3 }).map(() => {
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
  });

  const pendingUsers: User[] = [];
  for (const data of pendingData) {
    await db.insert(users).values(data).onConflictDoNothing();

    // Ensure password is up to date for existing users
    await db
      .update(users)
      .set({ password: passwordHash })
      .where(eq(users.email, data.email));

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));

    if (user) {
      pendingUsers.push(user);
    }
  }

  const allApprovedUsers = [
    adminUser,
    managerUser,
    ...providerUsers,
    ...volunteerUsers,
  ];

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

  const managerPermKeys = [
    "read_activities",
    "update_activities",
    "read_food_items",
    "update_food_items",
    "read_places",
    "read_vehicles",
    "read_users",
    "manage_chat_members",
    "view_dashboard",
    "view_orders",
    "view_chatroom",
    "view_profile",
    "view_users",
    "view_suppliers",
    "view_distribution_centers",
  ];
  const managerPerms = allPermissions.filter((p) =>
    managerPermKeys.includes(p.key),
  );

  await db
    .insert(userPermissions)
    .values(
      managerPerms.map((p) => ({
        userId: managerUser.id,
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
    "view_orders",
    "view_chatroom",
    "view_profile",
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
    "view_deliveries",
    "view_chatroom",
    "view_profile",
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

  // Every provider should have a supplier place linked to their user.
  const supplierPlaces: Place[] = await db
    .insert(places)
    .values(
      providerUsers.map((provider) => ({
        name: `${provider.firstname} ${provider.lastname} Supplier`,
        geojson: {
          type: "Point",
          coordinates: [faker.location.longitude(), faker.location.latitude()],
        },
        type: "supplier",
        userId: provider.id,
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
          email: provider.email,
        },
      })),
    )
    .returning();

  const centers: Place[] = await db
    .insert(places)
    .values(
      Array.from({ length: 4 }).map(() => ({
        name: faker.company.name(),
        geojson: {
          type: "Point",
          coordinates: [faker.location.longitude(), faker.location.latitude()],
        },
        type: "distribution_center",
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

  const insertedPlaces: Place[] = [...supplierPlaces, ...centers];

  const insertedVehicles: Vehicle[] = await db
    .insert(vehicles)
    .values([
      { vehicleType: "bikebag", icon: "Backpack", amount: 4 },
      { vehicleType: "bikecart", icon: "ShoppingCart", amount: 2 },
      { vehicleType: "van", icon: "Truck", amount: 1 },
    ])
    .returning();

  const insertedActivities = await db
    .insert(activities)
    .values(
      Array.from({ length: 15 }).map(() => {
        const orderDate = faker.date.soon({ days: 14 });
        const status = pickOne([
          "requested",
          "accepted",
          "in_progress",
          "completed",
          "need_assistance",
        ]);

        return {
          providerId: pickOne(providerUsers).id,
          assignedDriver:
            status === "requested" ? null : pickOne(volunteerUsers).id,
          location: faker.location.streetAddress({ useFullAddress: true }),
          activityType: "collection",
          assignedCenterId: pickOne(centers).id,
          status,
          orderTime: orderDate,
          notes: faker.lorem.sentence(),
          details: { fragile: faker.datatype.boolean() },
          freezerItemIncluded: faker.datatype.boolean(),
          damagedGoods: faker.datatype.boolean(),
          vehicleId: pickOne(insertedVehicles).id,
        };
      }),
    )
    .returning();

  for (const a of insertedActivities) {
    // Create collection activity record
    const [collectionActivity] = await db
      .insert(collectionActivities)
      .values({
        activityId: a.id,
      })
      .returning();

    // Create goods for this collection activity
    const count = faker.number.int({ min: 1, max: 4 });
    await db.insert(goods).values(
      Array.from({ length: count }).map(() => ({
        category: pickOne([
          "meat",
          "dairy",
          "vegies",
          "fruits",
          "bakery",
          "prepared food (hot/warm)",
          "prepared food (cold)",
          "packaged goods",
        ]),
        name: faker.commerce.productName(),
        goodState: pickOne(["fresh", "old", "dry"]),
        overDueDate: faker.datatype.boolean(),
        quantity: String(faker.number.int({ min: 1, max: 100 })),
        unit: pickOne(["kg", "items", "boxes", "pallets", "liters"]),
        status: "available",
        sourcePlaceId: pickOne(insertedPlaces).id,
        currentPlaceId: pickOne(centers).id,
        sourceActivityId: collectionActivity.id,
        image: faker.image.url(),
        metadata: {
          allergies: faker.helpers
            .arrayElements(
              ["gluten", "milk", "eggs", "nuts", "soy", "fish", "sesame"],
              { min: 0, max: 3 },
            )
            .join(", "),
          expirationDate: faker.date.soon({ days: 5 }),
          packageIncluded: faker.datatype.boolean(),
        },
      })),
    );
  }

  console.log("Seeded activities and goods");

  // Create channels
  // 1. Community channel
  const [communityChannel] = await db
    .insert(channels)
    .values({
      name: "Community",
      type: "community",
      activityId: null,
      placeId: null,
    })
    .returning();

  // 2. Social channel (all volunteers and admins)
  const [socialChannel] = await db
    .insert(channels)
    .values({
      name: "Social",
      type: "community",
      activityId: null,
      placeId: null,
    })
    .returning();

  // 3. General Operations channel (all volunteers and admins)
  const [operationsChannel] = await db
    .insert(channels)
    .values({
      name: "General Operations",
      type: "community",
      activityId: null,
      placeId: null,
    })
    .returning();

  // 4. Channels for each distribution center
  const distroChannels = await Promise.all(
    centers.map(async (center) => {
      const [channel] = await db
        .insert(channels)
        .values({
          name: center.name,
          type: "distribution_center",
          activityId: null,
          placeId: center.id,
        })
        .returning();

      return channel;
    }),
  );

  // 5. A supplier channel for every supplier place
  const supplierChannels = await Promise.all(
    supplierPlaces.map(async (supplier) => {
      const [channel] = await db
        .insert(channels)
        .values({
          name: supplier.name,
          type: "supplier",
          activityId: null,
          placeId: supplier.id,
        })
        .returning();

      return channel;
    }),
  );

  console.log("Seeded channels");

  // Add users to chatMembers table
  // Helper function to add user to channel
  const addMemberToChannel = async (channelId: string, userId: string) => {
    await db
      .insert(chatMembers)
      .values({
        channelId: channelId as any,
        userId: userId as any,
      })
      .onConflictDoNothing();
  };

  // Admin is in ALL channels
  const allChannels = [
    communityChannel,
    socialChannel,
    operationsChannel,
    ...distroChannels,
    ...supplierChannels,
  ];

  for (const channel of allChannels) {
    await addMemberToChannel(channel.id, adminUser.id);
  }

  // Manager can also see all channels in the chat list.
  for (const channel of allChannels) {
    await addMemberToChannel(channel.id, managerUser.id);
  }

  // Volunteers and admins in social channel
  for (const vol of volunteerUsers) {
    await addMemberToChannel(socialChannel.id, vol.id);
  }

  // Volunteers and admins in operations channel
  for (const vol of volunteerUsers) {
    await addMemberToChannel(operationsChannel.id, vol.id);
  }

  // Supplier owners should be members of their own supplier channel.
  for (const supplier of supplierPlaces) {
    const channel = supplierChannels.find((c) => c.placeId === supplier.id);
    if (channel && supplier.userId) {
      await addMemberToChannel(channel.id, supplier.userId);

      await db.insert(messages).values({
        channelId: channel.id,
        userId: supplier.userId,
        body: `Welcome to ${supplier.name}. New collection orders will appear here.`,
      });
    }
  }

  await db.insert(messages).values({
    channelId: communityChannel.id,
    userId: adminUser.id,
    body: "Welcome to the community chat.",
  });

  console.log("Seeded chat members and initialized channels");
  console.log("Seed completed");

  await sql.end();
}

main().catch(async (err) => {
  console.error(err);
  await sql.end();
  process.exit(1);
});
