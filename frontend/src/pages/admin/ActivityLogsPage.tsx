import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { adminService } from '@/services/adminService';
import { useQuery } from '@tanstack/react-query';
import {
	Activity,
	AlertTriangle,
	Calendar,
	CheckCircle,
	Clock,
	Eye,
	Filter,
	Info,
	Loader2,
	Mail,
	Network,
	RefreshCw,
	Search,
	User,
	XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export const ActivityLogsPage: React.FC = () => {
	const [page, setPage] = useState(1);
	const [limit] = useState(20);
	const [search, setSearch] = useState('');
	const [activityFilter, setActivityFilter] = useState('all');
	const [debouncedSearch, setDebouncedSearch] = useState('');

	// Debounce search to avoid too many API calls
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);

		return () => clearTimeout(timer);
	}, [search]);

	// Reset page when filters change
	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, activityFilter]);

	const {
		data: logsData,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: [
			'admin-activity-logs',
			page,
			limit,
			debouncedSearch,
			activityFilter,
		],
		queryFn: () =>
			adminService.getActivityLogs({
				page,
				limit,
				search: debouncedSearch || undefined,
				activity: activityFilter !== 'all' ? activityFilter : undefined,
			}),
	});

	const getActivityIcon = (activity: string) => {
		const activityLower = activity.toLowerCase();
		if (activityLower.includes('logged in'))
			return <CheckCircle className="h-4 w-4 text-green-500" />;
		if (activityLower.includes('deleted'))
			return <XCircle className="h-4 w-4 text-red-500" />;
		if (activityLower.includes('updated'))
			return <Eye className="h-4 w-4 text-blue-500" />;
		if (
			activityLower.includes('registered') ||
			activityLower.includes('created')
		)
			return <CheckCircle className="h-4 w-4 text-green-500" />;
		if (activityLower.includes('verified'))
			return <CheckCircle className="h-4 w-4 text-green-500" />;
		if (activityLower.includes('reset'))
			return <CheckCircle className="h-4 w-4 text-green-500" />;
		if (activityLower.includes('logged out'))
			return <XCircle className="h-4 w-4 text-orange-500" />;
		return <Activity className="h-4 w-4 text-gray-500" />;
	};

	const getActivityColor = (activity: string) => {
		const activityLower = activity.toLowerCase();
		if (activityLower.includes('logged in'))
			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
		if (activityLower.includes('deleted'))
			return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
		if (activityLower.includes('updated'))
			return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
		if (
			activityLower.includes('registered') ||
			activityLower.includes('created')
		)
			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
		if (activityLower.includes('verified'))
			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
		if (activityLower.includes('reset'))
			return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
		if (activityLower.includes('logged out'))
			return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100';
		return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
	};

	const getRoleColor = (role: string) => {
		switch (role) {
			case 'ADMIN':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
			case 'DEVELOPER':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
			case 'MODERATOR':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
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
						<h3 className="text-lg font-semibold">
							Error Loading Activity Logs
						</h3>
						<p className="text-sm text-muted-foreground text-center">
							Failed to load activity logs. Please try again.
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
					<h1 className="text-3xl font-bold tracking-tight">Activity Logs</h1>
					<p className="text-muted-foreground">
						Monitor system activities and user actions
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

			{/* Filters */}
			<Card>
				<CardHeader className="px-3 sm:px-6">
					<CardTitle className="flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</CardTitle>
				</CardHeader>
				<CardContent className="px-3 sm:px-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="relative">
							<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search activities, users..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-10"
							/>
						</div>
						<Select value={activityFilter} onValueChange={setActivityFilter}>
							<SelectTrigger>
								<SelectValue placeholder="All activities" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All activities</SelectItem>
								<SelectItem value="logged in">Login</SelectItem>
								<SelectItem value="registered">Registration</SelectItem>
								<SelectItem value="updated">Updates</SelectItem>
								<SelectItem value="deleted">Deletions</SelectItem>
								<SelectItem value="verified">Email Verification</SelectItem>
								<SelectItem value="reset">Password Reset</SelectItem>
								<SelectItem value="logged out">Logout</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Activity Logs */}
			<Card>
				<CardHeader className="px-3 sm:px-6">
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						Recent Activities
					</CardTitle>
					<p className="text-sm text-muted-foreground">
						Showing {logsData?.activities?.length || 0} of{' '}
						{logsData?.pagination.total || 0} activities
					</p>
				</CardHeader>
				<CardContent className="px-3 sm:px-6">
					{isLoading ? (
						<div className="flex justify-center p-8">
							<Loader2 className="h-8 w-8 animate-spin" />
						</div>
					) : (
						<div className="space-y-4 w-full overflow-x-hidden">
							{logsData?.activities?.map((log) => {
								const timeInfo = formatDate(log.createdAt);
								return (
									<div
										key={log.id}
										className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
									>
										{/* Avatar */}
										<div className="flex-shrink-0 ">
											<Avatar className="h-12 w-12">
												<AvatarImage src={log.user?.profilePicture} />
												<AvatarFallback>
													{log.user?.name
														?.split(' ')
														.map((n) => n[0])
														.join('')
														.toUpperCase() || 'U'}
												</AvatarFallback>
											</Avatar>
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0 space-y-3">
											{/* Activity Header */}
											<div className="flex items-center gap-2 flex-wrap">
												{getActivityIcon(log.activity)}
												<span className="font-semibold text-sm sm:text-base">
													{log.activity}
												</span>
												<Badge className={getActivityColor(log.activity)}>
													{log.activity.split(' ')[0]}
												</Badge>
											</div>

											{/* User Info */}
											<div className="flex items-center gap-2 text-sm">
												<User className="h-4 w-4 text-muted-foreground" />
												<span className="font-medium">
													{log.user?.name || 'Unknown User'}
												</span>
												<Badge
													className={getRoleColor(log.user?.role || 'CLIENT')}
													variant="outline"
												>
													{log.user?.role || 'CLIENT'}
												</Badge>
											</div>

											{/* Email */}
											<div className="flex items-center gap-2 text-sm">
												<Mail className="h-4 w-4 text-muted-foreground" />
												<span className="text-muted-foreground truncate max-w-[200px] sm:max-w-none">
													{log.user?.email}
												</span>
											</div>

											{/* Details */}
											{log.details && (
												<div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
													<Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
													<span>{log.details}</span>
												</div>
											)}

											{/* IP Address */}
											{log.ipAddress && (
												<div className="flex items-center gap-2 text-sm">
													<Network className="h-4 w-4 text-muted-foreground" />
													<span className="text-muted-foreground">
														IP: {log.ipAddress}
													</span>
												</div>
											)}

											{/* Metadata */}
											<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
												<div className="flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													<span>{timeInfo.date}</span>
												</div>
												<div className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													<span>{timeInfo.time}</span>
												</div>
												<span className="font-medium">{timeInfo.relative}</span>
											</div>
										</div>
									</div>
								);
							})}

							{logsData?.activities?.length === 0 && (
								<div className="text-center py-8">
									<Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
									<h3 className="text-lg font-medium mb-2">
										No activities found
									</h3>
									<p className="text-muted-foreground mb-4">
										{search || activityFilter !== 'all'
											? 'Try adjusting your filters'
											: 'No activity logs available'}
									</p>
									{process.env.NODE_ENV === 'development' && (
										<div className="text-xs text-muted-foreground">
											<p>Debug Info:</p>
											<p>Search: "{search}"</p>
											<p>Activity Filter: "{activityFilter}"</p>
											<p>Total Activities: {logsData?.pagination.total || 0}</p>
										</div>
									)}
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Pagination */}
			{logsData?.pagination && logsData.pagination.pages > 1 && (
				<Card>
					<CardContent className="flex items-center justify-between p-4">
						<div className="text-sm text-muted-foreground">
							Showing {(page - 1) * limit + 1} to{' '}
							{Math.min(page * limit, logsData.pagination.total)} of{' '}
							{logsData.pagination.total} activities
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page - 1)}
								disabled={page === 1}
							>
								Previous
							</Button>
							<span className="text-sm">
								Page {page} of {logsData.pagination.pages}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => setPage(page + 1)}
								disabled={page === logsData.pagination.pages}
							>
								Next
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};
