export class AppError extends Error {
	statusCode: number;
	status: string;
	isOperational: boolean;
	errors: Record<string, string[]> | null;

	constructor(
		message: string,
		statusCode: number,
		errors?: Record<string, string[]>
	) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
		this.isOperational = true;
		this.errors = errors || null;

		Error.captureStackTrace(this, this.constructor);
	}

	toJSON() {
		return {
			success: false,
			status: this.status,
			message: this.message,
			...(this.errors && { errors: this.errors }),
		};
	}
}

export class ValidationError extends AppError {
	constructor(message: string, errors: Record<string, string[]>) {
		super(message, 400, errors);
	}
}

export class AuthenticationError extends AppError {
	constructor(message: string) {
		super(message, 401);
	}
}

export class AuthorizationError extends AppError {
	constructor(message: string) {
		super(message, 403);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string) {
		super(message, 404);
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super(message, 409);
	}
}

export const ErrorMessages = {
	// Authentication related
	INVALID_CREDENTIALS: 'Invalid credentials',
	UNAUTHORIZED: 'Not authorized to access this resource',
	TOKEN_EXPIRED: 'Your session has expired. Please login again',
	TOKEN_INVALID: 'Invalid authentication token',

	// User related
	USER_NOT_FOUND: 'User not found',
	USER_EXISTS: 'User with this email already exists',
	USER_INACTIVE:
		'Your account is inactive. Please contact support to reactivate your account.',
	USER_SUSPENDED:
		'Your account has been suspended. Please contact support for assistance.',
	EMAIL_NOT_VERIFIED: 'Please verify your email address first',

	// Password related
	PASSWORD_MISMATCH: 'Current password is incorrect',
	PASSWORD_RESET_EXPIRED: 'Password reset token has expired',
	PASSWORD_RESET_INVALID: 'Invalid password reset token',

	// Validation related
	INVALID_INPUT: 'Invalid input data',
	EMAIL_REQUIRED: 'Email is required',
	PASSWORD_REQUIRED: 'Password is required',
	NAME_REQUIRED: 'Name is required',

	// Access related
	FORBIDDEN: 'You do not have permission to perform this action',
	RESOURCE_NOT_FOUND: 'The requested resource was not found',

	// General errors
	INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later',
	SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
} as const;
