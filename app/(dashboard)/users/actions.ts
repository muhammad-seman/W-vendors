'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { SESSION_COOKIE } from '@/config';
import { UnauthenticatedError } from '@/src/entities/errors/auth';
import { getInjection } from '@/di/container';
import { CreateUser, UpdateUser } from '@/src/entities/models/user';

async function getSessionId() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

async function validateSession() {
  const sessionId = await getSessionId();
  if (!sessionId) throw new UnauthenticatedError('Not authenticated');
  const authService = getInjection('IAuthenticationService');
  await authService.validateSession(sessionId);
  return sessionId;
}

export async function createUserAction(input: Omit<CreateUser, 'id'>) {
  try {
    await validateSession();
    const controller = getInjection('ICreateUserController');
    await controller(input);
  } catch (err) {
    if (err instanceof UnauthenticatedError) return { error: 'Unauthorized' };
    const crashReporter = getInjection('ICrashReporterService');
    crashReporter.report(err);
    return { error: 'Failed to create user' };
  }
  revalidatePath('/users');
  return { success: true };
}

export async function updateUserAction(id: string, input: UpdateUser) {
  try {
    await validateSession();
    const controller = getInjection('IUpdateUserController');
    await controller(id, input);
  } catch (err) {
    if (err instanceof UnauthenticatedError) return { error: 'Unauthorized' };
    const crashReporter = getInjection('ICrashReporterService');
    crashReporter.report(err);
    return { error: 'Failed to update user' };
  }
  revalidatePath('/users');
  return { success: true };
}

export async function deleteUserAction(id: string) {
  try {
    await validateSession();
    const controller = getInjection('IDeleteUserController');
    await controller(id);
  } catch (err) {
    if (err instanceof UnauthenticatedError) return { error: 'Unauthorized' };
    const crashReporter = getInjection('ICrashReporterService');
    crashReporter.report(err);
    return { error: 'Failed to delete user' };
  }
  revalidatePath('/users');
  return { success: true };
}
