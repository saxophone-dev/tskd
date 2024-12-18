import { Context, Next } from 'hono';
import { AuthUtils } from './auth-utils';
import { ErrorResponse, AuthContext } from './types';
import { getCookie } from 'hono/cookie';

export const rateLimiter = (limit: number, windowMs: number) => {
	const requestCounts = new Map<string, { count: number; resetTime: number }>();

	return async (c: Context, next: Next) => {
		const ip = c.req.header('CF-Connecting-IP') || 'unknown';
		const now = Date.now();

		let entry = requestCounts.get(ip);
		if (!entry || entry.resetTime < now) {
			entry = { count: 0, resetTime: now + windowMs };
			requestCounts.set(ip, entry);
		}

		if (entry.count >= limit) {
			return c.json<ErrorResponse>(
				{
					error: 'Too Many Requests',
					message: 'Rate limit exceeded',
				},
				429,
			);
		}

		entry.count++;
		await next();
	};
};

export const authMiddleware = async (c: Context, next: Next) => {
	const accessToken = getCookie(c, 'accessToken');

	if (!accessToken) {
		return c.json<ErrorResponse>(
			{
				error: 'Unauthorized',
				message: 'No access token provided',
			},
			401,
		);
	}

	const user = await AuthUtils.verifyAccessToken(accessToken);

	if (!user) {
		return c.json<ErrorResponse>(
			{
				error: 'Unauthorized',
				message: 'Invalid or expired access token',
			},
			401,
		);
	}

	(c as AuthContext).user = user;
	await next();
};
