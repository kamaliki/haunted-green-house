'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

/**
 * Toast Store
 * Global state management for toast notifications
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    
    // Auto-remove after duration
    const duration = toast.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  
  clearAll: () => {
    set({ toasts: [] });
  },
}));

/**
 * Hook to show toast notifications
 */
export function useToast() {
  const addToast = useToastStore((state) => state.addToast);
  
  return {
    success: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'success', title, message, duration });
    },
    error: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'error', title, message, duration });
    },
    warning: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'warning', title, message, duration });
    },
    info: (title: string, message?: string, duration?: number) => {
      addToast({ type: 'info', title, message, duration });
    },
    custom: (toast: Omit<Toast, 'id'>) => {
      addToast(toast);
    },
  };
}

/**
 * Individual Toast Component
 */
function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useToastStore((state) => state.removeToast);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  const typeConfig = {
    success: {
      icon: '✓',
      borderColor: 'border-ghost-green',
      shadowColor: 'shadow-[0_0_20px_rgba(57,255,20,0.6)]',
      iconBg: 'bg-ghost-green',
      textColor: 'text-ghost-green',
    },
    error: {
      icon: '✕',
      borderColor: 'border-blood-red',
      shadowColor: 'shadow-[0_0_20px_rgba(255,0,110,0.6)]',
      iconBg: 'bg-blood-red',
      textColor: 'text-blood-red',
    },
    warning: {
      icon: '⚠',
      borderColor: 'border-pumpkin-orange',
      shadowColor: 'shadow-[0_0_20px_rgba(251,86,7,0.6)]',
      iconBg: 'bg-pumpkin-orange',
      textColor: 'text-pumpkin-orange',
    },
    info: {
      icon: 'ℹ',
      borderColor: 'border-toxic-purple',
      shadowColor: 'shadow-[0_0_20px_rgba(157,78,221,0.6)]',
      iconBg: 'bg-toxic-purple',
      textColor: 'text-toxic-purple',
    },
  };

  const config = typeConfig[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        relative
        bg-bg-dark
        border-4 ${config.borderColor} ${config.shadowColor}
        rounded-lg
        p-4
        min-w-[320px]
        max-w-[400px]
        pointer-events-auto
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          ${config.iconBg}
          text-bg-darkest
          w-8 h-8
          rounded-full
          flex items-center justify-center
          font-bold
          flex-shrink-0
        `}>
          {config.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-bold ${config.textColor} text-sm uppercase tracking-wide`}>
              {toast.title}
            </h4>
            <button
              onClick={handleDismiss}
              className="text-text-secondary hover:text-bone-white transition-colors flex-shrink-0"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>

          {/* Message */}
          {toast.message && (
            <p className="text-text-secondary text-sm mt-1">
              {toast.message}
            </p>
          )}

          {/* Action button */}
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                handleDismiss();
              }}
              className={`
                mt-2 text-sm font-bold ${config.textColor}
                hover:underline
                transition-colors
              `}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      </div>

      {/* Pixel corners */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-bg-darkest"></div>
      <div className="absolute top-0 right-0 w-2 h-2 bg-bg-darkest"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-bg-darkest"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-bg-darkest"></div>
    </motion.div>
  );
}

/**
 * Toast Container Component
 * Displays all active toast notifications
 */
export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
