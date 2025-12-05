import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { AccessPoint, CreateAccessPointDto, UpdateAccessPointDto } from '@/types';
import { cn } from '@/lib/utils/cn';

interface AccessPointFormProps {
  accessPoint?: AccessPoint;
  onSubmit: (data: CreateAccessPointDto | UpdateAccessPointDto) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

interface FormData {
  name: string;
  type: 'door' | 'window';
  location: string;
  status: 'open' | 'closed' | 'locked' | 'unlocked';
  monitoringEnabled: boolean;
  alertThreshold: number;
}

interface FormErrors {
  name?: string;
  type?: string;
  location?: string;
  alertThreshold?: string;
  submit?: string;
}

export const AccessPointForm: React.FC<AccessPointFormProps> = ({
  accessPoint,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: accessPoint?.name || '',
    type: accessPoint?.type || 'door',
    location: accessPoint?.location || '',
    status: accessPoint?.status || 'closed',
    monitoringEnabled: accessPoint?.monitoringEnabled ?? true,
    alertThreshold: accessPoint?.alertThreshold || 300,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Check if form has any errors
  const hasErrors = Object.keys(errors).length > 0;
  const isFormValid = !hasErrors && formData.name.trim() && formData.location.trim();

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    } else if (formData.location.trim().length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
    }

    // Alert threshold validation (only when monitoring is enabled)
    if (formData.monitoringEnabled) {
      if (!formData.alertThreshold || isNaN(formData.alertThreshold)) {
        newErrors.alertThreshold = 'Alert threshold is required';
      } else if (formData.alertThreshold < 1) {
        newErrors.alertThreshold = 'Alert threshold must be at least 1 second';
      } else if (formData.alertThreshold > 86400) {
        newErrors.alertThreshold = 'Alert threshold cannot exceed 24 hours (86400 seconds)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle field blur
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      type: true,
      location: true,
      alertThreshold: true,
    });

    if (validate()) {
      onSubmit(formData);
    }
  };

