'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import React, { useState } from 'react';

export const ModeratorFeedback: React.FC = () => {
	const [comments, setComments] = useState([
		{ id: 1, client: 'John Doe', text: 'Great service!', status: 'Approved' },
		{
			id: 2,
			client: 'Jane Smith',
			text: 'The delivery was late.',
			status: 'Pending',
		},
		{
			id: 3,
			client: 'Alex Johnson',
			text: 'Very satisfied with support.',
			status: 'Approved',
		},
		{
			id: 4,
			client: 'Michael Brown',
			text: 'Average experience.',
			status: 'Rejected',
		},
		{
			id: 5,
			client: 'Emily Davis',
			text: 'Loved the new design!',
			status: 'Approved',
		},
	]);

	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<
		'all' | 'Approved' | 'Pending' | 'Rejected'
	>('all');

	const updateStatus = (id: number, newStatus: string) => {
		setComments((prev) =>
			prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
		);
	};

	const filteredComments = comments.filter((c) => {
		const matchesSearch =
			c.client.toLowerCase().includes(search.toLowerCase()) ||
			c.text.toLowerCase().includes(search.toLowerCase());
		const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Moderator</h1>
				<p className="text-muted-foreground">
					Manage client comments and feedback
				</p>
			</div>

			{/* Filters */}
			<Card>
				<CardHeader className="px-3 sm:px-6">
					<CardTitle>Filters</CardTitle>
				</CardHeader>
				<CardContent className="px-3 sm:px-6">
					<div className="grid gap-4 md:grid-cols-2">
						<div>
							<Input
								placeholder="Search comments..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full"
							/>
						</div>
						<Select
							value={statusFilter}
							onValueChange={(v: 'all' | 'Approved' | 'Pending' | 'Rejected') =>
								setStatusFilter(v)
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="All statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All statuses</SelectItem>
								<SelectItem value="Approved">Approved</SelectItem>
								<SelectItem value="Pending">Pending</SelectItem>
								<SelectItem value="Rejected">Rejected</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Table */}
			<Card>
				<CardHeader className="px-3 sm:px-6">
					<CardTitle>Comments ({filteredComments.length})</CardTitle>
				</CardHeader>
				<CardContent className="px-3 sm:px-6">
					<div className="w-full overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Client</TableHead>
									<TableHead>Comment</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredComments.length > 0 ? (
									filteredComments.map((c) => (
										<TableRow key={c.id}>
											<TableCell>{c.client}</TableCell>
											<TableCell>{c.text}</TableCell>
											<TableCell>
												<Badge
													className={
														c.status === 'Approved'
															? 'bg-green-100 text-green-800'
															: c.status === 'Pending'
															? 'bg-yellow-100 text-yellow-800'
															: 'bg-red-100 text-red-800'
													}
												>
													{c.status}
												</Badge>
											</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="outline" size="sm">
															Change Status
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														<DropdownMenuItem
															onClick={() => updateStatus(c.id, 'Approved')}
														>
															Approved
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => updateStatus(c.id, 'Pending')}
														>
															Pending
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => updateStatus(c.id, 'Rejected')}
														>
															Rejected
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={4} className="text-center py-8">
											<div className="text-muted-foreground">
												No comments found
											</div>
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
