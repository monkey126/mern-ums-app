import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Activity,
  BarChart3,
  Code,
  EyeOff,
  FileText,
  Home,
  Settings,
  ShieldCheck,
  Terminal,
  Users,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: string[];
  section?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    section: "main",
  },
  {
    title: "Profile",
    href: "/profile",
    icon: Users,
    section: "main",
  },
  {
    title: "My Activity",
    href: "/my-activity",
    icon: Activity,
    allowedRoles: ["ADMIN", "DEVELOPER", "MODERATOR"],
    section: "main",
  },
  // Admin Section
  {
    title: "Admin Dashboard",
    href: "/admin",
    icon: BarChart3,
    allowedRoles: ["ADMIN"],
    section: "admin",
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users,
    allowedRoles: ["ADMIN"],
    section: "admin",
  },
  {
    title: "Activity Logs",
    href: "/admin/activity-logs",
    icon: FileText,
    allowedRoles: ["ADMIN", "DEVELOPER", "MODERATOR"],
    section: "admin",
  },
  // Developer and Moderator Section
  {
    title: "Developer Dashboard",
    href: "/developer",
    icon: Code,
    allowedRoles: ["DEVELOPER"],
    section: "developer",
  },
  {
    title: "Moderator Dashboard",
    href: "/moderator",
    icon: ShieldCheck,
    allowedRoles: ["MODERATOR"],
    section: "moderator",
  },

  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    section: "main",
  },
];

export const Sidebar: React.FC<{ onNavigate?: () => void }> = ({
  onNavigate,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  const filteredItems = sidebarItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user?.role || "")
  );

  const mainItems = filteredItems.filter((item) => item.section === "main");
  const adminItems = filteredItems.filter((item) => item.section === "admin");

  // Developer and Moderator Section
  const developerItems = filteredItems.filter(
    (item) => item.section === "developer"
  );
  const moderatorItems = filteredItems.filter(
    (item) => item.section === "moderator"
  );

  return (
    <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {/* Main Navigation */}
            {mainItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}

            {/* Admin Section */}
            {adminItems.length > 0 && (
              <>
                <div className="mt-6 mb-2 px-3">
                  <div className="flex items-center space-x-2">
                    <Logo size="xs" className="text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Administration
                    </span>
                  </div>
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </>
            )}

            {/* Developer and Moderator Section */}
            {/* Developer Section */}
            {developerItems.length > 0 && (
              <>
                <div className="mt-6 mb-2 px-3">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Developer
                    </span>
                  </div>
                </div>
                {developerItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </>
            )}

            {/* Moderator Section */}
            {moderatorItems.length > 0 && (
              <>
                <div className="mt-6 mb-2 px-3">
                  <div className="flex items-center space-x-2">
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Moderator
                    </span>
                  </div>
                </div>
                {moderatorItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
