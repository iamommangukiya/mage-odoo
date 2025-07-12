import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useFirebaseUser } from './useFirebaseUser';
import { useToast } from './use-toast';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useFirebaseUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.email) {
      // Disconnect if no user
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect to Socket.IO server
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    // Handle connection
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      
      // Authenticate with user email
      socket.emit('authenticate', { email: user.email });
    });

    // Handle authentication response
    socket.on('authenticated', (data: { success: boolean; error?: string }) => {
      if (data.success) {
        console.log('Socket authenticated successfully');
      } else {
        console.error('Socket authentication failed:', data.error);
      }
    });

    // Handle notifications
    socket.on('notification', (notification: any) => {
      console.log('Received notification:', notification);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user?.email, toast]);

  return socketRef.current;
} 