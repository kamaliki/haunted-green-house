'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import type { ZoneInput } from '@/app/(auth)/register/page';

interface ZoneManagerProps {
  zones: ZoneInput[];
  onChange: (zones: ZoneInput[]) => void;
  disabled?: boolean;
}

export const ZoneManager: React.FC<ZoneManagerProps> = ({
  zones,
  onChange,
  disabled = false,
}) => {
  const [newZone, setNewZone] = useState<ZoneInput>({
    name: '',
    description: '',
  });
  const [newZoneErrors, setNewZoneErrors] = useState<Partial<ZoneInput>>({});

  const validateZoneName = (name: string): string | undefined => {
    if (!name.trim()) return 'Zone name is required';
    if (name.length > 100) return 'Zone name must be less than 100 characters';
    if (zones.some(zone => zone.name.toLowerCase() === name.toLowerCase())) {
      return 'Zone name must be unique';
    }
    return undefined;
  };

  const validateZoneDescription = (description: string): string | undefined => {
    if (description && description.length > 300) return 'Zone description must be less than 300 characters';
    return undefined;
  };

  const handleAddZone = () => {
    const nameError = validateZoneName(newZone.name);
    const descriptionError = validateZoneDescription(newZone.description || '');

    if (nameError || descriptionError) {
      setNewZoneErrors({
        name: nameError,
        description: descriptionError,
      });
      return;
    }

    // Add the new zone
    const zoneToAdd: ZoneInput = {
      name: newZone.name.trim(),
      description: newZone.description?.trim() || undefined,
    };

    onChange([...zones, zoneToAdd]);

    // Reset form
    setNewZone({ name: '', description: '' });
    setNewZoneErrors({});
  };

  const handleRemoveZone = (index: number) => {
    const updatedZones = zones.filter((_, i) => i !== index);
    onChange(updatedZones);
  };

  const handleUpdateZone = (index: number, updatedZone: ZoneInput) => {
    const updatedZones = zones.map((zone, i) => (i === index ? updatedZone : zone));
    onChange(updatedZones);
  };

  const handleNewZoneChange = (field: keyof ZoneInput, value: string) => {
    setNewZone(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (newZoneErrors[field]) {
      setNewZoneErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing zones */}
      {zones.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-ghost-green font-retro">
            CONFIGURED ZONES ({zones.length})
          </h4>
          {zones.map((zone, index) => (
            <div
              key={index}
              className="bg-bg-medium/50 border-2 border-toxic-purple/50 rounded p-4 relative group hover:border-toxic-purple transition-colors duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-ghost-green font-retro text-sm mb-1">
                    🌱 {zone.name}
                  </h5>
                  {zone.description && (
                    <p className="text-text-secondary text-xs font-retro break-words">
                      {zone.description}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-text-secondary font-retro">
                    Zone #{index + 1}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveZone(index)}
                  disabled={disabled}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  🗑️
                </Button>
              </div>
              
              {/* Decorative corner */}
              <div className="absolute top-1 right-1 text-xs opacity-30">
                🕸️
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new zone form */}
      <div className="bg-bg-dark/50 border-2 border-ghost-green/30 rounded p-4 space-y-4">
        <h4 className="text-sm font-bold text-ghost-green font-retro">
          ➕ ADD NEW ZONE
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="ZONE NAME"
              type="text"
              value={newZone.name}
              onChange={(e) => handleNewZoneChange('name', e.target.value)}
              placeholder="e.g., Tomato Section"
              required
              disabled={disabled}
              error={newZoneErrors.name}
              icon="🌱"
            />
          </div>
          
          <div>
            <Textarea
              label="DESCRIPTION (OPTIONAL)"
              value={newZone.description}
              onChange={(e) => handleNewZoneChange('description', e.target.value)}
              placeholder="Describe this zone..."
              disabled={disabled}
              error={newZoneErrors.description}
              rows={2}
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={handleAddZone}
          disabled={disabled || !newZone.name.trim()}
          size="sm"
          className="w-full sm:w-auto"
        >
          <span className="flex items-center justify-center">
            🌿 ADD SPECTRAL ZONE
          </span>
        </Button>
      </div>

      {/* Zone tips */}
      <div className="bg-toxic-purple/10 border border-toxic-purple/30 rounded p-3">
        <div className="flex items-start space-x-2">
          <span className="text-toxic-purple text-sm">💡</span>
          <div className="text-xs text-text-secondary font-retro">
            <p className="mb-1">
              <strong className="text-toxic-purple">Pro Tip:</strong> Zones help you monitor different areas independently.
            </p>
            <p>
              Examples: "Seedling Area", "Tomato Section", "Herb Garden", "Flowering Zone"
            </p>
          </div>
        </div>
      </div>

      {zones.length === 0 && (
        <div className="text-center py-8 text-text-secondary">
          <div className="text-4xl mb-2 opacity-50">🌱</div>
          <p className="font-retro text-sm">
            No zones configured yet. Add your first spectral zone above!
          </p>
        </div>
      )}
    </div>
  );
};