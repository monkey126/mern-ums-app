import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import React, { useEffect, useMemo, useState } from 'react';

type AppearanceTheme = 'system' | 'light' | 'dark';

interface UserSettingsState {
	theme: AppearanceTheme;
	compactSidebar: boolean;
	emailNotifications: boolean;
	pushNotifications: boolean;
	weeklySummary: boolean;
	language: string;
}

const SETTINGS_STORAGE_KEY = 'app:user-settings';

function loadStoredSettings(): UserSettingsState | null {
	try {
		const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as UserSettingsState;
	} catch {
		return null;
	}
}

function persistSettings(settings: UserSettingsState): void {
	try {
		localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
	} catch {
		// ignore
	}
}

function applyThemePreference(theme: AppearanceTheme): void {
	const root = document.documentElement;
	const prefersDark =
		window.matchMedia &&
		window.matchMedia('(prefers-color-scheme: dark)').matches;
	const shouldUseDark = theme === 'dark' || (theme === 'system' && prefersDark);
	root.classList.toggle('dark', shouldUseDark);
}

export const SettingsPage: React.FC = () => {
	const defaultSettings: UserSettingsState = useMemo(
		() => ({
			theme: 'system',
			compactSidebar: false,
			emailNotifications: true,
			pushNotifications: false,
			weeklySummary: true,
			language: 'en',
		}),
		[]
	);

	const [settings, setSettings] = useState<UserSettingsState>(() => {
		return loadStoredSettings() ?? defaultSettings;
	});

	useEffect(() => {
		applyThemePreference(settings.theme);
		persistSettings(settings);
	}, [settings]);

	const handleReset = (): void => {
		setSettings(defaultSettings);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Settings</h1>
				<p className="text-muted-foreground">
					Manage your preferences and application behavior.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Appearance</CardTitle>
					<CardDescription>
						Personalize how the application looks on your device.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label>Theme</Label>
							<Select
								value={settings.theme}
								onValueChange={(value: AppearanceTheme) =>
									setSettings((prev) => ({ ...prev, theme: value }))
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select theme" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="system">System</SelectItem>
									<SelectItem value="light">Light</SelectItem>
									<SelectItem value="dark">Dark</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground">
								Choose dark, light, or follow your system setting.
							</p>
						</div>

						<div className="flex items-center justify-between rounded-lg border p-4">
							<div className="space-y-1">
								<Label htmlFor="compactSidebar">Compact sidebar</Label>
								<p className="text-xs text-muted-foreground">
									Use a denser sidebar with smaller paddings.
								</p>
							</div>
							<Switch
								id="compactSidebar"
								checked={settings.compactSidebar}
								onCheckedChange={(checked) =>
									setSettings((prev) => ({
										...prev,
										compactSidebar: Boolean(checked),
									}))
								}
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Notifications</CardTitle>
					<CardDescription>
						Control which notifications you receive.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-1">
							<Label htmlFor="emailNotifications">Email notifications</Label>
							<p className="text-xs text-muted-foreground">
								Receive important updates via email.
							</p>
						</div>
						<Switch
							id="emailNotifications"
							checked={settings.emailNotifications}
							onCheckedChange={(checked) =>
								setSettings((prev) => ({
									...prev,
									emailNotifications: Boolean(checked),
								}))
							}
						/>
					</div>

					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-1">
							<Label htmlFor="pushNotifications">Push notifications</Label>
							<p className="text-xs text-muted-foreground">
								Enable browser/device push notifications.
							</p>
						</div>
						<Switch
							id="pushNotifications"
							checked={settings.pushNotifications}
							onCheckedChange={(checked) =>
								setSettings((prev) => ({
									...prev,
									pushNotifications: Boolean(checked),
								}))
							}
						/>
					</div>

					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-1">
							<Label htmlFor="weeklySummary">Weekly summary</Label>
							<p className="text-xs text-muted-foreground">
								Get a summary of your activities every week.
							</p>
						</div>
						<Switch
							id="weeklySummary"
							checked={settings.weeklySummary}
							onCheckedChange={(checked) =>
								setSettings((prev) => ({
									...prev,
									weeklySummary: Boolean(checked),
								}))
							}
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Localization</CardTitle>
					<CardDescription>Choose your preferred language.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2 max-w-xs">
						<Label>Language</Label>
						<Select
							value={settings.language}
							onValueChange={(value: string) =>
								setSettings((prev) => ({ ...prev, language: value }))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select language" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English</SelectItem>
								<SelectItem value="fr">Français</SelectItem>
								<SelectItem value="es">Español</SelectItem>
								<SelectItem value="de">Deutsch</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<div className="flex items-center gap-3">
				<Button onClick={() => persistSettings(settings)}>Save changes</Button>
				<Button variant="outline" onClick={handleReset}>
					Reset to defaults
				</Button>
			</div>

			<Separator />
			<p className="text-xs text-muted-foreground">
				These preferences are stored in your browser and apply to this device
				only.
			</p>
		</div>
	);
};

export default SettingsPage;
