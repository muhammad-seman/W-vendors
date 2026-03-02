import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { UpdateUser, User } from '@/src/entities/models/user';

export function updateUserUseCase(usersRepository: IUsersRepository) {
  return async function (id: string, input: UpdateUser): Promise<User | undefined> {
    return await usersRepository.updateUser(id, input);
  };
}

export type IUpdateUserUseCase = ReturnType<typeof updateUserUseCase>;
