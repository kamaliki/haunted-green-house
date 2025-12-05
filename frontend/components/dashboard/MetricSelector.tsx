'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface MetricOption {
  key: string;
  label: string;
  color: string;
  unit?: string;
}

export interface MetricSelectorProps {
  /**
   * Available metrics to select from
   */
  metrics: MetricOption[];
  
  /**
   * Currently selected metric keys
   */
  selectedMetrics: string[];
  
  /**
   * Callback when metric selection changes
   */
  onChange: (selectedMetrics: string[]) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Minimum number of metrics that must be selected
   */
  minSelection?: number;
  
  /**
   * Maximum number of metrics that can be selected
   */
  maxSelection?: number;
}

/**
 * MetricSelector Component
 * 
 * A spooky retro-styled multi-select checkbox component for selecting metrics
 * Used for historical data visualization and analytics
 * 
 * Features:
 * - Multi-select checkboxes with color coding
 * - Hover effects with smooth transitions
 * - Pixel art styling consistent with design system
 * - Keyboard accessible
 * - Optional min/max selection constraints
 * 
 * @example
 * ```tsx
 * <MetricSelector
 *   metrics={AVAILABLE_METRICS}
 *   selectedMetrics={selectedMetrics}
 *   onChange={setSelectedMetrics}
 * />
 * ```
 */
export function MetricSelector({
  metrics,
  selectedMetrics,
  onChange,
  className,
  disabled = false,
  minSelection = 0,
  maxSelection,
}: MetricSelectorProps) {
  /**
   * Toggle a metric selection
   */
  const toggleMetric = (metricKey: string) => {
    if (disabled) return;
    
    const isSelected = selectedMetrics.includes(metricKey);
    
    // Check if we can deselect (min selection constraint)
    if (isSelected && selectedMetrics.length <= minSelection) {
      return;
    }
    
    // Check if we can select (max selection constraint)
    if (!isSelected && maxSelection && selectedMetrics.length >= maxSelection) {
      return;
    }
    
    // Toggle the metric
    if (isSelected) {
      onChange(selectedMetrics.filter(m => m !== metricKey));
    } else {
      onChange([...selectedMetrics, metricKey]);
    }
  };

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3', className)}>
      {metrics.map((metric, index) => {
        const isSelected = selectedMetrics.includes(metric.key);
        const canDeselect = !disabled && (selectedMetrics.length > minSelection || !isSelected);
        const canSelect = !disabled && (!maxSelection || selectedMetrics.length < maxSelection || isSelected);
        const isInteractive = canDeselect && canSelect;
        
        return (
          <motion.label
            key={metric.key}
            className={cn(
              'flex items-center gap-3 p-3 rounded border-2 transition-all duration-200',
              'relative overflow-hidden',
              isInteractive ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
              isSelected
                ? 'bg-bg-medium border-ghost-green shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                : 'bg-bg-dark border-ghost-green/30 hover:border-ghost-green/60 hover:bg-bg-medium/50'
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            whileHover={isInteractive ? { scale: 1.02 } : {}}
            whileTap={isInteractive ? { scale: 0.98 } : {}}
          >
            {/* Checkbox */}
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleMetric(metric.key)}
                disabled={!isInteractive}
                className="sr-only"
                aria-label={`Select ${metric.label}`}
              />
              
              {/* Custom checkbox */}
              <div
                className={cn(
                  'w-5 h-5 border-2 transition-all duration-200',
                  'flex items-center justify-center',
                  isSelected
                    ? 'border-ghost-green bg-ghost-green shadow-[0_0_8px_rgba(57,255,20,0.6)]'
                    : 'border-ghost-green/50 bg-bg-darkest'
                )}
              >
                {isSelected && (
                  <motion.span
                    className="text-bg-darkest text-xs font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  >
                    ✓
                  </motion.span>
                )}
              </div>
            </div>
            
            {/* Color indicator */}
            <div
              className={cn(
                'w-4 h-4 border-2 flex-shrink-0 transition-all duration-200',
                isSelected ? 'border-ghost-green shadow-[0_0_6px_rgba(57,255,20,0.4)]' : 'border-ghost-green/30'
              )}
              style={{ backgroundColor: metric.color }}
              aria-hidden="true"
            />
            
            {/* Label */}
            <span
              className={cn(
                'font-vt323 text-sm transition-colors duration-200 flex-1',
                isSelected ? 'text-ghost-green' : 'text-text-primary'
              )}
            >
              {metric.label}
              {metric.unit && (
                <span className="text-text-secondary ml-1">
                  ({metric.unit})
                </span>
              )}
            </span>
            
            {/* Glow effect for selected items */}
            {isSelected && (
              <motion.div
                className="absolute inset-0 bg-ghost-green opacity-5 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.05, 0.1, 0.05] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
            
            {/* Pixel corner decorations for selected items */}
            {isSelected && (
              <>
                <div className="absolute top-0 left-0 w-1 h-1 bg-bg-darkest" />
                <div className="absolute top-0 right-0 w-1 h-1 bg-bg-darkest" />
                <div className="absolute bottom-0 left-0 w-1 h-1 bg-bg-darkest" />
                <div className="absolute bottom-0 right-0 w-1 h-1 bg-bg-darkest" />
              </>
            )}
          </motion.label>
        );
      })}
    </div>
  );
}
