import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE } from '@/config';
import { UnauthenticatedError, AuthenticationError } from '@/src/entities/errors/auth';
import { ForbiddenError, assertPermission } from '@/src/infrastructure/services/rbac.service';
import { getInjection } from '@/di/container';
import { db } from '@/drizzle';
import { categories } from '@/drizzle/schema';
import { asc } from 'drizzle-orm';

import { CategoriesTable } from './_components/categories-table';

export default async function CategoriesPage() {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) redirect('/sign-in');

  let allCategories;
  try {
    const authService = getInjection('IAuthenticationService');
    const { user } = await authService.validateSession(sessionId);
    assertPermission(user, 'categories:read');

    allCategories = await db.select().from(categories).orderBy(asc(categories.name));
  } catch (err) {
    if (err instanceof UnauthenticatedError || err instanceof AuthenticationError) redirect('/sign-in');
    if (err instanceof ForbiddenError) redirect('/forbidden');
    throw err;
  }

  return (
    <div className="flex flex-col h-full">
      <CategoriesTable categories={allCategories} />
    </div>
  );
}
