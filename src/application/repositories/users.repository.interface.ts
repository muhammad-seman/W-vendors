import type { CreateUser, PaginatedUsers, UpdateUser, User } from '@/src/entities/models/user';
import type { ITransaction } from '@/src/entities/models/transaction.interface';

export type UserFilterOpts = {
  role?: string[];
  subscription_plan?: string[];
  status?: string[];
};

export type UserSortOpts = {
  column: 'username' | 'email' | 'role' | 'subscription_plan' | 'status' | 'created_at';
  direction: 'asc' | 'desc';
};

export type GetUsersOpts = {
  limit: number;
  offset: number;
  search?: string;          // prefix search on username (uses index)
  filters?: UserFilterOpts;
  sort?: UserSortOpts;
};

export interface IUsersRepository {
  getUser(id: string): Promise<User | undefined>;
  getUsers(opts: GetUsersOpts): Promise<PaginatedUsers>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(input: CreateUser, tx?: ITransaction): Promise<User>;
  updateUser(id: string, input: UpdateUser): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
}
