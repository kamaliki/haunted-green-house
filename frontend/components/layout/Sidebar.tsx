'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GhostIcon, 
  SkullIcon, 
  BatIcon, 
  SpiderIcon, 
  PumpkinIcon,
  CobwebIcon,
  EyeIcon 
} from '@/components/ui/Icons';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <span className="text-xl">📊</span>,
  },
  {
    href: '/environment',
    label: 'Environment',
    icon: <span className="text-xl">🌡️</span>,
  },
  {
    href: '/irrigation',
    label: 'Irrigation',
    icon: <span className="text-xl">💧</span>,
  },
  {
    href: '/alerts',
    label: 'Alerts',
    icon: <BatIcon size="md" />,
  },
  {
    href: '/security',
    label: 'Security',
    icon: <SkullIcon size="md" />,
  },
];

/**
 * Sidebar navigation with pixel art icons
 * Responsive: collapsible on mobile, always visible on desktop
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 sm:w-72 md:w-80 lg:w-64 bg-bg-dark border-r-4 border-ghost-green shadow-glow-green z-50 lg:sticky lg:top-0 overflow-y-auto lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b-2 border-ghost-green relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PumpkinIcon size="lg" animate />
              <div>
                <h2 className="font-press-start text-xs text-ghost-green">
                  MENU
                </h2>
                <p className="font-vt323 text-xs text-text-secondary mt-1">
                  Navigate the haunted halls
                </p>
              </div>
            </div>
            
            {/* Close button (mobile only) */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-ghost-green hover:text-blood-red transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Decorative cobweb */}
          <div className="absolute top-2 right-2">
            <CobwebIcon size="sm" />
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  // Only close sidebar on mobile (when it's in overlay mode)
                  if (onClose) {
                    onClose();
                  }
                }}
                className={`
                  group relative flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-200 font-vt323 text-lg touch-manipulation
                  active:scale-95 cursor-pointer
                  ${
                    active
                      ? 'bg-gradient-to-r from-toxic-purple/30 to-ghost-green/20 border-2 border-ghost-green text-ghost-green shadow-glow-green'
                      : 'text-bone-white hover:bg-bg-medium hover:text-ghost-green border-2 border-transparent'
                  }
                `}
              >
                {/* Icon */}
                <span className={`
                  transition-transform duration-200
                  ${active ? 'scale-110' : 'group-hover:scale-110'}
                `}>
                  {item.icon}
                </span>

                {/* Label */}
                <span className="flex-1">{item.label}</span>

                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 w-2 h-2 bg-ghost-green rounded-full shadow-glow-green"
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}

                {/* Hover glow effect */}
                {!active && (
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="absolute inset-0 rounded-lg shadow-glow-green" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Decorative footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-2 border-ghost-green bg-bg-darkest">
          <div className="flex justify-center gap-4 text-2xl opacity-50">
            <SpiderIcon size="sm" animate />
            <BatIcon size="sm" animate />
            <SkullIcon size="sm" animate />
          </div>
          <p className="text-center text-xs font-vt323 text-text-secondary mt-2">
            v1.0.0 - Spooky Edition
          </p>
        </div>
      </aside>
    </>
  );
}
