'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/drizzle';
import { categories } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { generateIdFromEntropySize } from 'lucia';

export async function createCategoryAction(data: { name: string; slug: string; icon?: string }) {
  await db.insert(categories).values({
    id:   generateIdFromEntropySize(10),
    name: data.name,
    slug: data.slug.toLowerCase().replace(/\s+/g, '_'),
    icon: data.icon ?? 'tag',
  });
  revalidatePath('/categories');
}

export async function updateCategoryAction(id: string, data: { name?: string; slug?: string; icon?: string }) {
  await db.update(categories).set(data).where(eq(categories.id, id));
  revalidatePath('/categories');
}

export async function deleteCategoryAction(id: string) {
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath('/categories');
}
