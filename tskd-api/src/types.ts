import { Context } from 'hono';

export interface UserRegisterInput {
  email: string;
  username: string;
  hashedPassword: string;
  salt: string;
}

export interface UserLoginInput {
  email: string;
  hashedPassword: string;
}

export interface UserResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  hashedPassword: string;
  salt: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

export type AuthContext = Context & {
  get user(): User | null;
  set user(value: User | null);
}
