import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { AccessPoint } from '@/types';

interface AccessPointDeleteDialogProps {
  isOpen: boolean;
  accessPoint: AccessPoint | null;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AccessPointDeleteDialog: React.FC<AccessPointDeleteDialogProps> = ({
  isOpen,
  accessPoint,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  if (!accessPoint) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Delete Access Point"
      tombstone={true}
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-center text-5xl sm:text-6xl animate-float-skull">
          💀
        </div>
        
        <p className="text-center text-text-primary font-vt323 text-base sm:text-lg px-2">
          Are you sure you want to delete this access point?
        </p>

        <div className="bg-bg-dark border-2 border-blood-red rounded-lg p-3 sm:p-4 space-y-2 hover:border-pumpkin-orange transition-colors">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl flex-shrink-0 animate-float">
              {accessPoint.type === 'door' ? '🚪' : '🪟'}
            </span>
            <span className="text-ghost-green font-bold font-vt323 text-sm sm:text-base truncate">
              {accessPoint.name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-xs sm:text-sm font-vt323">
            <span className="flex-shrink-0">📍</span>
            <span className="truncate">{accessPoint.location}</span>
          </div>
        </div>

        <p className="text-center text-blood-red font-vt323 text-xs sm:text-sm animate-flicker-intense px-2">
          ⚠️ This action cannot be undone!
        </p>
      </div>

      <ModalFooter>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 hover:scale-105 transition-transform"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
            className="flex-1 hover:scale-105 transition-transform"
          >
            <span className="hidden sm:inline">Delete Access Point</span>
            <span className="sm:hidden">Delete</span>
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
