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
  decimal,
  index,
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
    grantedBy: uuid("granted_by").references(() => users.id, { onDelete: "set null" }),
    grantedAt: timestamp("granted_at").defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.permissionId] })],
);

// Application table
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userType: varchar("user_type", { length: 20 }).notNull(), // provider, volunteer
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, approved, denied
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at"),
  denialReason: text("denial_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});


export const places = pgTable("places", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  geojson: jsonb("geojson").notNull(),
  type: text("type").notNull(), // "supplier or distribution_center"
  operatingInfo: jsonb("operating_info"),
  contactInfo: jsonb("contact_info"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

//This model is one activitie, which has all the info for a driver
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  assignedDriver: uuid("assigned_driver").references(() => users.id, {
    onDelete: "set null",
  }),
  location: text("location").notNull(),
  activityType: varchar("activity_type", { length: 20 }).notNull(), // collection, distribution, hygiene, other
  assignedCenterId: uuid("assigned_center_id").references(() => places.id),
  status: varchar("status", { length: 50 }).notNull().default("requested"),
  orderTime: timestamp("order_time").notNull(),
  notes: text("notes"),
  details: jsonb("details"),
  freezerItemIncluded: boolean("freezer_item").notNull().default(false),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collection activities
export const collectionActivities = pgTable(
  "collection_activities",
  {
    id: serial("id").primaryKey(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [index("collection_activity_idx").on(table.activityId)]
);

// Goods table
export const goods = pgTable(
  "goods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    goodType: text("good_type").notNull(), // 'food', 'clothing', 'household', 'equipment', etc.
    category: text("category").notNull(), // specific category within type (e.g., 'produce', 'dairy' for food)
    name: text("name").notNull(),
    
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    unit: text("unit").notNull(), // 'kg', 'items', 'boxes', 'pallets', 'liters', etc.
    
    status: text("status").notNull().default("available"), // 'available', 'reserved', 'distributed', 'expired', 'discarded'
    
    sourcePlaceId: uuid("source_place_id").references(() => places.id),
    currentPlaceId: uuid("current_place_id").references(() => places.id),
    
    sourceActivityId: serial("source_activity_id").references(() => collectionActivities.id),
    distributionActivityId: uuid("distribution_activity_id").references(() => activities.id, { onDelete: "set null" }),
   
    metadata: jsonb("metadata"),
    
    image: text("image"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("goods_type_status_idx").on(table.goodType, table.status),
    index("goods_source_place_idx").on(table.sourcePlaceId),
    index("goods_current_place_idx").on(table.currentPlaceId),
    index("goods_source_activity_idx").on(table.sourceActivityId),
  ]
);

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
  goodsCreated: many(goods),
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

export const placesRelations = relations(places, ({ many }) => ({
  goodsSourced: many(goods, { relationName: "goodsSourcePlace" }),
  goodsCurrent: many(goods, { relationName: "goodsCurrentPlace" }),
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
  collectionActivity: one(collectionActivities, {
    fields: [activities.id],
    references: [collectionActivities.activityId],
  }),
  goodsDistributed: many(goods),
}));

export const collectionActivitiesRelations = relations(
  collectionActivities,
  ({ one, many }) => ({
    activity: one(activities, {
      fields: [collectionActivities.activityId],
      references: [activities.id],
    }),
    goods: many(goods),
  })
);

export const goodsRelations = relations(goods, ({ one }) => ({
  sourcePlace: one(places, {
    fields: [goods.sourcePlaceId],
    references: [places.id],
    relationName: "goodsSourcePlace",
  }),
  currentPlace: one(places, {
    fields: [goods.currentPlaceId],
    references: [places.id],
    relationName: "goodsCurrentPlace",
  }),
  sourceActivity: one(collectionActivities, {
    fields: [goods.sourceActivityId],
    references: [collectionActivities.id],
  }),
  distributionActivity: one(activities, {
    fields: [goods.distributionActivityId],
    references: [activities.id],
  }),
  creator: one(users, {
    fields: [goods.createdBy],
    references: [users.id],
  }),
}));
