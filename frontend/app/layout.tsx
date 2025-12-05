import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ToastContainer } from "@/components/ui/Toast";
import { NetworkErrorBanner } from "@/components/ui/ErrorDisplay";
import { NetworkStatusProvider } from "@/components/providers/NetworkStatusProvider";
import { GhostParticles } from "@/components/ui/SpookyEffects";

export const metadata: Metadata = {
  title: "Haunted Greenhouse",
  description: "Spooky smart greenhouse monitoring and control system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="scanlines">
        <GhostParticles count={5} />
        <ErrorBoundary>
          <SessionProvider>
            <QueryProvider>
              <SocketProvider>
                <NetworkStatusProvider>
                  {children}
                  <ToastContainer />
                </NetworkStatusProvider>
              </SocketProvider>
            </QueryProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
