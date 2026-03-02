import { IDeleteUserUseCase } from '@/src/application/use-cases/users/delete-user.use-case';

export function deleteUserController(deleteUserUseCase: IDeleteUserUseCase) {
  return async function (id: string): Promise<void> {
    return await deleteUserUseCase(id);
  };
}

export type IDeleteUserController = ReturnType<typeof deleteUserController>;
