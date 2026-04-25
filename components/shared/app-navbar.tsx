'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Search, CheckCircle } from 'lucide-react';

export function AppNavbar() {
  const pathname = usePathname();

  // Only show public navbar on public pages
  const isPublicPage = pathname === '/' || pathname === '/search' || pathname === '/verify';

  if (!isPublicPage) {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Shield },
    { label: 'Search', href: '/search', icon: Search }
  ];

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl text-foreground hover:text-accent transition-all duration-200 ease-out">
            SiakadChain
          </Link>

          {/* Nav Items */}
          <div className="flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 ease-out ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <Link
              href="/auth"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-accent transition-all duration-200 ease-out"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
