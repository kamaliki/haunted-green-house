'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ZoneManager } from './ZoneManager';
import type { GreenhouseData, ZoneInput } from '@/app/(auth)/register/page';

interface GreenhouseSetupFormProps {
  onSubmit: (data: GreenhouseData) => Promise<void>;
  onSkip: () => void;
  isLoading: boolean;
  error: string | null;
}

export const GreenhouseSetupForm: React.FC<GreenhouseSetupFormProps> = ({
  onSubmit,
  onSkip,
  isLoading,
  error,
}) => {
  const [formData, setFormData] = useState<GreenhouseData>({
    name: '',
    location: '',
    description: '',
    zones: [],
  });

  const [validationErrors, setValidationErrors] = useState<Partial<GreenhouseData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof GreenhouseData, boolean>>>({});

  // Real-time validation
  const validateField = (field: keyof GreenhouseData, value: string | ZoneInput[]): string | undefined => {
    switch (field) {
      case 'name':
        if (!value || (typeof value === 'string' && !value.trim())) return 'Greenhouse name is required';
        if (typeof value === 'string' && value.length > 100) return 'Greenhouse name must be less than 100 characters';
        break;
      case 'location':
        if (!value || (typeof value === 'string' && !value.trim())) return 'Location is required';
        if (typeof value === 'string' && value.length > 200) return 'Location must be less than 200 characters';
        break;
      case 'description':
        if (typeof value === 'string' && value.length > 500) return 'Description must be less than 500 characters';
        break;
    }
    return undefined;
  };

  const handleInputChange = (field: keyof GreenhouseData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation - validate as user types
    if (touched[field]) {
      const error = validateField(field, value);
      setValidationErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleInputBlur = (field: keyof GreenhouseData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldValue = formData[field];
    const error = validateField(field, fieldValue || '');
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleZonesChange = (zones: ZoneInput[]) => {
    setFormData(prev => ({ ...prev, zones }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<GreenhouseData> = {};
    let isValid = true;

    // Validate required fields
    const nameError = validateField('name', formData.name);
    const locationError = validateField('location', formData.location);
    const descriptionError = validateField('description', formData.description || '');

    if (nameError) {
      errors.name = nameError;
      isValid = false;
    }
    if (locationError) {
      errors.location = locationError;
      isValid = false;
    }
    if (descriptionError) {
      errors.description = descriptionError;
      isValid = false;
    }

    setValidationErrors(errors);
    setTouched({
      name: true,
      location: true,
      description: true,
    });

    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submissionData: GreenhouseData = {
      name: formData.name.trim(),
      location: formData.location.trim(),
      description: formData.description?.trim() || undefined,
      zones: formData.zones,
    };

    await onSubmit(submissionData);
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <div className="relative">
      <Card className="p-8 relative overflow-hidden fog-overlay">
        {/* Spooky header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-toxic-purple mb-2 font-creepster text-glow-intense">
            🏚️ CONFIGURE YOUR HAUNTED GREENHOUSE 🏚️
          </h1>
          <p className="text-text-secondary text-sm font-retro">
            Set up your spectral growing environment and define your eerie zones...
          </p>
        </div>

        {/* Greenhouse setup form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="GREENHOUSE NAME"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={() => handleInputBlur('name')}
                placeholder="Enter your greenhouse name"
                required
                disabled={isLoading}
                error={touched.name ? validationErrors.name : undefined}
                icon="🏚️"
              />
            </div>

            <div>
              <Input
                label="LOCATION"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                onBlur={() => handleInputBlur('location')}
                placeholder="Enter greenhouse location"
                required
                disabled={isLoading}
                error={touched.location ? validationErrors.location : undefined}
                icon="📍"
              />
            </div>
          </div>

          <div>
            <Textarea
              label="DESCRIPTION (OPTIONAL)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onBlur={() => handleInputBlur('description')}
              placeholder="Describe your haunted greenhouse setup..."
              disabled={isLoading}
              error={touched.description ? validationErrors.description : undefined}
              rows={3}
            />
            <p className="mt-1 text-xs text-text-secondary font-retro">
              🔮 Tell us about your spectral growing environment
            </p>
          </div>

          {/* Zone Management Section */}
          <div className="space-y-4">
            <div className="border-t-2 border-toxic-purple/30 pt-6">
              <h3 className="text-xl font-bold text-toxic-purple mb-4 font-retro text-glow">
                🌱 SPECTRAL ZONES CONFIGURATION
              </h3>
              <p className="text-text-secondary text-sm font-retro mb-4">
                Define different areas within your greenhouse for independent monitoring and control.
              </p>
              
              <ZoneManager
                zones={formData.zones}
                onChange={handleZonesChange}
                disabled={isLoading}
              />
            </div>
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

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button
              type="submit"
              disabled={isLoading || Object.keys(validationErrors).some(key => validationErrors[key as keyof GreenhouseData])}
              className="flex-1 animate-pulse-glow"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-2">👻</span>
                  MATERIALIZING GREENHOUSE...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  🏚️ MANIFEST SPECTRAL GREENHOUSE 🏚️
                </span>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              disabled={isLoading}
              className="flex-1"
            >
              <span className="flex items-center justify-center">
                👻 SKIP FOR NOW - ENTER THE VOID
              </span>
            </Button>
          </div>
        </form>

        {/* Decorative elements */}
        <div className="mt-6 text-center">
          <p className="text-text-secondary text-xs font-retro">
            🕸️ You can always configure your greenhouse later from the dashboard 🕸️
          </p>
        </div>

        {/* Floating decorations inside card */}
        <div className="absolute top-4 left-4 text-2xl opacity-20 animate-float pointer-events-none">
          🕷️
        </div>
        <div className="absolute bottom-4 right-4 text-2xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }}>
          🦇
        </div>
        <div className="absolute top-1/2 right-4 text-xl opacity-15 animate-float pointer-events-none" style={{ animationDelay: '2.5s' }}>
          🌱
        </div>
        <div className="absolute bottom-1/3 left-4 text-lg opacity-10 animate-float pointer-events-none" style={{ animationDelay: '3s' }}>
          🕸️
        </div>
        <div className="absolute top-1/4 left-1/4 text-sm opacity-10 animate-float pointer-events-none" style={{ animationDelay: '4s' }}>
          🏚️
        </div>
      </Card>

      {/* External floating decorations */}
      <div className="absolute -top-8 -left-8 text-4xl opacity-30 animate-float pointer-events-none">
        🌿
      </div>
      <div className="absolute -bottom-8 -right-8 text-4xl opacity-30 animate-float pointer-events-none" style={{ animationDelay: '2s' }}>
        🏚️
      </div>
      <div className="absolute top-1/4 -right-12 text-3xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '1s' }}>
        🌱
      </div>
      <div className="absolute bottom-1/4 -left-12 text-3xl opacity-20 animate-float pointer-events-none" style={{ animationDelay: '3s' }}>
        🕸️
      </div>
    </div>
  );
};