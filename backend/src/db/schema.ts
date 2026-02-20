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

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  roleName: text("name").unique().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Join table so users can have multiple roles
export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

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
  pickupLocationId: uuid("pickup_location_id")
    .notNull()
    .references(() => places.id),
  assignedCenterId: uuid("assigned_center_id").references(() => places.id),
  status: varchar("status", { length: 50 }).notNull().default("requested"),
  pickupTime: timestamp("pickup_time").notNull(),
  notes: text("notes"),
  details: jsonb("details"),
  metrics: jsonb("metrics"), // replace with vehicle type
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
  servings: integer("servings").notNull(),
  expirationDate: timestamp("expiration_date"),
  freezerItemIncluded: boolean("freezer_item").notNull().default(false),
  packageIncluded: boolean("package_included").notNull().default(false),
  image: text("image"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//These are the different type of vihicles used for pickups
export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleType: text("vehicle_type").notNull(), // Bikebags, bikecarts, ...?
  amount: integer("amount").notNull(), // Amount of vehicles stored (for later explansion)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),

});

//Relations
export const usersRelations = relations(users, ({ many }) => ({
  activitiesCreated: many(activities),
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  provider: one(users, {
    fields: [activities.providerId],
    references: [users.id],
  }),
  pickupLocation: one(places, {
    fields: [activities.pickupLocationId],
    references: [places.id],
  }),
  assignedCenter: one(places, {
    fields: [activities.assignedCenterId],
    references: [places.id],
  }),
  foodItems: many(foodItems),
}));

export const foodItemsRelations = relations(foodItems, ({ one }) => ({
  activity: one(activities, {
    fields: [foodItems.activityId],
    references: [activities.id],
  }),
}));
