import { ICreateUserUseCase } from '@/src/application/use-cases/users/create-user.use-case';
import { CreateUser, User } from '@/src/entities/models/user';

export function createUserController(createUserUseCase: ICreateUserUseCase) {
  return async function (input: Omit<CreateUser, 'id'>): Promise<User> {
    return await createUserUseCase(input);
  };
}

export type ICreateUserController = ReturnType<typeof createUserController>;
