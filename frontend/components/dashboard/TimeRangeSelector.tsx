'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d';

export interface TimeRangeOption {
  value: TimeRange;
  label: string;
}

export interface TimeRangeSelectorProps {
  /**
   * Currently selected time range
   */
  value: TimeRange;
  
  /**
   * Callback when time range changes
   */
  onChange: (range: TimeRange) => void;
  
  /**
   * Available time range options
   * Defaults to all standard ranges
   */
  options?: TimeRangeOption[];
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
}

/**
 * Default time range options
 */
const DEFAULT_TIME_RANGES: TimeRangeOption[] = [
  { value: '1h', label: '1 Hour' },
  { value: '6h', label: '6 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

/**
 * TimeRangeSelector Component
 * 
 * A spooky retro-styled button group for selecting time ranges
 * Used for historical data visualization and analytics
 * 
 * Features:
 * - Active state with ghost green glow
 * - Hover effects with smooth transitions
 * - Pixel art styling consistent with design system
 * - Keyboard accessible
 * 
 * @example
 * ```tsx
 * <TimeRangeSelector
 *   value={timeRange}
 *   onChange={setTimeRange}
 * />
 * ```
 */
export function TimeRangeSelector({
  value,
  onChange,
  options = DEFAULT_TIME_RANGES,
  className,
  disabled = false,
}: TimeRangeSelectorProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((range) => {
        const isActive = value === range.value;
        
        return (
          <motion.button
            key={range.value}
            onClick={() => !disabled && onChange(range.value)}
            disabled={disabled}
            className={cn(
              'px-4 py-2 font-vt323 text-sm',
              'border-2 transition-all duration-200',
              'relative overflow-hidden',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isActive
                ? 'bg-ghost-green text-bg-darkest border-ghost-green shadow-glow-green'
                : 'bg-bg-dark text-ghost-green border-ghost-green hover:bg-bg-medium hover:shadow-[0_0_10px_rgba(57,255,20,0.3)]'
            )}
            whileHover={!disabled && !isActive ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Active state glow effect */}
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-ghost-green opacity-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            
            {/* Button text */}
            <span className="relative z-10 flex items-center gap-1">
              {isActive && <span className="text-xs">👻</span>}
              {range.label}
            </span>
            
            {/* Pixel corner decoration for active state */}
            {isActive && (
              <>
                <div className="absolute top-0 left-0 w-1 h-1 bg-bg-darkest" />
                <div className="absolute top-0 right-0 w-1 h-1 bg-bg-darkest" />
                <div className="absolute bottom-0 left-0 w-1 h-1 bg-bg-darkest" />
                <div className="absolute bottom-0 right-0 w-1 h-1 bg-bg-darkest" />
              </>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
