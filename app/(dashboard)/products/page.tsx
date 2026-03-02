import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE } from '@/config';
import { UnauthenticatedError, AuthenticationError } from '@/src/entities/errors/auth';
import { ForbiddenError, assertPermission, hasPermission } from '@/src/infrastructure/services/rbac.service';
import { getInjection } from '@/di/container';
import { db } from '@/drizzle';
import { categories } from '@/drizzle/schema';
import { asc } from 'drizzle-orm';

import { ProductsTable } from './_components/products-table';

const VALID_LIMITS = [25, 50, 100] as const;
type Limit = (typeof VALID_LIMITS)[number];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const get = (k: string) => { const v = params[k]; return v ? (Array.isArray(v) ? v : [v]) : undefined; };
  const str = (k: string) => { const v = params[k]; return Array.isArray(v) ? v[0] : v; };

  const limit: Limit = (VALID_LIMITS.includes(Number(str('limit')) as Limit) ? Number(str('limit')) : 25) as Limit;
  const offset = Math.max(0, Number(str('offset') ?? 0));
  const sortCol = (['name', 'price_min', 'created_at', 'concurrent_slots'].includes(str('sort') ?? ''))
    ? (str('sort') as any) : 'created_at';
  const sortDir = str('dir') === 'asc' ? 'asc' : 'desc';
  const filters = { category_id: get('category_id') };

  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) redirect('/sign-in');

  let paginatedProducts: any;
  let allCategories: any[];
  let allVendors: any[] = [];
  let currentUser: any;
  let canReadAll: boolean;

  try {
    const authService = getInjection('IAuthenticationService');
    const { user } = await authService.validateSession(sessionId);
    assertPermission(user, 'products:read');
    currentUser = user;

    // Vendor sees only their own products; dev/admin see all
    canReadAll = hasPermission(user, 'products:read_all');
    const scopedFilters = canReadAll
      ? filters
      : { ...filters, vendor_id: user.id };

    const getProductsUseCase = getInjection('IGetProductsUseCase');
    const getUsersUseCase    = getInjection('IGetUsersUseCase');

    [paginatedProducts, allCategories, allVendors] = await Promise.all([
      getProductsUseCase({ limit, offset, filters: scopedFilters, sort: { column: sortCol, direction: sortDir } }),
      db.select().from(categories).orderBy(asc(categories.name)),
      canReadAll ? getUsersUseCase({ limit: 500, offset: 0, filters: { role: ['vendor'] } }).then((r) => r.users) : Promise.resolve([]),
    ]);
  } catch (err) {
    if (err instanceof UnauthenticatedError || err instanceof AuthenticationError) redirect('/sign-in');
    if (err instanceof ForbiddenError) redirect('/forbidden');
    throw err;
  }

  return (
    <div className="flex flex-col h-full">
      <ProductsTable
        products={paginatedProducts.products}
        total={paginatedProducts.total}
        categories={allCategories}
        vendors={allVendors}
        limit={limit}
        offset={offset}
        sortCol={sortCol}
        sortDir={sortDir}
        activeFilters={filters}
        currentUserId={currentUser.id}
        currentUserRole={currentUser.role}
        canReadAll={canReadAll}
      />
    </div>
  );
}
