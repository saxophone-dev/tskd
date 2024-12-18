import { sign, verify } from 'hono/jwt';
import * as bcrypt from 'bcrypt-ts';
import { User } from './types';

export class AuthUtils {
	private static JWT_ACCESS_SECRET = getEnv('JWT_ACCESS_SECRET');
	private static JWT_REFRESH_SECRET = getEnv('JWT_REFRESH_SECRET');
	private static BCRYPT_ROUNDS = parseInt(getEnv('BCRYPT_ROUNDS', '12'));

	static async hashPassword(password: string, salt?: string): Promise<{ hashedPassword: string; salt: string }> {
		salt = salt || (await bcrypt.genSalt(this.BCRYPT_ROUNDS));
		const hashedPassword = await bcrypt.hash(password, salt);
		return { hashedPassword, salt };
	}

	static async verifyPassword(inputPassword: string, storedHash: string): Promise<boolean> {
		return bcrypt.compare(inputPassword, storedHash);
	}

	static async generateAccessToken(user: User): Promise<string> {
		return sign(
			{
				sub: user.id,
				email: user.email,
				exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
			},
			this.JWT_ACCESS_SECRET,
		);
	}

	static async generateRefreshToken(user: User): Promise<string> {
		return sign(
			{
				sub: user.id,
				email: user.email,
				exp: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60, // 90 days
			},
			this.JWT_REFRESH_SECRET,
		);
	}

	static async verifyAccessToken(token: string): Promise<User | null> {
		try {
			const decoded = await verify(token, this.JWT_ACCESS_SECRET);
			// urm ignore this shite code
			// because id and email are unknown types lmao so it just try catches that shit
			return {
				// @ts-ignore
				id: decoded.sub,
				// @ts-ignore
				email: decoded.email,
				username: '', // Limited info in token
				hashedPassword: '',
				salt: '',
			};
		} catch {
			return null;
		}
	}

	static async verifyRefreshToken(token: string): Promise<User | null> {
		try {
			const decoded = await verify(token, this.JWT_REFRESH_SECRET);
			// urm ignore this shite code
			// because id and email are unknown types lmao so it just try catches that shit
			return {
				// @ts-ignore
				id: decoded.sub,
				// @ts-ignore
				email: decoded.email,
				username: '', // Limited info in token
				hashedPassword: '',
				salt: '',
			};
		} catch {
			return null;
		}
	}
}

// Utility to safely get environment variables
function getEnv(key: string, defaultValue?: string): string {
	const value = process.env[key] || defaultValue;
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
}
