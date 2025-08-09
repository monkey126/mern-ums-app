import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { ActivityLogModel, UserModel } from '../models';
import {
	emailVerificationSchema,
	forgotPasswordSchema,
	loginSchema,
	passwordResetSchema,
	refreshTokenSchema,
	registerSchema,
	type LoginInput,
	type RefreshTokenInput,
	type RegisterInput,
} from '../schemas/validation';
import { emailService } from '../utils/email';
import {
	AuthenticationError,
	ConflictError,
	ErrorMessages,
	NotFoundError,
	ValidationError,
} from '../utils/errors';
import {
	generateRefreshToken,
	generateToken,
	verifyRefreshToken,
} from '../utils/jwt';
import logger from '../utils/logger';
import { RequestInfo } from '../utils/requestHelper';

export class AuthService {
	// Register new user
	static async register(userData: RegisterInput, requestInfo: RequestInfo) {
		// Validate input
		const validatedData = registerSchema.parse(userData);

		// Check if user already exists
		const existingUser = await UserModel.findByEmail(userData.email);
		if (existingUser) {
			throw new ConflictError(ErrorMessages.USER_EXISTS);
		}

		// Generate verification token
		const emailVerificationToken = randomBytes(32).toString('hex');

		// Hash password
		const hashedPassword = await bcrypt.hash(userData.password, 10);

		// Create user
		const user = await UserModel.create({
			name: validatedData.name,
			email: validatedData.email,
			password: hashedPassword,
			phone: validatedData.phone || null,
			role: 'CLIENT',
			status: 'ACTIVE',
			emailVerificationToken,
		});

		// Create activity log
		await ActivityLogModel.create({
			user: { connect: { id: user.id } },
			activity: 'User registered',
			details: JSON.stringify({ email: userData.email }),
			ipAddress: requestInfo.ip || null,
			userAgent: requestInfo.userAgent || 'Unknown',
		});

		logger.info(
			{
				userId: user.id,
				email: user.email,
				action: 'User registered',
			},
			'New user registration'
		);

		// Send verification email
		try {
			const emailSent = await emailService.sendEmailVerification(
				user.email,
				user.name,
				emailVerificationToken
			);

			if (emailSent) {
				logger.info(
					{
						userId: user.id,
						email: user.email,
						action: 'Verification email sent',
					},
					'Verification email sent successfully'
				);
			} else {
				logger.error(
					{
						userId: user.id,
						email: user.email,
						action: 'Verification email failed',
					},
					'Failed to send verification email'
				);
			}
		} catch (error) {
			logger.error(
				{
					userId: user.id,
					email: user.email,
					error,
					action: 'Verification email error',
				},
				'Error sending verification email'
			);
		}

		return {
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				status: user.status,
				emailVerified: user.emailVerified,
			},
			message:
				'Registration successful. Please check your email to verify your account.',
		};
	}

	// Login user
	static async login(credentials: LoginInput, requestInfo: RequestInfo) {
		// Validate input
		const validatedData = loginSchema.parse(credentials);

		// Check if user exists
		const user = await UserModel.findByEmailWithPassword(validatedData.email);
		if (!user) {
			throw new AuthenticationError('No account found with this email address. Please check your email or sign up for a new account.');
		}

		// Check if password matches
		const isPasswordValid = await bcrypt.compare(
			validatedData.password,
			user.password
		);
		if (!isPasswordValid) {
			throw new AuthenticationError('Incorrect password. Please check your password and try again.');
		}

		// Check if user is active
		if (user.status !== 'ACTIVE') {
			let statusMessage = '';
			switch (user.status) {
				case 'INACTIVE':
					statusMessage =
						'Your account is inactive. Please contact support to reactivate your account.';
					break;
				case 'SUSPENDED':
					statusMessage =
						'Your account has been suspended. Please contact support for assistance.';
					break;
				default:
					statusMessage = 'Your account is not active. Please contact support.';
			}
			throw new AuthenticationError(statusMessage);
		}

		// Check if email is verified
		if (!user.emailVerified) {
			throw new AuthenticationError(
				'Please verify your email address before logging in. Check your inbox for a verification email.'
			);
		}

		// Get full user profile for response
		const userProfile = await UserModel.getProfile(user.id);

		// Create activity log
		await ActivityLogModel.create({
			user: { connect: { id: user.id } },
			activity: 'User logged in',
			details: JSON.stringify({ email: credentials.email }),
			ipAddress: requestInfo.ip || null,
			userAgent: requestInfo.userAgent || 'Unknown',
		});

		logger.info(
			{
				userId: user.id,
				email: user.email,
				action: 'User login',
			},
			'User logged in successfully'
		);

		// Generate tokens
		const accessToken = generateToken({
			id: user.id,
			email: user.email,
			role: user.role,
		});

		const refreshToken = generateRefreshToken({
			id: user.id,
			email: user.email,
			role: user.role,
		});

		// Store refresh token in database
		const refreshTokenExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
		await UserModel.update(user.id, {
			refreshToken,
			refreshTokenExpires,
		});

		return {
			user: userProfile,
			accessToken,
			refreshToken,
		};
	}

	// Verify email
	static async verifyEmail(token: string, requestInfo: RequestInfo) {
		// Validate input
		const validatedData = emailVerificationSchema.parse({ token });

		const user = await UserModel.findByVerificationToken(validatedData.token);
		if (!user) {
			throw new ValidationError(ErrorMessages.TOKEN_INVALID, {
				token: ['Email verification token is invalid or has expired'],
			});
		}

		// Update user
		await UserModel.update(user.id, {
			emailVerified: true,
			emailVerificationToken: null,
		});

		// Create activity log
		await ActivityLogModel.create({
			user: { connect: { id: user.id } },
			activity: 'Email verified',
			details: JSON.stringify({ email: user.email }),
			ipAddress: requestInfo.ip || null,
			userAgent: requestInfo.userAgent || 'Unknown',
		});

		logger.info(
			{
				userId: user.id,
				email: user.email,
				action: 'Email verified',
			},
			'User email verified successfully'
		);

		// Send welcome email
		try {
			await emailService.sendWelcomeEmail(user.email, user.name);
		} catch (error) {
			logger.error(
				{
					userId: user.id,
					email: user.email,
					error,
					action: 'Welcome email error',
				},
				'Error sending welcome email'
			);
		}

		return {
			message:
				'Email verified successfully. You can now log in to your account.',
		};
	}

	// Resend verification email
	static async resendVerificationEmail(
		email: string,
		requestInfo: RequestInfo
	) {
		// Check if user exists
		const user = await UserModel.findByEmail(email);
		if (!user) {
			throw new NotFoundError('User not found');
		}

		// Check if email is already verified
		if (user.emailVerified) {
			throw new ValidationError('Email is already verified', {
				email: ['Email is already verified'],
			});
		}

		// Generate new verification token
		const emailVerificationToken = randomBytes(32).toString('hex');

		// Update user with new token
		await UserModel.update(user.id, {
			emailVerificationToken,
		});

		// Send verification email
		try {
			const emailSent = await emailService.sendEmailVerification(
				user.email,
				user.name,
				emailVerificationToken
			);

			if (emailSent) {
				logger.info(
					{
						userId: user.id,
						email: user.email,
						action: 'Verification email resent',
					},
					'Verification email resent successfully'
				);
			} else {
				logger.error(
					{
						userId: user.id,
						email: user.email,
						action: 'Verification email resend failed',
					},
					'Failed to resend verification email'
				);
			}
		} catch (error) {
			logger.error(
				{
					userId: user.id,
					email: user.email,
					error,
					action: 'Verification email resend error',
				},
				'Error resending verification email'
			);
		}

		// Create activity log
		await ActivityLogModel.create({
			user: { connect: { id: user.id } },
			activity: 'Verification email resent',
			details: JSON.stringify({ email: user.email }),
			ipAddress: requestInfo.ip || null,
			userAgent: requestInfo.userAgent || 'Unknown',
		});

		return {
			message: 'Verification email sent successfully. Please check your inbox.',
		};
	}

	// Forgot password
	static async forgotPassword(email: string, requestInfo: RequestInfo) {
		// Validate input
		const validatedData = forgotPasswordSchema.parse({ email });

		const user = await UserModel.findByEmail(validatedData.email);
		if (!user) {
			// Use NotFoundError but with a vague message for security
			throw new NotFoundError(ErrorMessages.USER_NOT_FOUND);
		}

		// Generate reset token
		const passwordResetToken = randomBytes(32).toString('hex');
		const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

		// Save reset token
		await UserModel.update(user.id, {
			passwordResetToken,
			passwordResetExpires,
		});

		// Send password reset email
		try {
			const emailSent = await emailService.sendPasswordReset(
				user.email,
				user.name,
				passwordResetToken
			);

			if (emailSent) {
				logger.info(
					{
						userId: user.id,
						email: user.email,
						action: 'Password reset email sent',
					},
					'Password reset email sent successfully'
				);
			} else {
				logger.error(
					{
						userId: user.id,
						email: user.email,
						action: 'Password reset email failed',
					},
					'Failed to send password reset email'
				);
			}
		} catch (error) {
			logger.error(
				{
					userId: user.id,
					email: user.email,
					error,
					action: 'Password reset email error',
				},
				'Error sending password reset email'
			);
		}

		// Create activity log
		await ActivityLogModel.create({
			user: { connect: { id: user.id } },
			activity: 'Password reset requested',
			details: JSON.stringify({ email }),
			ipAddress: requestInfo.ip || null,
			userAgent: requestInfo.userAgent || 'Unknown',
		});

		logger.info(
			{
				userId: user.id,
				email: user.email,
				action: 'Password reset requested',
			},
			'Password reset requested by user'
		);

		return { message: 'Password reset instructions sent to your email' };
	}

	// Reset password
	static async resetPassword(
		token: string,
		password: string,
		confirmPassword: string,
		requestInfo: RequestInfo
	) {
		// Validate input using passwordResetSchema (for request body validation)
		const validatedData = passwordResetSchema.parse({
			password,
			confirmPassword,
		});

		const user = await UserModel.findByResetToken(token);
		if (!user) {
			throw new ValidationError(ErrorMessages.PASSWORD_RESET_INVALID, {
				token: ['Reset token is invalid or has expired'],
			});
		}

		// Hash new password
		const hashedPassword = await bcrypt.hash(validatedData.password, 10);

		// Update user's password and clear reset token
		await UserModel.update(user.id, {
			password: hashedPassword,
			passwordResetToken: null,
			passwordResetExpires: null,
		});

		// Create activity log
		await ActivityLogModel.create({
			user: { connect: { id: user.id } },
			activity: 'Password reset completed',
			details: JSON.stringify({ email: user.email }),
			ipAddress: requestInfo.ip || null,
			userAgent: requestInfo.userAgent || 'Unknown',
		});

		logger.info(
			{
				userId: user.id,
				email: user.email,
				action: 'Password reset completed',
			},
			'User password reset completed'
		);

		return { message: 'Password has been reset successfully' };
	}

	// Refresh access token
	static async refreshToken(
		tokenData: RefreshTokenInput,
		requestInfo: RequestInfo
	) {
		try {
			// Validate input
			const validatedData = refreshTokenSchema.parse(tokenData);

			// Verify refresh token
			const decoded = verifyRefreshToken(validatedData.refreshToken);

			// Find user and validate stored refresh token
			const user = await UserModel.findById(decoded.id);
			if (!user || user.refreshToken !== validatedData.refreshToken) {
				throw new AuthenticationError('Invalid refresh token');
			}

			// Check if refresh token has expired
			if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) {
				throw new AuthenticationError('Refresh token has expired');
			}

			// Generate new tokens (token rotation for security)
			const newAccessToken = generateToken({
				id: user.id,
				email: user.email,
				role: user.role,
			});

			const newRefreshToken = generateRefreshToken({
				id: user.id,
				email: user.email,
				role: user.role,
			});

			// Update stored refresh token
			const refreshTokenExpires = new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000
			); // 30 days
			await UserModel.update(user.id, {
				refreshToken: newRefreshToken,
				refreshTokenExpires,
			});

			// Create activity log
			await ActivityLogModel.create({
				user: { connect: { id: user.id } },
				activity: 'Token refreshed',
				details: JSON.stringify({ email: user.email }),
				ipAddress: requestInfo.ip || null,
				userAgent: requestInfo.userAgent || 'Unknown',
			});

			logger.info(
				{
					userId: user.id,
					email: user.email,
					action: 'Token refreshed',
				},
				'Access token refreshed'
			);

			return {
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
				},
			};
		} catch (error) {
			logger.error({ error }, 'Failed to refresh token');
			throw new AuthenticationError('Invalid or expired refresh token');
		}
	}

	// Logout user (invalidate refresh token)
	static async logout(userId: string, requestInfo: RequestInfo) {
		// Clear refresh token from database
		await UserModel.update(userId, {
			refreshToken: null,
			refreshTokenExpires: null,
		});

		// Create activity log
		await ActivityLogModel.create({
			user: { connect: { id: userId } },
			activity: 'User logged out',
			details: JSON.stringify({ userId }),
			ipAddress: requestInfo.ip || null,
			userAgent: requestInfo.userAgent || 'Unknown',
		});

		logger.info(
			{
				userId,
				action: 'User logout',
			},
			'User logged out successfully'
		);

		return { message: 'Logged out successfully' };
	}

	// Logout from all devices (invalidate all refresh tokens)
	static async logoutAll(userId: string, requestInfo: RequestInfo) {
		// Clear refresh token from database
		await UserModel.update(userId, {
			refreshToken: null,
			refreshTokenExpires: null,
		});

		// Create activity log
		await ActivityLogModel.create({
			user: { connect: { id: userId } },
			activity: 'User logged out from all devices',
			details: JSON.stringify({ userId }),
			ipAddress: requestInfo.ip || null,
			userAgent: requestInfo.userAgent || 'Unknown',
		});

		logger.info(
			{
				userId,
				action: 'User logout all devices',
			},
			'User logged out from all devices'
		);

		return { message: 'Logged out from all devices successfully' };
	}
}
