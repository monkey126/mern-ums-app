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

export const DeveloperProjects: React.FC = () => {
	const [projects, setProjects] = useState([
		{
			id: 1,
			name: 'World IT Website Redesign',
			status: 'In Progress',
			deadline: '2025-09-15',
		},
		{
			id: 2,
			name: 'Internal HR Portal',
			status: 'Completed',
			deadline: '2025-07-10',
		},
		{
			id: 3,
			name: 'Client CRM System',
			status: 'Pending',
			deadline: '2025-10-01',
		},
		{
			id: 4,
			name: 'API Integration Module',
			status: 'Pending',
			deadline: '2025-11-05',
		},
		{
			id: 5,
			name: 'Mobile App Launch',
			status: 'In Progress',
			deadline: '2025-08-30',
		},
		{
			id: 6,
			name: 'Security Audit',
			status: 'Completed',
			deadline: '2025-06-20',
		},
	]);

	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<
		'all' | 'Pending' | 'In Progress' | 'Completed'
	>('all');

	const updateStatus = (id: number, newStatus: string) => {
		setProjects((prev) =>
			prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
		);
	};

	const filteredProjects = projects.filter((p) => {
		const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
		const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
		return matchesSearch && matchesStatus;
	});

	const getProjectStatusClasses = (status: string): string => {
		switch (status) {
			case 'Completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
			case 'In Progress':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
			case 'Pending':
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold">Developer Projects</h1>
				<p className="text-muted-foreground">
					Track your projects and deadlines
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
								placeholder="Search projects..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="w-full"
							/>
						</div>
						<Select
							value={statusFilter}
							onValueChange={(
								v: 'all' | 'Pending' | 'In Progress' | 'Completed'
							) => setStatusFilter(v)}
						>
							<SelectTrigger>
								<SelectValue placeholder="All statuses" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All statuses</SelectItem>
								<SelectItem value="Pending">Pending</SelectItem>
								<SelectItem value="In Progress">In Progress</SelectItem>
								<SelectItem value="Completed">Completed</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* Projects Table */}
			<Card>
				<CardHeader className="px-3 sm:px-6">
					<CardTitle>Projects ({filteredProjects.length})</CardTitle>
				</CardHeader>
				<CardContent className="px-3 sm:px-6">
					<div className="w-full overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Project Name</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Deadline</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredProjects.length > 0 ? (
									filteredProjects.map((p) => (
										<TableRow key={p.id}>
											<TableCell>{p.name}</TableCell>
											<TableCell>
												<Badge className={getProjectStatusClasses(p.status)}>
													{p.status}
												</Badge>
											</TableCell>
											<TableCell>{p.deadline}</TableCell>
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="outline" size="sm">
															Change Status
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent>
														<DropdownMenuItem
															onClick={() => updateStatus(p.id, 'Pending')}
														>
															Pending
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => updateStatus(p.id, 'In Progress')}
														>
															In Progress
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => updateStatus(p.id, 'Completed')}
														>
															Completed
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
												No projects found
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
