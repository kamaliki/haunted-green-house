'use client';

import { useAuth } from '@/lib/hooks';

export function UserInfo() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-text-primary font-retro">
      <span className="text-ghost-green">👤</span>
      <span className="text-sm">{user.name}</span>
    </div>
  );
}
