'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { SIDEBAR_ITEMS } from '@/lib/constants';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, role, loading } = useAuth();

  if (loading || !isAuthenticated || !role || !user) {
    return null;
  }

  const items = SIDEBAR_ITEMS[role];

  const handleLogout = async () => {
    logout();
    router.replace('/auth');
  };

  return (
    <aside className="w-64 bg-background border-r border-border flex flex-col h-screen">
      {/* Logo/Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">SiakadChain</h1>
        <p className="text-xs text-muted-foreground mt-1">Blockchain Academic System</p>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-border bg-muted/30">
        <p className="text-sm font-semibold text-foreground">{user.name}</p>
        <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
        {user.walletAddress && (
          <p className="text-xs text-muted-foreground mt-2 truncate">
            Wallet: {user.walletAddress.slice(0, 8)}...
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-6">
        <ul className="space-y-2">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ease-out ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-6 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex cursor-pointer items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-foreground border border-border hover:bg-muted/50 transition-all duration-200 ease-out"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
