import { generateId } from 'lucia';
import { IUsersRepository } from '@/src/application/repositories/users.repository.interface';
import { CreateUser, User } from '@/src/entities/models/user';

export function createUserUseCase(usersRepository: IUsersRepository) {
  return async function (input: Omit<CreateUser, 'id'>): Promise<User> {
    const id = generateId(21);
    return await usersRepository.createUser({ ...input, id });
  };
}

export type ICreateUserUseCase = ReturnType<typeof createUserUseCase>;
