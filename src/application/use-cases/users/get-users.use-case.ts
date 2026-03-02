import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { PaginatedUsers } from '@/src/entities/models/user';
import type { GetUsersOpts } from '@/src/application/repositories/users.repository.interface';

export function getUsersUseCase(usersRepository: IUsersRepository) {
  return async function (opts: GetUsersOpts): Promise<PaginatedUsers> {
    return await usersRepository.getUsers(opts);
  };
}

export type IGetUsersUseCase = ReturnType<typeof getUsersUseCase>;
