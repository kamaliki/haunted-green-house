'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { AlertToastContainer } from '@/components/ui/AlertToast';
import { useSwipeGesture } from '@/lib/hooks/useSwipeGesture';
import { useIsMobile } from '@/lib/utils/responsive';

/**
 * Dashboard layout with navigation
 * Includes sidebar, navbar, footer, and page transitions
 * Responsive: supports swipe gestures on mobile for sidebar
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const mainRef = useRef<HTMLDivElement>(null);

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Swipe gesture support for mobile
  const swipeHandlers = useSwipeGesture({
    onSwipeRight: () => {
      if (isMobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    },
    onSwipeLeft: () => {
      if (isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    },
    minSwipeDistance: 75,
  });

  // Attach swipe handlers to main content
  useEffect(() => {
    const element = mainRef.current;
    if (!element || !isMobile) return;

    element.addEventListener('touchstart', swipeHandlers.onTouchStart);
    element.addEventListener('touchmove', swipeHandlers.onTouchMove);
    element.addEventListener('touchend', swipeHandlers.onTouchEnd);

    return () => {
      element.removeEventListener('touchstart', swipeHandlers.onTouchStart);
      element.removeEventListener('touchmove', swipeHandlers.onTouchMove);
      element.removeEventListener('touchend', swipeHandlers.onTouchEnd);
    };
  }, [isMobile, swipeHandlers, sidebarOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-spooky">
      {/* Navbar */}
      <Navbar onMenuToggle={handleMenuToggle} />

      {/* Main content area with sidebar */}
      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={handleSidebarClose} />

        {/* Main content */}
        <main ref={mainRef} className="flex-1 overflow-x-hidden pb-20 lg:pb-0">
          {/* Page transition wrapper */}
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.3,
                ease: 'easeInOut',
              }}
              className="min-h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer - hidden on mobile */}
      <div className="hidden lg:block">
        <Footer />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Alert Toast Notifications */}
      <AlertToastContainer />
    </div>
  );
}
