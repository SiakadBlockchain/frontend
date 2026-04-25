'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();

  // Split the path and create breadcrumb items
  const segments = pathname
    .split('/')
    .filter((seg) => seg)
    .slice(1); // Skip the first segment (usually 'dashboard')

  if (segments.length === 0) {
    return null;
  }

  const items = [
    { label: 'Dashboard', href: '/dashboard' },
    ...segments.map((seg, idx) => ({
      label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
      href: `/dashboard/${segments.slice(0, idx + 1).join('/')}`,
    })),
  ];

  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/30">
      {items.map((item, idx) => (
        <div key={item.href} className="flex items-center gap-2">
          {idx > 0 && <ChevronRight size={16} className="text-muted-foreground" />}
          {idx === items.length - 1 ? (
            <span className="text-sm font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-all duration-200 ease-out"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
