import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import Message from '@/lib/models/Message';
import Swap from '@/lib/models/Swap';

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

      // Handle joining chat room for a specific swap
      socket.on('join-chat', async (data: { swapId: string, userEmail: string }) => {
        try {
          await dbConnect();
          const user = await User.findOne({ email: data.userEmail });
          
          if (user) {
            // Verify user has access to this swap
            const swap = await Swap.findById(data.swapId);
            if (swap && (swap.from_user_id.toString() === user._id.toString() || 
                        swap.to_user_id.toString() === user._id.toString()) &&
                swap.status === 'accepted') {
              
              socket.join(`swap_${data.swapId}`);
              console.log(`User ${user.email} joined chat for swap ${data.swapId}`);
              socket.emit('joined-chat', { success: true, swapId: data.swapId });
            } else {
              socket.emit('joined-chat', { success: false, error: 'Access denied' });
            }
          }
        } catch (error) {
          console.error('Error joining chat:', error);
          socket.emit('joined-chat', { success: false, error: 'Failed to join chat' });
        }
      });

      // Handle leaving chat room
      socket.on('leave-chat', (data: { swapId: string }) => {
        socket.leave(`swap_${data.swapId}`);
        console.log(`User left chat for swap ${data.swapId}`);
      });

      // Handle sending chat messages
      socket.on('send-message', async (data: { 
        swapId: string, 
        message: string, 
        userEmail: string 
      }) => {
        try {
          await dbConnect();
          const user = await User.findOne({ email: data.userEmail });
          
          if (!user) {
            socket.emit('message-error', { error: 'User not found' });
            return;
          }

          // Verify user has access to this swap
          const swap = await Swap.findById(data.swapId);
          if (!swap || (swap.from_user_id.toString() !== user._id.toString() && 
                       swap.to_user_id.toString() !== user._id.toString()) ||
              swap.status !== 'accepted') {
            socket.emit('message-error', { error: 'Access denied' });
            return;
          }

          // Determine the recipient
          const recipientId = swap.from_user_id.toString() === user._id.toString() 
            ? swap.to_user_id 
            : swap.from_user_id;

          // Save message to database
          const newMessage = await Message.create({
            swap_id: data.swapId,
            from_user_id: user._id,
            to_user_id: recipientId,
            message: data.message,
            created_at: new Date()
          });

          // Populate user info for the response
          await newMessage.populate('from_user_id', 'name email photo_url');

          const messageData = {
            id: newMessage._id,
            swap_id: newMessage.swap_id,
            from_user_id: newMessage.from_user_id._id,
            to_user_id: newMessage.to_user_id,
            message: newMessage.message,
            created_at: newMessage.created_at,
            sender: {
              name: newMessage.from_user_id.name,
              email: newMessage.from_user_id.email,
              avatar: newMessage.from_user_id.photo_url
            }
          };

          // Emit to all users in the swap chat room
          this.io.to(`swap_${data.swapId}`).emit('new-message', messageData);
          
          console.log(`Message sent in swap ${data.swapId}:`, data.message);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message-error', { error: 'Failed to send message' });
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