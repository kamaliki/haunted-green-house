'use client';

import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';
import { NetworkErrorBanner } from '@/components/ui/ErrorDisplay';
import { useToast } from '@/components/ui/Toast';
import { useEffect, useRef } from 'react';

/**
 * Network Status Provider
 * Monitors network connectivity and displays notifications
 */
export function NetworkStatusProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, wasOffline } = useNetworkStatus();
  const toast = useToast();
  const hasShownOfflineToast = useRef(false);
  const hasShownOnlineToast = useRef(false);

  useEffect(() => {
    if (!isOnline && !hasShownOfflineToast.current) {
      toast.error(
        'Connection Lost',
        'You are currently offline. Some features may not work.',
        0 // Don't auto-dismiss
      );
      hasShownOfflineToast.current = true;
      hasShownOnlineToast.current = false;
    }

    if (isOnline && wasOffline && !hasShownOnlineToast.current) {
      toast.success(
        'Connection Restored',
        'You are back online!',
        3000
      );
      hasShownOnlineToast.current = true;
      hasShownOfflineToast.current = false;
    }
  }, [isOnline, wasOffline, toast]);

  return (
    <>
      <NetworkErrorBanner isOnline={isOnline} />
      {children}
    </>
  );
}
