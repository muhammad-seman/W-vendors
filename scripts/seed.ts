import { config } from 'dotenv';
config({ path: '.env' });

import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { hash } from 'bcrypt-ts';
import { generateIdFromEntropySize } from 'lucia';
import { eq } from 'drizzle-orm';

import { users, categories, vendor_to_category, products, product_photos } from '../drizzle/schema';

async function seed() {
  const pool = mysql.createPool(process.env.DATABASE_URL!);
  const db = drizzle(pool, { 
    schema: { users, categories, vendor_to_category, products, product_photos }, 
    mode: 'default' 
  });

  const PASSWORD = 'password123';
  const SALT_ROUNDS = 10;
  const hashedPassword = await hash(PASSWORD, SALT_ROUNDS);

  console.log('🌱 Starting full seed...\n');

  // 0. Clear existing data to avoid FK issues
  console.log('🧹 Clearing existing dynamic data...');
  await db.delete(product_photos);
  await db.delete(products);
  await db.delete(vendor_to_category);
  await db.delete(categories);
  await db.delete(users).where(eq(users.role, 'vendor'));
  console.log('✅ Tables cleared.');

  // 1. Initial Admin & Dev
  const coreUsers = [
    {
      id: generateIdFromEntropySize(10),
      username: 'dev_user',
      password_hash: hashedPassword,
      email: 'dev@withvendor.com',
      role: 'dev' as const,
      status: 'active' as const,
    },
    {
      id: generateIdFromEntropySize(10),
      username: 'admin_user',
      password_hash: hashedPassword,
      email: 'admin@withvendor.com',
      role: 'admin' as const,
      status: 'active' as const,
    },
  ];

  for (const u of coreUsers) {
    await db.delete(users).where(eq(users.username, u.username));
    await db.insert(users).values(u);
    console.log(`✅ User: ${u.username}`);
  }

  // 2. Categories
  const categoryData = [
    { id: 'cat_wo', name: 'Wedding Organizer', slug: 'wedding-organizer', icon: 'briefcase' },
    { id: 'cat_cat', name: 'Catering', slug: 'catering', icon: 'utensils' },
    { id: 'cat_dec', name: 'Dekorasi', slug: 'dekorasi', icon: 'palette' },
    { id: 'cat_pho', name: 'Foto & Video', slug: 'foto-video', icon: 'camera' },
    { id: 'cat_ven', name: 'Venue', slug: 'venue', icon: 'map-pin' },
    { id: 'cat_ent', name: 'Hiburan', slug: 'hiburan', icon: 'music' },
    { id: 'cat_mak', name: 'Makeup & Hair', slug: 'makeup', icon: 'sparkles' },
  ];

  for (const cat of categoryData) {
    await db.delete(categories).where(eq(categories.id, cat.id));
    await db.insert(categories).values(cat);
  }
  console.log('✅ Categories created.');

  // 3. Vendors & Products
  const vendors = [
    { id: 'v_royal_wo', name: 'Royal Wedding Planner', catId: 'cat_wo', email: 'royal@example.com' },
    { id: 'v_berkah_cat', name: 'Berkah Catering', catId: 'cat_cat', email: 'berkah@example.com' },
    { id: 'v_indah_dec', name: 'Indah Dekorasi', catId: 'cat_dec', email: 'indah@example.com' },
    { id: 'v_memoir_pho', name: 'Memoir Photography', catId: 'cat_pho', email: 'memoir@example.com' },
    { id: 'v_grand_hall', name: 'Grand Hall Ballroom', catId: 'cat_ven', email: 'grand@example.com' },
  ];

  for (const v of vendors) {
    const userId = generateIdFromEntropySize(10);
    const username = v.id.replace('v_', '');
    
    await db.delete(users).where(eq(users.username, username));
    await db.insert(users).values({
      id: userId,
      username,
      password_hash: hashedPassword,
      email: v.email,
      role: 'vendor',
      status: 'active',
      subscription_plan: 'pro',
    });

    await db.insert(vendor_to_category).values({
      vendor_id: userId,
      category_id: v.catId,
    });

    // Create 3 products per vendor
    for (let i = 1; i <= 3; i++) {
      const prodId = generateIdFromEntropySize(10);
      await db.insert(products).values({
        id: prodId,
        vendor_id: userId,
        category_id: v.catId,
        name: `Layanan ${v.name} #${i}`,
        description: `Deskripsi lengkap layanan unggulan dari ${v.name}. Kualitas terjamin untuk hari spesial Anda.`,
        price_min: 5000000 + (i * 1000000),
        price_max: 15000000 + (i * 2000000),
        concurrent_slots: 2,
        is_active: true,
      });

      // Add dummy photo
      await db.insert(product_photos).values({
        id: generateIdFromEntropySize(10),
        product_id: prodId,
        url: `https://images.unsplash.com/photo-${1500000000000 + (i * 1000)}?q=80&w=800&auto=format&fit=crop`,
        order_idx: 0,
      });
    }

    console.log(`✅ Vendor & Products: ${v.name}`);
  }

  console.log('\n✨ Seeding complete!');
  await pool.end();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
