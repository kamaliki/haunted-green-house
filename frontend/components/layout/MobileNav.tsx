'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SkullIcon, BatIcon } from '@/components/ui/Icons';

/**
 * Mobile bottom navigation bar
 * Provides quick access to main sections on mobile devices
 */
export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: <span className="text-lg">📊</span>,
    },
    {
      href: '/irrigation',
      label: 'Irrigation',
      icon: <span className="text-lg">💧</span>,
    },
    {
      href: '/alerts',
      label: 'Alerts',
      icon: <BatIcon size="sm" />,
    },
    {
      href: '/security',
      label: 'Security',
      icon: <SkullIcon size="sm" />,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-dark border-t-4 border-ghost-green shadow-glow-green z-40 lg:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`
                relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                transition-all duration-200 touch-manipulation no-select
                ${active ? 'text-ghost-green' : 'text-text-secondary hover:text-ghost-green'}
              `}
            >
              {/* Icon */}
              <span
                className={`
                transition-transform duration-200
                ${active ? 'scale-110' : ''}
              `}
              >
                {item.icon}
              </span>

              {/* Label */}
              <span className="text-xs font-vt323">{item.label}</span>

              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-ghost-green rounded-full shadow-glow-green"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
