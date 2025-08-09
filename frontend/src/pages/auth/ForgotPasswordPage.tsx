import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { authService } from '@/services/authService';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
	email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onSubmit = async (data: ForgotPasswordFormData) => {
		setIsLoading(true);
		try {
			await authService.forgotPassword(data.email);
			setIsSuccess(true);
			toast.success('Password reset instructions sent to your email');
		} catch (error: any) {
			toast.error(
				error.response?.data?.message || 'Failed to send reset email'
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (isSuccess) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
				<div className="max-w-md w-full space-y-8">
					<div className="text-center">
						<Logo size="xl" className="mx-auto text-blue-700" />
						<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
							Check your email
						</h2>
						<p className="mt-2 text-sm text-gray-600">
							We've sent you a password reset link
						</p>
					</div>

					<Card>
						<CardContent className="pt-6">
							<div className="text-center space-y-4">
								<p className="text-sm text-gray-600">
									Didn't receive the email? Check your spam folder or try again.
								</p>
								<div className="space-y-2">
									<Button
										onClick={() => setIsSuccess(false)}
										variant="outline"
										className="w-full"
									>
										Try Again
									</Button>
									<Link to="/login">
										<Button variant="ghost" className="w-full">
											Back to Login
										</Button>
									</Link>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<Logo size="lg" className="mx-auto text-blue-700" />
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
						Forgot your password?
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Enter your email address and we'll send you a link to reset your
						password.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Reset Password</CardTitle>
						<CardDescription>
							Enter your email address to receive reset instructions
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="Enter your email"
									{...register('email')}
									className={errors.email ? 'border-red-500' : ''}
								/>
								{errors.email && (
									<p className="text-sm text-red-500">{errors.email.message}</p>
								)}
							</div>

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Send Reset Instructions
							</Button>
						</form>

						<div className="mt-6 text-center">
							<p className="text-sm text-gray-600">
								Remember your password?{' '}
								<Link to="/login" className="text-primary hover:underline">
									Sign in
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
