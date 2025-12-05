'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import type { AccountData } from '@/app/(auth)/register/page';

interface AccountCreationFormProps {
  onSubmit: (data: AccountData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const AccountCreationForm: React.FC<AccountCreationFormProps> = ({
  onSubmit,
  isLoading,
  error,
}) => {
  const [formData, setFormData] = useState<AccountData>({
    username: '',
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<Partial<AccountData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AccountData, boolean>>>({});

  // Real-time validation
  const validateField = (field: keyof AccountData, value: string): string | undefined => {
    switch (field) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (value.length > 50) return 'Username must be less than 50 characters';
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, hyphens, and underscores';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (value.length > 100) return 'Password must be less than 100 characters';
        break;
    }
    return undefined;
  };

  const handleInputChange = (field: keyof AccountData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation - validate as user types
    if (touched[field]) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleInputBlur = (field: keyof AccountData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<AccountData> = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof AccountData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    setTouched({
      username: true,
      email: true,
      password: true,
    });

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="relative">
      <Card className="p-8 relative overflow-hidden fog-overlay">
        {/* Spooky header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-ghost-green mb-2 font-creepster text-glow-intense">
            👻 JOIN THE HAUNTED GREENHOUSE 👻
          </h1>
          <p className="text-text-secondary text-sm font-retro">
            Create your spectral account to begin your eerie journey...
          </p>
        </div>

        {/* Account creation form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="USERNAME"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              onBlur={() => handleInputBlur('username')}
              placeholder="Enter your ghostly username"
              required
              disabled={isLoading}
              error={touched.username ? validationErrors.username : undefined}
              icon="👤"
            />
          </div>

          <div>
            <Input
              label="EMAIL"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleInputBlur('email')}
              placeholder="Enter your ethereal email"
              required
              disabled={isLoading}
              error={touched.email ? validationErrors.email : undefined}
              icon="📧"
            />
          </div>

          <div>
            <Input
              label="PASSWORD"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleInputBlur('password')}
              placeholder="Enter your secret incantation"
              required
              disabled={isLoading}
              error={touched.password ? validationErrors.password : undefined}
              icon="🔒"
            />
            <p className="mt-1 text-xs text-text-secondary font-retro">
              🔮 Must be at least 8 characters long
            </p>
          </div>

          {/* Tombstone-shaped error alert */}
          {error && (
            <div className="relative">
              <div className="bg-blood-red/20 border-4 border-blood-red text-blood-red px-6 py-4 relative animate-flicker pixel-corners">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-blood-red text-2xl">
                  ⚰️
                </div>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <span className="text-lg">💀</span>
                  <span className="block sm:inline font-retro text-sm font-bold text-center">
                    {error}
                  </span>
                  <span className="text-lg">💀</span>
                </div>
                {/* Cobweb decorations */}
                <div className="absolute top-0 left-0 text-blood-red/50 text-xs">🕸️</div>
                <div className="absolute top-0 right-0 text-blood-red/50 text-xs">🕸️</div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || Object.keys(validationErrors).some(key => validationErrors[key as keyof AccountData])}
            className="w-full animate-pulse-glow"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">👻</span>
                SUMMONING ACCOUNT...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                💀 CREATE SPECTRAL ACCOUNT 💀
              </span>
            )}
          </Button>
        </form>

        {/* Decorative elements */}
        <div className="mt-6 text-center">
          <p className="text-text-secondary text-xs font-retro mb-2">
            🕸️ Already have an account? 🕸️
          </p>
          <a 
            href="/login" 
            className="text-ghost-green hover:text-slime-green transition-colors duration-200 font-retro text-sm underline hover:text-glow"
          >
            👻 Enter the greenhouse instead
          </a>
        </div>

        {/* Floating decorations inside card */}
        <div className="absolute top-4 left-4 text-2xl opacity-20 animate-float pointer-events-none">
          🕷️
        </div>
        <div className="absolute bottom-4 right-4 text-2xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}>
          🦇
        </div>
        <div className="absolute top-1/2 right-4 text-xl opacity-15 animate-float pointer-events-none" style={{ animationDelay: '2.5s' }}>
          💀
        </div>
        <div className="absolute bottom-1/3 left-4 text-lg opacity-10 animate-float pointer-events-none" style={{ animationDelay: '3s' }}>
          🕸️
        </div>
      </Card>

      {/* External floating ghosts */}
      <div className="absolute -top-8 -left-8 text-4xl opacity-30 animate-float pointer-events-none">
        👻
      </div>
      <div className="absolute -bottom-8 -right-8 text-4xl opacity-30 animate-float pointer-events-none" style={{ animationDelay: '2s' }}>
        👻
      </div>
      <div className="absolute top-1/4 -right-12 text-3xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '1s' }}>
        🎃
      </div>
    </div>
  );
};