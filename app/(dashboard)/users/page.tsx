import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { SESSION_COOKIE } from '@/config';
import { UnauthenticatedError, AuthenticationError } from '@/src/entities/errors/auth';
import { ForbiddenError, assertPermission } from '@/src/infrastructure/services/rbac.service';
import { getInjection } from '@/di/container';

import { UsersTable } from './_components/users-table';

const VALID_LIMITS = [25, 50, 100] as const;
type Limit = (typeof VALID_LIMITS)[number];

const SORTABLE = ['username', 'email', 'role', 'subscription_plan', 'status', 'created_at'] as const;
type SortCol = (typeof SORTABLE)[number];

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;

  const get = (key: string) => {
    const v = params[key];
    if (!v) return undefined;
    return Array.isArray(v) ? v : [v];
  };

  const getString = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const limit: Limit = (VALID_LIMITS.includes(Number(getString('limit')) as Limit)
    ? Number(getString('limit'))
    : 25) as Limit;
  const offset = Math.max(0, Number(getString('offset') ?? 0));
  const search = getString('search')?.trim() || undefined;

  const sortCol = SORTABLE.includes(getString('sort') as SortCol)
    ? (getString('sort') as SortCol)
    : 'created_at';
  const sortDir = getString('dir') === 'asc' ? 'asc' : 'desc';

  const filters = {
    role:              get('role'),
    subscription_plan: get('subscription_plan'),
    status:            get('status'),
  };

  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) redirect('/sign-in');

  let paginatedUsers;
  try {
    const authService = getInjection('IAuthenticationService');
    const { user } = await authService.validateSession(sessionId);
    assertPermission(user, 'users:read');

    const getUsersController = getInjection('IGetUsersController');
    paginatedUsers = await getUsersController({
      limit,
      offset,
      search,
      filters,
      sort: { column: sortCol, direction: sortDir },
    });
  } catch (err) {
    if (err instanceof UnauthenticatedError || err instanceof AuthenticationError) redirect('/sign-in');
    if (err instanceof ForbiddenError) redirect('/forbidden');
    throw err;
  }

  return (
    <div className="flex flex-col h-full">
      <UsersTable
        users={paginatedUsers.users}
        total={paginatedUsers.total}
        limit={limit}
        offset={offset}
        sortCol={sortCol}
        sortDir={sortDir}
        activeFilters={filters}
        search={search ?? ''}
      />
    </div>
  );
}
