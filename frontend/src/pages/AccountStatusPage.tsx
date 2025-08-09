import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import {
	AlertTriangle,
	ArrowLeft,
	HelpCircle,
	Mail,
	Phone,
	XCircle,
} from 'lucide-react';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export const AccountStatusPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const status = searchParams.get('status') || 'inactive';
	const email = searchParams.get('email') || '';

	const getStatusInfo = () => {
		switch (status.toLowerCase()) {
			case 'suspended':
				return {
					title: 'Account Suspended',
					description:
						'Your account has been suspended due to policy violations or security concerns.',
					icon: <XCircle className="h-8 w-8 text-red-600" />,
					badge: <Badge variant="destructive">SUSPENDED</Badge>,
					message:
						'Your account has been suspended. Please contact support for assistance.',
					action: 'Contact support immediately to resolve this issue.',
					color: 'text-red-600',
					bgColor: 'bg-red-50',
					borderColor: 'border-red-200',
				};
			case 'inactive':
				return {
					title: 'Account Inactive',
					description: 'Your account is currently inactive and cannot be used.',
					icon: <AlertTriangle className="h-8 w-8 text-orange-600" />,
					badge: <Badge variant="secondary">INACTIVE</Badge>,
					message:
						'Your account is inactive. Please contact support to reactivate your account.',
					action: 'Contact support to reactivate your account.',
					color: 'text-orange-600',
					bgColor: 'bg-orange-50',
					borderColor: 'border-orange-200',
				};
			default:
				return {
					title: 'Account Status Issue',
					description: 'There is an issue with your account status.',
					icon: <HelpCircle className="h-8 w-8 text-gray-600" />,
					badge: <Badge variant="outline">UNKNOWN</Badge>,
					message: 'Please contact support for assistance.',
					action: 'Contact support for assistance.',
					color: 'text-gray-600',
					bgColor: 'bg-gray-50',
					borderColor: 'border-gray-200',
				};
		}
	};

	const statusInfo = getStatusInfo();

	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
						{statusInfo.icon}
					</div>
					<CardTitle className="text-2xl font-bold">
						{statusInfo.title}
					</CardTitle>
					<CardDescription className="mt-2">
						{statusInfo.description}
					</CardDescription>
					<div className="mt-2">{statusInfo.badge}</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<Alert className={`${statusInfo.bgColor} ${statusInfo.borderColor}`}>
						<AlertDescription className={statusInfo.color}>
							{statusInfo.message}
						</AlertDescription>
					</Alert>

					<div className="space-y-3">
						<h3 className="font-semibold text-sm">What you can do:</h3>
						<p className="text-sm text-muted-foreground">{statusInfo.action}</p>
					</div>

					<div className="space-y-3">
						<h3 className="font-semibold text-sm">Contact Support:</h3>
						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<Mail className="h-4 w-4" />
								<span>support@worlditltd.com</span>
							</div>
							<div className="flex items-center gap-2">
								<Phone className="h-4 w-4" />
								<span>+1 (555) 123-4567</span>
							</div>
						</div>
					</div>

					{email && (
						<div className="p-3 bg-muted rounded-md">
							<p className="text-sm text-muted-foreground">
								<strong>Account Email:</strong> {email}
							</p>
						</div>
					)}

					<div className="flex flex-col space-y-2">
						<Button asChild>
							<Link to="/login">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Login
							</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link to="/">
								<Logo size="sm" className="mr-2" />
								Go to Home
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
