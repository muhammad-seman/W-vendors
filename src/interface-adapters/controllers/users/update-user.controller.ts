import { IUpdateUserUseCase } from '@/src/application/use-cases/users/update-user.use-case';
import { UpdateUser, User } from '@/src/entities/models/user';

export function updateUserController(updateUserUseCase: IUpdateUserUseCase) {
  return async function (id: string, input: UpdateUser): Promise<User | undefined> {
    return await updateUserUseCase(id, input);
  };
}

export type IUpdateUserController = ReturnType<typeof updateUserController>;
