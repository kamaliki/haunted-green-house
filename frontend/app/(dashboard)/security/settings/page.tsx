'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useOffHoursConfig, useUpdateOffHoursConfig } from '@/lib/hooks';
import { cn } from '@/lib/utils/cn';

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { data: config, isLoading } = useOffHoursConfig();
  const updateConfig = useUpdateOffHoursConfig();

  // Form state
  const [enabled, setEnabled] = useState(false);
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(0);
  const [errors, setErrors] = useState<{ startHour?: string; endHour?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize form with fetched config
  useEffect(() => {
    if (config) {
      setEnabled(config.enabled);
      setStartHour(config.startHour);
      setEndHour(config.endHour);
    }
  }, [config]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { startHour?: string; endHour?: string } = {};

    if (startHour < 0 || startHour > 23) {
      newErrors.startHour = 'Start hour must be between 0 and 23';
    }

    if (endHour < 0 || endHour > 23) {
      newErrors.endHour = 'End hour must be between 0 and 23';
    }

    if (enabled && startHour === endHour) {
      newErrors.startHour = 'Start and end hours cannot be the same';
      newErrors.endHour = 'Start and end hours cannot be the same';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateConfig.mutateAsync({
        enabled,
        startHour,
        endHour,
      });

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update off-hours config:', error);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.push('/security');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-ghost-green font-creepster mb-2">
            ⚙️ Security Settings
          </h1>
          <p className="text-text-secondary font-vt323">
            Configure off-hours monitoring for motion detection
          </p>
        </div>
        <Button variant="ghost" onClick={handleBack}>
          ← Back to Security
        </Button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-slime-green/10 border-4 border-slime-green p-4 rounded pixel-corners animate-fade-in">
          <p className="text-slime-green font-bold font-vt323 text-center">
            ✓ Configuration saved successfully!
          </p>
        </div>
      )}

      {/* Off-Hours Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🌙</span>
            Off-Hours Motion Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div className="bg-bg-medium p-4 rounded border-2 border-toxic-purple">
              <p className="text-text-secondary text-sm">
                When enabled, motion events detected during the configured off-hours period
                will be highlighted with prominent alerts. This helps identify unauthorized
                access during times when the greenhouse should be unoccupied.
              </p>
            </div>

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-bg-dark rounded border-4 border-ghost-green">
              <div>
                <label htmlFor="enabled-toggle" className="text-lg font-bold text-ghost-green font-vt323 block">
                  Enable Off-Hours Monitoring
                </label>
                <p className="text-text-secondary text-sm mt-1">
                  Activate special alerts for motion during off-hours
                </p>
              </div>
              <button
                type="button"
                id="enabled-toggle"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className={cn(
                  'relative inline-flex h-12 w-24 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-ghost-green/50',
                  enabled ? 'bg-slime-green' : 'bg-bg-medium border-4 border-ghost-green'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-8 w-8 transform rounded-full bg-bone-white transition-transform duration-200 border-4 border-ghost-green',
                    enabled ? 'translate-x-12' : 'translate-x-2'
                  )}
                />
              </button>
            </div>

            {/* Time Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Hour */}
              <div>
                <label htmlFor="start-hour" className="block mb-2 text-sm font-bold text-ghost-green font-vt323">
                  Start Hour (0-23)
                </label>
                <input
                  type="number"
                  id="start-hour"
                  min="0"
                  max="23"
                  value={startHour}
                  onChange={(e) => {
                    setStartHour(parseInt(e.target.value) || 0);
                    setErrors({ ...errors, startHour: undefined });
                  }}
                  disabled={!enabled}
                  className={cn(
                    'retro-input w-full',
                    errors.startHour && 'border-blood-red focus:border-blood-red focus:shadow-glow-red',
                    !enabled && 'opacity-50 cursor-not-allowed'
                  )}
                />
                {errors.startHour && (
                  <p className="mt-1 text-sm text-blood-red font-vt323 animate-flicker">
                    ⚠️ {errors.startHour}
                  </p>
                )}
                <p className="mt-1 text-xs text-text-secondary">
                  Off-hours period begins at this hour (24-hour format)
                </p>
              </div>

              {/* End Hour */}
              <div>
                <label htmlFor="end-hour" className="block mb-2 text-sm font-bold text-ghost-green font-vt323">
                  End Hour (0-23)
                </label>
                <input
                  type="number"
                  id="end-hour"
                  min="0"
                  max="23"
                  value={endHour}
                  onChange={(e) => {
                    setEndHour(parseInt(e.target.value) || 0);
                    setErrors({ ...errors, endHour: undefined });
                  }}
                  disabled={!enabled}
                  className={cn(
                    'retro-input w-full',
                    errors.endHour && 'border-blood-red focus:border-blood-red focus:shadow-glow-red',
                    !enabled && 'opacity-50 cursor-not-allowed'
                  )}
                />
                {errors.endHour && (
                  <p className="mt-1 text-sm text-blood-red font-vt323 animate-flicker">
                    ⚠️ {errors.endHour}
                  </p>
                )}
                <p className="mt-1 text-xs text-text-secondary">
                  Off-hours period ends at this hour (24-hour format)
                </p>
              </div>
            </div>

            {/* Time Range Preview */}
            {enabled && (
              <div className="bg-toxic-purple/10 border-2 border-toxic-purple p-4 rounded">
                <p className="text-toxic-purple font-bold font-vt323 mb-2">
                  📅 Off-Hours Period Preview
                </p>
                <p className="text-text-primary">
                  Motion alerts will be highlighted from{' '}
                  <span className="text-ghost-green font-bold">
                    {startHour.toString().padStart(2, '0')}:00
                  </span>
                  {' '}to{' '}
                  <span className="text-ghost-green font-bold">
                    {endHour.toString().padStart(2, '0')}:00
                  </span>
                  {startHour > endHour && (
                    <span className="text-pumpkin-orange"> (crosses midnight)</span>
                  )}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t-2 border-ghost-green/30">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={updateConfig.isPending}
              >
                {updateConfig.isPending ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  '💾 Save Configuration'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>❓</span>
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-text-secondary">
            <p>
              <span className="text-ghost-green font-bold">•</span> When off-hours monitoring is enabled,
              motion events detected during the configured time period will be marked with a special indicator.
            </p>
            <p>
              <span className="text-ghost-green font-bold">•</span> These events will appear with prominent
              red alerts on the security monitoring page.
            </p>
            <p>
              <span className="text-ghost-green font-bold">•</span> Use 24-hour format (0-23) for time configuration.
              For example, 18 = 6:00 PM, 22 = 10:00 PM.
            </p>
            <p>
              <span className="text-ghost-green font-bold">•</span> If the start hour is greater than the end hour,
              the period will cross midnight (e.g., 22:00 to 06:00).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
