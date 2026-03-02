import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';

export function deleteUserUseCase(usersRepository: IUsersRepository) {
  return async function (id: string): Promise<void> {
    return await usersRepository.deleteUser(id);
  };
}

export type IDeleteUserUseCase = ReturnType<typeof deleteUserUseCase>;