  // Validate on change
  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      validate();
    }
  }, [formData, touched]);

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4 sm:space-y-6', className)}>
      {/* General error message */}
      {errors.submit && (
        <div className="p-3 sm:p-4 border-2 border-blood-red bg-blood-red/10 rounded pixel-corners animate-flicker">
          <p className="text-blood-red font-vt323 flex items-center gap-2 text-sm sm:text-base">
            <span className="text-lg sm:text-xl flex-shrink-0">⚠️</span>
            <span>{errors.submit}</span>
          </p>
        </div>
      )}

      {/* Name field */}
      <div>
        <Input
          label="Access Point Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          onBlur={() => handleBlur('name')}
          error={touched.name ? errors.name : undefined}
          placeholder="e.g., Main Entrance Door"
          disabled={isLoading}
          maxLength={100}
        />
        {!errors.name && !touched.name && (
          <p className="mt-1 text-xs text-text-secondary font-vt323">
            3-100 characters
          </p>
        )}
      </div>

      {/* Type field */}
      <div className="w-full">
        <label className="block mb-2 text-xs sm:text-sm font-bold text-ghost-green font-vt323">
          Access Point Type *
        </label>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <label className="flex items-center gap-2 cursor-pointer hover:text-ghost-green transition-colors p-2 border-2 border-transparent hover:border-ghost-green/30 rounded pixel-corners">
            <input
              type="radio"
              name="type"
              value="door"
              checked={formData.type === 'door'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'door' })}
              onBlur={() => handleBlur('type')}
              disabled={isLoading}
              className="w-4 h-4 text-ghost-green border-ghost-green focus:ring-ghost-green"
            />
            <span className="text-text-primary font-vt323 text-sm sm:text-base">🚪 Door</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:text-ghost-green transition-colors p-2 border-2 border-transparent hover:border-ghost-green/30 rounded pixel-corners">
            <input
              type="radio"
              name="type"
              value="window"
              checked={formData.type === 'window'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'window' })}
              onBlur={() => handleBlur('type')}
              disabled={isLoading}
              className="w-4 h-4 text-ghost-green border-ghost-green focus:ring-ghost-green"
            />
            <span className="text-text-primary font-vt323 text-sm sm:text-base">🪟 Window</span>
          </label>
        </div>
        {touched.type && errors.type && (
          <p className="mt-1 text-xs sm:text-sm text-blood-red font-vt323 animate-flicker">
            ⚠️ {errors.type}
          </p>
        )}
      </div>

      {/* Location field */}
      <div>
        <Input
          label="Location *"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          onBlur={() => handleBlur('location')}
          error={touched.location ? errors.location : undefined}
          placeholder="e.g., North Wing, Zone A"
          disabled={isLoading}
          maxLength={100}
        />
        {!errors.location && !touched.location && (
          <p className="mt-1 text-xs text-text-secondary font-vt323">
            3-100 characters
          </p>
        )}
      </div>

      {/* Status field */}
      <div className="w-full">
        <label className="block mb-2 text-sm font-bold text-ghost-green font-vt323">
          Current Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as FormData['status'] })}
          disabled={isLoading}
          className="retro-input w-full"
        >
          <option value="closed">Closed</option>
          <option value="open">Open</option>
          <option value="locked">Locked</option>
          <option value="unlocked">Unlocked</option>
        </select>
      </div>

      {/* Monitoring Configuration Section */}
      <div className="border-2 border-toxic-purple rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 bg-toxic-purple/5 hover:bg-toxic-purple/10 transition-colors">
        <h3 className="text-base sm:text-lg font-bold text-toxic-purple font-vt323 flex items-center gap-2">
          <span className="animate-pulse">👁️</span>
          <span>Monitoring Configuration</span>
        </h3>

        {/* Monitoring enabled toggle */}
        <label className="flex items-center gap-3 cursor-pointer hover:text-ghost-green transition-colors p-2 border-2 border-transparent hover:border-ghost-green/30 rounded">
          <input
            type="checkbox"
            checked={formData.monitoringEnabled}
            onChange={(e) => setFormData({ ...formData, monitoringEnabled: e.target.checked })}
            disabled={isLoading}
            className="w-5 h-5 text-ghost-green border-ghost-green rounded focus:ring-ghost-green"
          />
          <span className="text-text-primary font-vt323 text-sm sm:text-base">
            Enable monitoring for this access point
          </span>
        </label>

        {/* Alert threshold */}
        {formData.monitoringEnabled && (
          <div className="animate-fade-in">
            <Input
              label="Alert Threshold (seconds)"
              type="number"
              value={formData.alertThreshold}
              onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) || 0 })}
              onBlur={() => handleBlur('alertThreshold')}
              error={touched.alertThreshold ? errors.alertThreshold : undefined}
              placeholder="300"
              min="1"
              max="86400"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-text-secondary font-vt323">
              Generate an alert if the access point remains open for longer than this duration
            </p>
          </div>
        )}
      </div>

      {/* Form actions */}
      <div className="space-y-3 pt-3 sm:pt-4 border-t-2 border-ghost-green/20">
        {/* Validation status indicator */}
        {Object.keys(touched).length > 0 && hasErrors && (
          <div className="p-3 border-2 border-pumpkin-orange bg-pumpkin-orange/10 rounded pixel-corners animate-flicker">
            <p className="text-pumpkin-orange font-vt323 text-xs sm:text-sm flex items-center gap-2">
              <span className="flex-shrink-0">⚠️</span>
              <span>Please fix the errors above before submitting</span>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 hover:scale-105 transition-transform"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading || (Object.keys(touched).length > 0 && !isFormValid)}
            className="flex-1 hover:scale-105 transition-transform"
          >
            <span className="hidden sm:inline">{accessPoint ? 'Update' : 'Create'} Access Point</span>
            <span className="sm:hidden">{accessPoint ? 'Update' : 'Create'}</span>
          </Button>
        </div>
      </div>
    </form>
  );
};
