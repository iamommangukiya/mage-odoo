import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

interface UserSocket {
  userId: string;
  email: string;
  socketId: string;
}

class SocketServer {
  private io: SocketIOServer;
  private userSockets: Map<string, UserSocket> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', async (data: { email: string }) => {
        try {
          await dbConnect();
          const user = await User.findOne({ email: data.email });
          
          if (user) {
            const userSocket: UserSocket = {
              userId: user._id.toString(),
              email: user.email,
              socketId: socket.id
            };
            
            this.userSockets.set(user.email, userSocket);
            socket.join(`user_${user._id}`);
            
            console.log('User authenticated:', user.email);
            socket.emit('authenticated', { success: true });
          } else {
            socket.emit('authenticated', { success: false, error: 'User not found' });
          }
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('authenticated', { success: false, error: 'Authentication failed' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove user from userSockets map
        for (const [email, userSocket] of this.userSockets.entries()) {
          if (userSocket.socketId === socket.id) {
            this.userSockets.delete(email);
            break;
          }
        }
      });
    });
  }

  // Send notification to specific user
  public async sendNotification(userEmail: string, notification: any) {
    try {
      const userSocket = this.userSockets.get(userEmail);
      if (userSocket) {
        this.io.to(userSocket.socketId).emit('notification', notification);
        console.log('Notification sent to:', userEmail);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Send notification to multiple users
  public async sendNotificationToUsers(userEmails: string[], notification: any) {
    for (const email of userEmails) {
      await this.sendNotification(email, notification);
    }
  }

  // Broadcast to all connected users
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Get connected users count
  public getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Get server instance
  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default SocketServer; 