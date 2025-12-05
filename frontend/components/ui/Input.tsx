import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    // Generate a unique ID if not provided
    const inputId = id || `input-${React.useId()}`;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block mb-2 text-sm font-bold text-ghost-green font-vt323">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ghost-green">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'retro-input w-full',
              icon && 'pl-10',
              error && 'border-blood-red focus:border-blood-red focus:shadow-glow-red',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-blood-red font-vt323 animate-flicker">
            ⚠️ {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    // Generate a unique ID if not provided
    const textareaId = id || `textarea-${React.useId()}`;
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block mb-2 text-sm font-bold text-ghost-green font-vt323">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'retro-input w-full min-h-[100px] resize-y',
            error && 'border-blood-red focus:border-blood-red focus:shadow-glow-red',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-blood-red font-vt323 animate-flicker">
            ⚠️ {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
