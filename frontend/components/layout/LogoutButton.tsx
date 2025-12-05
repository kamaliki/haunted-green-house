'use client';

import { useAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/Button';

export function LogoutButton() {
  const { logout, isLoading } = useAuth();

  return (
    <Button
      onClick={logout}
      disabled={isLoading}
      variant="secondary"
      size="sm"
    >
      {isLoading ? '...' : '🚪 Logout'}
    </Button>
  );
}
