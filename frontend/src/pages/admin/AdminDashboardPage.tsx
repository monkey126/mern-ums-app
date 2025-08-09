import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { adminService } from '@/services/adminService';
import { useQuery } from '@tanstack/react-query';
import {
	Activity,
	AlertTriangle,
	Eye,
	Loader2,
	RefreshCw,
	UserCheck,
	Users,
	UserX,
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const AdminDashboardPage: React.FC = () => {
	const {
		data: statsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ['admin-stats'],
		queryFn: () => adminService.getStats(),
	});

	const getRoleColor = (role: string) => {
		switch (role) {
			case 'ADMIN':
				return 'bg-red-100 text-red-800';
			case 'DEVELOPER':
				return 'bg-blue-100 text-blue-800';
			case 'MODERATOR':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return {
			date: date.toLocaleDateString(),
			time: date.toLocaleTimeString(),
			relative: getRelativeTime(date),
		};
	};

	const getRelativeTime = (date: Date) => {
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (diffInSeconds < 60) return 'Just now';
		if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
		if (diffInSeconds < 86400)
			return `${Math.floor(diffInSeconds / 3600)}h ago`;
		if (diffInSeconds < 2592000)
			return `${Math.floor(diffInSeconds / 86400)}d ago`;
		return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
	};

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<Card className="w-full max-w-md">
					<CardContent className="flex flex-col items-center space-y-4 p-6">
						<AlertTriangle className="h-12 w-12 text-red-500" />
						<h3 className="text-lg font-semibold">Error Loading Dashboard</h3>
						<p className="text-sm text-muted-foreground text-center">
							Failed to load dashboard data. Please try again.
						</p>
						<Button onClick={() => refetch()}>
							<RefreshCw className="mr-2 h-4 w-4" />
							Retry
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
					<p className="text-muted-foreground">
						System overview and management controls
					</p>
				</div>
				<Button onClick={() => refetch()} disabled={isLoading}>
					{isLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						<RefreshCw className="mr-2 h-4 w-4" />
					)}
					Refresh
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								statsData?.stats.totalUsers || 0
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							All registered users
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Users</CardTitle>
						<UserCheck className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								statsData?.stats.byStatus.active || 0
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							Currently active accounts
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Inactive Users
						</CardTitle>
						<UserX className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								statsData?.stats.byStatus.inactive || 0
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							Suspended or inactive
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Administrators
						</CardTitle>
						<Logo size="xs" className="text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{isLoading ? (
								<Loader2 className="h-6 w-6 animate-spin" />
							) : (
								statsData?.stats.byRole.admins || 0
							)}
						</div>
						<p className="text-xs text-muted-foreground">
							System administrators
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Role Distribution */}
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>User Roles Distribution</CardTitle>
						<CardDescription>Breakdown of users by role</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="flex justify-center p-8">
								<Loader2 className="h-8 w-8 animate-spin" />
							</div>
						) : (
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Badge className={getRoleColor('ADMIN')}>ADMIN</Badge>
										<span className="text-sm font-medium">Administrators</span>
									</div>
									<span className="text-sm text-muted-foreground">
										{statsData?.stats.byRole.admins || 0}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Badge className={getRoleColor('DEVELOPER')}>
											DEVELOPER
										</Badge>
										<span className="text-sm font-medium">Developers</span>
									</div>
									<span className="text-sm text-muted-foreground">
										{statsData?.stats.byRole.developers || 0}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Badge className={getRoleColor('MODERATOR')}>
											MODERATOR
										</Badge>
										<span className="text-sm font-medium">Moderators</span>
									</div>
									<span className="text-sm text-muted-foreground">
										{statsData?.stats.byRole.moderators || 0}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Badge className={getRoleColor('CLIENT')}>CLIENT</Badge>
										<span className="text-sm font-medium">Clients</span>
									</div>
									<span className="text-sm text-muted-foreground">
										{statsData?.stats.byRole.clients || 0}
									</span>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Common administrative tasks</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<Button asChild className="w-full justify-start">
								<Link to="/admin/users">
									<Users className="mr-2 h-4 w-4" />
									Manage Users
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="w-full justify-start"
							>
								<Link to="/admin/activity-logs">
									<Activity className="mr-2 h-4 w-4" />
									View Activity Logs
								</Link>
							</Button>
							<Button
								asChild
								variant="outline"
								className="w-full justify-start"
							>
								<Link to="/profile">
									<Logo size="sm" className="mr-2" />
									Admin Profile
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						Recent Activity
					</CardTitle>
					<CardDescription>
						Latest system activities and user actions
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex justify-center p-8">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : (
						<div className="space-y-4">
							{statsData?.recentActivities?.slice(0, 5).map((activity) => {
								const timeInfo = formatDate(activity.createdAt);
								return (
									<div
										key={activity.id}
										className="flex items-start space-x-4 p-3 border rounded-lg"
									>
										<Avatar className="h-8 w-8">
											<AvatarImage src={activity.user?.profilePicture} />
											<AvatarFallback>
												{activity.user?.name
													?.split(' ')
													.map((n) => n[0])
													.join('')
													.toUpperCase() || 'U'}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<div className="flex items-center space-x-2 mb-1">
												<span className="font-medium text-sm">
													{activity.activity}
												</span>
												<Badge
													className={getRoleColor(
														activity.user?.role || 'CLIENT'
													)}
													variant="outline"
												>
													{activity.user?.role || 'CLIENT'}
												</Badge>
											</div>
											<div className="flex items-center space-x-2 text-xs text-muted-foreground">
												<span>{activity.user?.name || 'Unknown User'}</span>
												<span>•</span>
												<span>{timeInfo.relative}</span>
												{activity.ipAddress && (
													<>
														<span>•</span>
														<span>IP: {activity.ipAddress}</span>
													</>
												)}
											</div>
										</div>
									</div>
								);
							})}

							{(!statsData?.recentActivities ||
								statsData.recentActivities.length === 0) && (
								<div className="text-center py-8">
									<Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-medium mb-2">
										No recent activity
									</h3>
									<p className="text-muted-foreground">
										System activity will appear here
									</p>
								</div>
							)}
						</div>
					)}

					{statsData?.recentActivities &&
						statsData.recentActivities.length > 5 && (
							<div className="mt-4 text-center">
								<Button asChild variant="outline">
									<Link to="/admin/activity-logs">
										<Eye className="mr-2 h-4 w-4" />
										View All Activities
									</Link>
								</Button>
							</div>
						)}
				</CardContent>
			</Card>
		</div>
	);
};
