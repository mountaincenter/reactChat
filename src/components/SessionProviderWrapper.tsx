"use client";

import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "~/components/theme-provider";
import Header from "../app/_components/Header/Header";
import type { Session } from "next-auth";

interface SessionProviderWrapperProps {
  children: React.ReactNode;
  session: Session | null;
}

const SessionProviderWrapper: React.FC<SessionProviderWrapperProps> = ({
  children,
  session,
}) => {
  return (
    <SessionProvider session={session}>
      <TRPCReactProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex w-full justify-center">
            <Header />
          </div>
          <div className="flex w-full flex-1 flex-col items-center justify-center px-4">
            {children}
          </div>
        </ThemeProvider>
      </TRPCReactProvider>
    </SessionProvider>
  );
};

export default SessionProviderWrapper;
