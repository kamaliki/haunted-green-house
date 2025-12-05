'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/lib/hooks';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-bg-darkest to-bg-dark relative overflow-hidden">
      {/* Fog overlay */}
      <div className="absolute inset-0 bg-fog animate-fog pointer-events-none" />
      
      {/* Floating ghosts decoration */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">
        👻
      </div>
      <div className="absolute bottom-20 right-20 text-6xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>
        👻
      </div>
      <div className="absolute top-1/3 right-10 text-4xl opacity-15 animate-float" style={{ animationDelay: '2s' }}>
        💀
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="p-8">
          {/* Spooky header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-ghost-green mb-2 font-creepster">
              👻 HAUNTED GREENHOUSE 👻
            </h1>
            <p className="text-text-secondary text-sm font-retro">
              Enter if you dare...
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-primary mb-2 font-retro">
                USERNAME
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2 font-retro">
                PASSWORD
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-blood-red/20 border-2 border-blood-red text-blood-red px-4 py-3 rounded relative">
                <span className="block sm:inline font-retro text-sm">⚠️ {error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">👻</span>
                  ENTERING...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  💀 ENTER THE GREENHOUSE 💀
                </span>
              )}
            </Button>
          </form>

          {/* Registration link */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary text-xs font-retro mb-2">
              🕸️ New to the haunted realm? 🕸️
            </p>
            <a 
              href="/register" 
              className="text-ghost-green hover:text-slime-green transition-colors duration-200 font-retro text-sm underline"
            >
              👻 Create Spectral Account
            </a>
          </div>

          {/* Decorative elements */}
          <div className="mt-4 text-center">
            <p className="text-text-secondary text-xs font-retro">
              🕸️ Protected by spectral security 🕸️
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
