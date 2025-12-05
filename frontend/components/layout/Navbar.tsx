'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';
import { GhostIcon, SkullIcon } from '@/components/ui/Icons';
import { useAlertStore } from '@/lib/store/alertStore';

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NavbarProps {
  onMenuToggle?: () => void;
}

/**
 * Top navigation bar with user info, notifications, and connection status
 */
export function Navbar({ onMenuToggle }: NavbarProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount, getSortedAlerts } = useAlertStore();
  
  // Get recent unacknowledged alerts (max 5)
  const recentAlerts = getSortedAlerts()
    .filter(alert => !alert.acknowledged)
    .slice(0, 5);

  const severityIcons = {
    critical: '💀',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <nav className="bg-bg-dark border-b-4 border-ghost-green shadow-glow-green relative z-40">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Menu toggle and title */}
          <div className="flex items-center gap-4">
            {/* Mobile menu toggle */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-ghost-green hover:text-slime-green transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Title */}
            <div className="flex items-center gap-2">
              <GhostIcon size="md" animate />
              <h1 className="text-xl md:text-2xl font-creepster text-ghost-green text-glow">
                Haunted Greenhouse
              </h1>
            </div>
          </div>

          {/* Right: Connection status, notifications, user info */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Connection Status */}
            <div className="hidden md:block">
              <ConnectionStatus />
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-ghost-green hover:text-slime-green transition-colors hover:scale-110 transform"
                aria-label="Notifications"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                
                {/* Notification badge */}
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-blood-red text-bone-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-glow-red animate-pulse-glow"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>

              {/* Notifications dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-bg-dark border-4 border-toxic-purple rounded-lg shadow-glow-purple overflow-hidden z-50"
                  >
                    <div className="p-4 border-b-2 border-toxic-purple">
                      <h3 className="font-press-start text-xs text-ghost-green">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {recentAlerts.length === 0 ? (
                        <div className="p-8 text-center">
                          <GhostIcon size="lg" />
                          <p className="text-sm text-text-secondary font-vt323 mt-2">
                            No new alerts
                          </p>
                        </div>
                      ) : (
                        recentAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            onClick={() => {
                              setShowNotifications(false);
                              router.push('/alerts');
                            }}
                            className="p-4 border-b border-bg-medium hover:bg-bg-medium transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg">{severityIcons[alert.severity]}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-bone-white font-vt323 truncate">
                                  {alert.title}
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                  {formatTimeAgo(new Date(alert.timestamp))}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t-2 border-toxic-purple text-center">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          router.push('/alerts');
                        }}
                        className="text-xs text-ghost-green hover:text-slime-green font-vt323 transition-colors"
                      >
                        View All Alerts →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Info */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 border-2 border-ghost-green rounded pixel-corners">
              <span className="text-lg">👤</span>
              <span className="text-sm font-vt323 text-bone-white">
                Operator
              </span>
            </div>
          </div>
        </div>

        {/* Mobile connection status */}
        <div className="md:hidden mt-3 pt-3 border-t border-bg-medium">
          <ConnectionStatus />
        </div>
      </div>
    </nav>
  );
}
