import { hashSync } from 'bcrypt-ts';

import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import type { CreateUser, User } from '@/src/entities/models/user';
import { PASSWORD_SALT_ROUNDS } from '@/config';

export class MockUsersRepository implements IUsersRepository {
  private _users: User[];

  constructor() {
    this._users = [
      {
        id: '1',
        username: 'one',
        password_hash: hashSync('password-one', PASSWORD_SALT_ROUNDS),
        role: 'vendor',
        status: 'active',
      },
      {
        id: '2',
        username: 'two',
        password_hash: hashSync('password-two', PASSWORD_SALT_ROUNDS),
        role: 'admin',
        status: 'active',
      },
      {
        id: '3',
        username: 'three',
        password_hash: hashSync('password-three', PASSWORD_SALT_ROUNDS),
        role: 'dev',
        status: 'active',
      },
    ];
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = this._users.find((u) => u.id === id);
    return user;
  }
  async getUsers(): Promise<any> {
    return { users: this._users, total: this._users.length, limit: 10, offset: 0 };
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = this._users.find((u) => u.username === username);
    return user;
  }
  async createUser(input: CreateUser): Promise<User> {
    const newUser: User = {
      id: input.id || this._users.length.toString(),
      username: input.username,
      password_hash: hashSync(input.password, PASSWORD_SALT_ROUNDS),
      role: input.role || 'vendor',
      status: 'active',
    };
    this._users.push(newUser);
    return newUser;
  }
  async updateUser(id: string, input: any): Promise<User | undefined> {
    const idx = this._users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this._users[idx] = { ...this._users[idx], ...input };
    return this._users[idx];
  }
  async deleteUser(id: string): Promise<void> {
    this._users = this._users.filter((u) => u.id !== id);
  }
}
