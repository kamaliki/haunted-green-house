'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionWrapperProps {
  children: React.ReactNode;
}

/**
 * Page Transition Wrapper
 * Adds smooth slide animations when navigating between pages
 */
export function PageTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Fade Transition Wrapper
 * Simple fade in/out for page transitions
 */
export function FadeTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Zone Transition Wrapper
 * Special transition for zone management to zone dashboard
 */
export function ZoneTransitionWrapper({ children }: PageTransitionWrapperProps) {
  const pathname = usePathname();
  const isZoneDetail = pathname.includes('/zones/') && pathname.split('/').length > 3;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ 
          opacity: 0, 
          scale: isZoneDetail ? 0.9 : 1,
          y: isZoneDetail ? 20 : 0 
        }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: 0 
        }}
        exit={{ 
          opacity: 0, 
          scale: isZoneDetail ? 1.1 : 1,
          y: isZoneDetail ? -20 : 0 
        }}
        transition={{
          duration: 0.4,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
