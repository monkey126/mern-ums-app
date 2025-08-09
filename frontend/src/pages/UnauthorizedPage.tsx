import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { ArrowLeft, Home } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const UnauthorizedPage: React.FC = () => {
	return (
		<div className="min-h-screen bg-background flex items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
						<Logo size="md" className="text-red-600" />
					</div>
					<CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
					<CardDescription>
						You don't have permission to access this page
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-center text-muted-foreground">
						This area is restricted to authorized users only. Please contact
						your administrator if you believe this is an error.
					</p>
					<div className="flex flex-col space-y-2">
						<Button asChild>
							<Link to="/dashboard">
								<Home className="mr-2 h-4 w-4" />
								Go to Dashboard
							</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link to="/profile">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Profile
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
