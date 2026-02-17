import { pgTable, text, serial, timestamp, jsonb, boolean, uuid, varchar, integer } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  username: text('username').unique().notNull(),
  password: text('password').notNull(),
  role: text('role').notNull(), // "volunteer, provider, manager & admin"
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const places = pgTable('places', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  geojson: jsonb('geojson').notNull(), 
  type: text('type').notNull(), // "provider or distribution_center"
  operatingInfo: jsonb('operating_info'), // opening hours/days
  contactInfo: jsonb('contact_info'), // phone, email, etc.
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

//This model is one pickup activitie, which has all the info for a driver
export const activities = pgTable('activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => users.id),
  pickupLocationId: uuid('pickup_location_id').notNull().references(() => places.id),
  assignedCenterId: uuid('assigned_center_id').references(() => places.id), 
  status: varchar('status', { length: 50 }).notNull().default('requested'), 
  pickupTime: timestamp('pickup_time').notNull(),
  notes: text('notes'), 
  details: jsonb('details'), 
  metrics: jsonb('metrics'), 
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

//This is a modal that links to activities and has all the info for a food item that is being picked up.
export const foodItems = pgTable('food_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  activityId: uuid('activity_id').notNull().references(() => activities.id, { onDelete: 'cascade' }),
  itemName: text('item_name').notNull(),
  servings: integer('servings').notNull(),
  expirationDate: timestamp('expiration_date'),
  freezerItemIncluded: boolean('freezer_item').notNull().default(false),
  packageIncluded: boolean('package_included').notNull().default(false),
  image: text('image'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

//Relations
export const usersRelations = relations(users, ({ many }) => ({
  activitiesCreated: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  provider: one(users, { fields: [activities.providerId], references: [users.id] }),
  pickupLocation: one(places, { fields: [activities.pickupLocationId], references: [places.id] }),
  assignedCenter: one(places, { fields: [activities.assignedCenterId], references: [places.id] }),
  foodItems: many(foodItems),
}));

export const foodItemsRelations = relations(foodItems, ({ one }) => ({
  activity: one(activities, { fields: [foodItems.activityId], references: [activities.id] }),
}));