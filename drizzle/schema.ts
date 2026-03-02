import {
  mysqlTable, varchar, int, boolean, datetime,
  mysqlEnum, timestamp, text, index, uniqueIndex,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('user', {
  id:                varchar('id', { length: 255 }).primaryKey(),
  username:          varchar('username', { length: 255 }).notNull(),
  password_hash:     varchar('password_hash', { length: 255 }).notNull(),
  email:             varchar('email', { length: 255 }),
  phone:             varchar('phone', { length: 50 }),
  role:              mysqlEnum('role', ['dev', 'admin', 'vendor']).notNull().default('vendor'),
  subscription_plan: mysqlEnum('subscription_plan', ['basic', 'pro', 'enterprise']).default('basic'),
  status:            mysqlEnum('status', ['active', 'inactive', 'suspended']).notNull().default('active'),
  created_at:        timestamp('created_at').defaultNow(),
}, (t) => ({
  username_idx: index('username_idx').on(t.username),   // for prefix search performance
  email_idx:    uniqueIndex('email_idx').on(t.email),
}));

export const sessions = mysqlTable('session', {
  id:        varchar('id', { length: 255 }).primaryKey(),
  userId:    varchar('user_id', { length: 255 }).notNull().references(() => users.id),
  expiresAt: datetime('expires_at').notNull(),
});

// ── Categories ────────────────────────────────────────────────────────────────
export const categories = mysqlTable('category', {
  id:         varchar('id', { length: 255 }).primaryKey(),
  name:       varchar('name', { length: 100 }).notNull(),
  slug:       varchar('slug', { length: 100 }).notNull(),
  icon:       varchar('icon', { length: 50 }).default('tag'),
  created_at: timestamp('created_at').defaultNow(),
}, (t) => ({
  slug_idx: uniqueIndex('category_slug_idx').on(t.slug),
}));

// ── Vendor Categories (Many-to-Many) ──────────────────────────────────────────
export const vendor_to_category = mysqlTable('vendor_to_category', {
  vendor_id:   varchar('vendor_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  category_id: varchar('category_id', { length: 255 }).notNull().references(() => categories.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: index('vendor_category_pk').on(t.vendor_id, t.category_id),
}));

// ── Products ──────────────────────────────────────────────────────────────────
export const products = mysqlTable('product', {
  id:               varchar('id', { length: 255 }).primaryKey(),
  vendor_id:        varchar('vendor_id', { length: 255 }).notNull().references(() => users.id),
  category_id:      varchar('category_id', { length: 255 }).notNull().references(() => categories.id),
  name:             varchar('name', { length: 255 }).notNull(),
  description:      text('description'),
  price_min:        int('price_min').default(0),         // IDR
  price_max:        int('price_max').default(0),         // IDR
  concurrent_slots: int('concurrent_slots').default(1),  // simultaneous events capacity
  is_active:        boolean('is_active').default(true),
  created_at:       timestamp('created_at').defaultNow(),
}, (t) => ({
  vendor_idx:   index('product_vendor_idx').on(t.vendor_id),
  category_idx: index('product_category_idx').on(t.category_id),
}));

// ── Product Photos (max 5 per product) ───────────────────────────────────────
export const product_photos = mysqlTable('product_photo', {
  id:         varchar('id', { length: 255 }).primaryKey(),
  product_id: varchar('product_id', { length: 255 }).notNull().references(() => products.id, { onDelete: 'cascade' }),
  url:        varchar('url', { length: 1024 }).notNull(),
  order_idx:  int('order_idx').default(0),
  created_at: timestamp('created_at').defaultNow(),
}, (t) => ({
  product_idx: index('photo_product_idx').on(t.product_id),
}));
