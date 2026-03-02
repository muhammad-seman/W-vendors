import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm';
import { hash } from 'bcrypt-ts';

import { db } from '@/drizzle';
import { users } from '@/drizzle/schema';
import { IUsersRepository, GetUsersOpts } from '@/src/application/repositories/users.repository.interface';
import { DatabaseOperationError } from '@/src/entities/errors/common';
import type { CreateUser, PaginatedUsers, UpdateUser, User } from '@/src/entities/models/user';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';
import { PASSWORD_SALT_ROUNDS } from '@/config';

// Map column name to actual Drizzle column
const SORTABLE_COLUMNS = {
  username:          users.username,
  email:             users.email,
  role:              users.role,
  subscription_plan: users.subscription_plan,
  status:            users.status,
  created_at:        users.created_at,
} as const;

export class UsersRepository implements IUsersRepository {
  constructor(
    private readonly instrumentationService: IInstrumentationService,
    private readonly crashReporterService: ICrashReporterService
  ) {}

  async getUser(id: string): Promise<User | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'UsersRepository > getUser' },
      async () => {
        try {
          const query = db.query.users.findFirst({
            where: eq(users.id, id),
          });

          const user = await this.instrumentationService.startSpan(
            { name: query.toSQL().sql, op: 'db.query', attributes: { 'db.system': 'mysql' } },
            () => query.execute()
          );

          return user as User | undefined;
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async getUsers({ limit, offset, search, filters, sort }: GetUsersOpts): Promise<PaginatedUsers> {
    return await this.instrumentationService.startSpan(
      { name: 'UsersRepository > getUsers' },
      async () => {
        try {
          const conditions = [];
          // Prefix search on indexed username column — LIKE 'term%' can use B-tree index
          if (search?.trim()) conditions.push(sql`${users.username} LIKE ${search.trim() + '%'}`);
          
          if (filters?.role?.length) {
            if (filters.role.length === 1) {
              conditions.push(eq(users.role, filters.role[0] as any));
            } else {
              conditions.push(inArray(users.role, filters.role as any[]));
            }
          }
          
          if (filters?.subscription_plan?.length) {
            if (filters.subscription_plan.length === 1) {
              conditions.push(eq(users.subscription_plan, filters.subscription_plan[0] as any));
            } else {
              conditions.push(inArray(users.subscription_plan, filters.subscription_plan as any[]));
            }
          }

          if (filters?.status?.length) {
            if (filters.status.length === 1) {
              conditions.push(eq(users.status, filters.status[0] as any));
            } else {
              conditions.push(inArray(users.status, filters.status as any[]));
            }
          }

          const where = conditions.length > 0 ? and(...conditions) : undefined;

          // Build ORDER BY
          const sortCol = SORTABLE_COLUMNS[sort?.column ?? 'created_at'] || users.created_at;
          const orderBy = sort?.direction === 'desc' ? desc(sortCol) : asc(sortCol);

          // Single batched query — no N+1
          const [usersList, [{ totalCount }]] = await Promise.all([
            db.select().from(users).where(where).orderBy(orderBy).limit(limit).offset(offset),
            db.select({ totalCount: count() }).from(users).where(where),
          ]);

          return {
            users: usersList as User[],
            total: Number(totalCount ?? 0),
            limit,
            offset,
          };
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'UsersRepository > getUserByUsername' },
      async () => {
        try {
          const query = db.query.users.findFirst({
            where: eq(users.username, username),
          });

          const user = await this.instrumentationService.startSpan(
            { name: query.toSQL().sql, op: 'db.query', attributes: { 'db.system': 'mysql' } },
            () => query.execute()
          );

          return user as User | undefined;
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async createUser(input: CreateUser): Promise<User> {
    return await this.instrumentationService.startSpan(
      { name: 'UsersRepository > createUser' },
      async () => {
        try {
          const password_hash = await this.instrumentationService.startSpan(
            { name: 'hash password', op: 'function' },
            () => hash(input.password, PASSWORD_SALT_ROUNDS)
          );

          const newUser = {
            id: input.id,
            username: input.username,
            password_hash,
            email: input.email ?? null,
            phone: input.phone ?? null,
            role: input.role ?? 'vendor',
            subscription_plan: input.subscription_plan ?? 'basic',
            status: 'active' as const,
          };

          await db.insert(users).values(newUser);
          const created = await db.query.users.findFirst({ where: eq(users.id, input.id) });
          return created as User;
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async updateUser(id: string, input: UpdateUser): Promise<User | undefined> {
    return await this.instrumentationService.startSpan(
      { name: 'UsersRepository > updateUser' },
      async () => {
        try {
          await db.update(users).set(input).where(eq(users.id, id));
          const updated = await db.query.users.findFirst({ where: eq(users.id, id) });
          return updated as User | undefined;
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }

  async deleteUser(id: string): Promise<void> {
    return await this.instrumentationService.startSpan(
      { name: 'UsersRepository > deleteUser' },
      async () => {
        try {
          await db.delete(users).where(eq(users.id, id));
        } catch (err) {
          this.crashReporterService.report(err);
          throw err;
        }
      }
    );
  }
}
