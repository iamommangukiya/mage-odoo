"use client"

import { useSocket } from '@/hooks/useSocket';

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  // Initialize socket connection
  useSocket();

  return <>{children}</>;
} 