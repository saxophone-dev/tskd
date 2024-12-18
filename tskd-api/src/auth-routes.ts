import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { AuthUtils } from './auth-utils';
import { rateLimiter, authMiddleware } from './auth-middleware';
import { UserRegisterInput, UserLoginInput, User, ErrorResponse } from './types';

// Simulated database (replace with actual database in production)
const users: User[] = [];

const authRoutes = new Hono();

// Rate limiting middleware
const loginRateLimiter = rateLimiter(6, 60000); // 6 attempts per minute
const resetRateLimiter = rateLimiter(3, 3600000); // 3 attempts per hour

// Validation schemas
const registerSchema = z.object({
	email: z.string().email(),
	username: z.string().min(3).max(50),
	hashedPassword: z.string().min(8),
	salt: z.string(),
});

const loginSchema = z.object({
	email: z.string().email(),
	hashedPassword: z.string().min(8),
});

const resetPasswordSchema = z.object({
	token: z.string(),
	newPassword: z.string().min(8),
});

// Authentication routes
authRoutes.post('/register', loginRateLimiter, zValidator('json', registerSchema), async (c) => {
	const input = c.req.valid('json') as UserRegisterInput;

	// Check if user already exists
	if (users.some((u) => u.email === input.email)) {
		return c.json<ErrorResponse>(
			{
				error: 'Bad Request',
				message: 'Email already exists',
			},
			400,
		);
	}

	// Create user
	const user: User = {
		id: crypto.randomUUID(),
		email: input.email,
		username: input.username,
		hashedPassword: input.hashedPassword,
		salt: input.salt,
	};
	users.push(user);

	// Generate tokens
	const accessToken = await AuthUtils.generateAccessToken(user);
	const refreshToken = await AuthUtils.generateRefreshToken(user);

	// Set cookies
	c.res.headers.append('Set-Cookie', `accessToken=${accessToken}; HttpOnly; Secure; Path=/; SameSite=Strict`);
	c.res.headers.append('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Secure; Path=/; SameSite=Strict`);

	return c.json({
		user: {
			id: user.id,
			email: user.email,
			username: user.username,
		},
	});
});

authRoutes.post('/login', loginRateLimiter, zValidator('json', loginSchema), async (c) => {
	const input = c.req.valid('json') as UserLoginInput;

	// Find user
	const user = users.find((u) => u.email === input.email);
	if (!user) {
		return c.json<ErrorResponse>(
			{
				error: 'Unauthorized',
				message: 'Invalid credentials',
			},
			401,
		);
	}

	// Verify password
	const isValid = await AuthUtils.verifyPassword(input.hashedPassword, user.hashedPassword);
	if (!isValid) {
		return c.json<ErrorResponse>(
			{
				error: 'Unauthorized',
				message: 'Invalid credentials',
			},
			401,
		);
	}

	// Generate tokens
	const accessToken = await AuthUtils.generateAccessToken(user);
	const refreshToken = await AuthUtils.generateRefreshToken(user);

	// Set cookies
	c.res.headers.append('Set-Cookie', `accessToken=${accessToken}; HttpOnly; Secure; Path=/; SameSite=Strict`);
	c.res.headers.append('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Secure; Path=/; SameSite=Strict`);

	return c.json({
		user: {
			id: user.id,
			email: user.email,
			username: user.username,
		},
	});
});

authRoutes.post('/salt', zValidator('json', z.object({ email: z.string().email() })), async (c) => {
	const { email } = c.req.valid('json');

	const user = users.find((u) => u.email === email);
	if (!user) {
		return c.json<ErrorResponse>(
			{
				error: 'Not Found',
				message: 'User not found',
			},
			404,
		);
	}

	return c.json({ salt: user.salt });
});

authRoutes.post('/refresh', async (c) => {
	const refreshToken = c.req.cookie('refreshToken');

	if (!refreshToken) {
		return c.json<ErrorResponse>(
			{
				error: 'Unauthorized',
				message: 'No refresh token provided',
			},
			401,
		);
	}

	const user = await AuthUtils.verifyRefreshToken(refreshToken);

	if (!user) {
		return c.json<ErrorResponse>(
			{
				error: 'Unauthorized',
				message: 'Invalid refresh token',
			},
			401,
		);
	}

	// Generate new access token
	const newAccessToken = await AuthUtils.generateAccessToken(user);

	// Set new access token cookie
	c.res.headers.append('Set-Cookie', `accessToken=${newAccessToken}; HttpOnly; Secure; Path=/; SameSite=Strict`);

	return c.json({ message: 'Token refreshed successfully' });
});

authRoutes.post('/logout', async (c) => {
	// Clear auth cookies
	c.res.headers.append('Set-Cookie', 'accessToken=; HttpOnly; Secure; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
	c.res.headers.append('Set-Cookie', 'refreshToken=; HttpOnly; Secure; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT');

	return c.json({ message: 'Logged out successfully' });
});

authRoutes.post('/request-reset', resetRateLimiter, zValidator('json', z.object({ email: z.string().email() })), async (c) => {
	const { email } = c.req.valid('json');

	// In a real implementation, generate a reset token and send email
	// This is a placeholder implementation
	const user = users.find((u) => u.email === email);

	return c.json({
		message: 'Reset email sent if account exists',
	});
});

authRoutes.post('/reset-password', zValidator('json', resetPasswordSchema), async (c) => {
	const { token, newPassword } = c.req.valid('json');

	// In a real implementation, validate reset token
	// This is a placeholder implementation
	// Ideally, you would validate the token against a stored reset token
	const user = users.find((u) => u.email.includes(token));

	if (!user) {
		return c.json<ErrorResponse>(
			{
				error: 'Bad Request',
				message: 'Invalid or expired token',
			},
			400,
		);
	}

	// Hash new password
	const { hashedPassword, salt } = await AuthUtils.hashPassword(newPassword);

	// Update user's password
	user.hashedPassword = hashedPassword;
	user.salt = salt;

	return c.json({ message: 'Password reset successful' });
});

export default authRoutes;
