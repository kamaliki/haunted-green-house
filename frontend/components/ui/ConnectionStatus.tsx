'use client';

import { useSocket } from '@/components/providers/SocketProvider';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Connection Status Indicator
 * Displays the current WebSocket connection state with spooky styling
 */
export function ConnectionStatus() {
  const { isConnected, connectionError } = useSocket();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2"
      >
        {/* Connection indicator dot */}
        <div className="relative">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected
                ? 'bg-ghost-green shadow-[0_0_10px_rgba(57,255,20,0.8)]'
                : 'bg-blood-red shadow-[0_0_10px_rgba(255,0,110,0.8)]'
            }`}
          >
            {isConnected && (
              <motion.div
                className="absolute inset-0 rounded-full bg-ghost-green"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </div>
        </div>

        {/* Connection status text */}
        <span
          className={`text-sm font-mono ${
            isConnected ? 'text-ghost-green' : 'text-blood-red'
          }`}
        >
          {isConnected ? 'CONNECTED' : connectionError ? 'ERROR' : 'DISCONNECTED'}
        </span>

        {/* Error tooltip */}
        {connectionError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-full mt-2 right-0 bg-bg-dark border-2 border-blood-red p-2 rounded text-xs text-bone-white shadow-lg z-50 max-w-xs"
          >
            {connectionError}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
