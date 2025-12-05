'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  GhostIcon, 
  SkullIcon, 
  BatIcon, 
  EyeIcon 
} from '@/components/ui/Icons';

/**
 * Mobile bottom navigation bar
 * Provides quick access to main sections on mobile devices
 */
export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      href: '/dashboard',
      label: 'Zones',
      icon: <GhostIcon size="sm" />,
    },
    {
      href: '/dashboard/security',
      label: 'Security',
      icon: <SkullIcon size="sm" />,
    },
    {
      href: '/dashboard/alerts',
      label: 'Alerts',
      icon: <BatIcon size="sm" />,
    },
    {
      href: '/dashboard/analytics',
      label: 'Analytics',
      icon: <EyeIcon size="sm" />,
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
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`
                relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                transition-all duration-200 touch-manipulation
                ${
                  active
                    ? 'text-ghost-green'
                    : 'text-text-secondary'
                }
              `}
            >
              {/* Icon */}
              <span className={`
                transition-transform duration-200
                ${active ? 'scale-110' : ''}
              `}>
                {item.icon}
              </span>

              {/* Label */}
              <span className="text-xs font-vt323">
                {item.label}
              </span>

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
            </button>
          );
        })}
      </div>
    </nav>
  );
}
