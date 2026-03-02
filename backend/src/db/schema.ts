import {
  pgTable,
  text,
  serial,
  timestamp,
  jsonb,
  boolean,
  uuid,
  varchar,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// new user schema
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstname: text("firstname").notNull(),
  lastname: text("lastname").notNull(),
  email: text("email").unique().notNull(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  userType: varchar("user_type", { length: 20 }).notNull(), // provider, volunteer, admin, centerManager, manager
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//permission table with all the permissions
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  resource: text("resource").notNull(), // activities, places, orders
  action: text("action").notNull(), // create, read, update, delete
  key: text("key").unique().notNull(), //create_activities
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Join table: users <-> permissions
export const userPermissions = pgTable(
  "user_permissions",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
    grantedBy: uuid("granted_by").references(() => users.id),
    grantedAt: timestamp("granted_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.permissionId] })],
);

// Application table: holds pending signup requests for admin review
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userType: varchar("user_type", { length: 20 }).notNull(), // provider, volunteer
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, denied
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  denialReason: text("denial_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const places = pgTable("places", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  geojson: jsonb("geojson").notNull(),
  type: text("type").notNull(), // "provider or distribution_center"
  operatingInfo: jsonb("operating_info"),
  contactInfo: jsonb("contact_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//This model is one pickup activitie, which has all the info for a driver
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => users.id),
  pickupAddress: text("pickup_address").notNull(),
  assignedCenterId: uuid("assigned_center_id").references(() => places.id),
  status: varchar("status", { length: 50 }).notNull().default("requested"),
  pickupTime: timestamp("pickup_time").notNull(),
  notes: text("notes"),
  details: jsonb("details"),
  freezerItemIncluded: boolean("freezer_item").notNull().default(false),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//This is a modal that links to activities and has all the info for a food item that is being picked up.
export const foodItems = pgTable("food_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  itemName: text("item_name").notNull(),
  allergies: text("allergies"),
  expirationDate: timestamp("expiration_date"),
  packageIncluded: boolean("package_included").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//These are the different type of vihicles used for pickups
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleType: text("vehicle_type").notNull(), // Bikebags, bikecarts, ...?
  icon: text("icon").notNull(), // Icon name or SVG string
  amount: integer("amount").notNull(), // Amount of vehicles stored (for later explansion)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

////Relations

export const usersRelations = relations(users, ({ many }) => ({
  activitiesCreated: many(activities),
  userPermissions: many(userPermissions),
  applications: many(applications),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  userPermissions: many(userPermissions),
}));

export const userPermissionsRelations = relations(
  userPermissions,
  ({ one }) => ({
    user: one(users, {
      fields: [userPermissions.userId],
      references: [users.id],
    }),
    permission: one(permissions, {
      fields: [userPermissions.permissionId],
      references: [permissions.id],
    }),
    granter: one(users, {
      fields: [userPermissions.grantedBy],
      references: [users.id],
      relationName: "grantedPermissions",
    }),
  }),
);

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [applications.reviewedBy],
    references: [users.id],
    relationName: "reviewedApplications",
  }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  provider: one(users, {
    fields: [activities.providerId],
    references: [users.id],
  }),
  assignedCenter: one(places, {
    fields: [activities.assignedCenterId],
    references: [places.id],
  }),
  vehicle: one(vehicles, {
    fields: [activities.vehicleId],
    references: [vehicles.id],
  }),
  foodItems: many(foodItems),
}));

export const foodItemsRelations = relations(foodItems, ({ one }) => ({
  activity: one(activities, {
    fields: [foodItems.activityId],
    references: [activities.id],
  }),
}));
