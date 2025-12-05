'use client';

import { useEffect, useState } from 'react';
import { CobwebIcon } from '@/components/ui/Icons';

/**
 * Footer component with last update timestamp and system status
 */
export function Footer() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set initial time on client mount to avoid hydration mismatch
    setMounted(true);
    setLastUpdate(new Date());

    // Update timestamp every minute
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <footer className="bg-bg-dark border-t-4 border-ghost-green shadow-glow-green mt-auto">
      <div className="px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Last update */}
          <div className="flex items-center gap-2">
            <span className="text-ghost-green text-sm">⏰</span>
            <div className="font-vt323 text-sm">
              <span className="text-text-secondary">Last Update: </span>
              <span className="text-bone-white">
                {mounted && lastUpdate ? `${formatDate(lastUpdate)} ${formatTime(lastUpdate)}` : '--:--:--'}
              </span>
            </div>
          </div>

          {/* Center: System status */}
          <div className="flex items-center gap-2 px-3 py-1 border-2 border-toxic-purple rounded pixel-corners">
            <div className="w-2 h-2 bg-ghost-green rounded-full animate-pulse shadow-glow-green" />
            <span className="font-vt323 text-sm text-bone-white">
              System Operational
            </span>
          </div>

          {/* Right: Copyright */}
          <div className="flex items-center gap-2">
            <CobwebIcon size="sm" />
            <span className="font-vt323 text-xs text-text-secondary">
              © 2024 Haunted Greenhouse
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
