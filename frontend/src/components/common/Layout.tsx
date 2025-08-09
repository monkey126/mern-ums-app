import { useAuth } from "@/hooks/useAuth";
import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

/**
 * Layout Component
 * Main application layout that adapts based on authentication state
 *
 * Features:
 * - Conditional layout based on authentication
 * - Responsive sidebar (hidden on mobile)
 * - Navigation bar for authenticated users
 * - Main content area with proper spacing
 */
export const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Simple layout for unauthenticated users (login, register, etc.)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  // Full layout with navigation for authenticated users
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
