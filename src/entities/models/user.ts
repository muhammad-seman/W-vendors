import { z } from 'zod';

export const subscriptionPlanEnum = z.enum(['basic', 'pro', 'enterprise']);
export const userRoleEnum = z.enum(['dev', 'admin', 'vendor']);
export const userStatusEnum = z.enum(['active', 'inactive', 'suspended']);

export const userSchema = z.object({
  id: z.string(),
  username: z.string().min(3).max(31),
  password_hash: z.string().min(6).max(255),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  role: userRoleEnum.default('vendor'),
  subscription_plan: subscriptionPlanEnum.nullable().optional(),
  status: userStatusEnum.default('active'),
  created_at: z.date().nullable().optional(),
});

export type User = z.infer<typeof userSchema>;

export const createUserSchema = z.object({
  id: z.string(),
  username: z.string().min(3).max(31),
  password: z.string().min(6).max(255),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  role: userRoleEnum.optional().default('vendor'),
  subscription_plan: subscriptionPlanEnum.optional().default('basic'),
});

export type CreateUser = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  username: z.string().min(3).max(31).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  role: userRoleEnum.optional(),
  subscription_plan: subscriptionPlanEnum.nullable().optional(),
  status: userStatusEnum.optional(),
});

export type UpdateUser = z.infer<typeof updateUserSchema>;

export type PaginatedUsers = {
  users: User[];
  total: number;
  limit: number;
  offset: number;
};
