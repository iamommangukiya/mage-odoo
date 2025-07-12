const { Server: SocketIOServer } = require('socket.io');
const { Server: HTTPServer } = require('http');
const dbConnect = require('../dist/lib/db').default;
const User = require('../dist/lib/models/User').default;
const Notification = require('../dist/lib/models/Notification').default;

class SocketServer {
  constructor(server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    this.userSockets = new Map();
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Handle user authentication
      socket.on('authenticate', async (data) => {
        try {
          await dbConnect();
          const user = await User.findOne({ email: data.email });
          if (user) {
            const userSocket = {
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
        for (const [email, userSocket] of this.userSockets.entries()) {
          if (userSocket.socketId === socket.id) {
            this.userSockets.delete(email);
            break;
          }
        }
      });
    });
  }

  async sendNotification(userEmail, notification) {
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

  async sendNotificationToUsers(userEmails, notification) {
    for (const email of userEmails) {
      await this.sendNotification(email, notification);
    }
  }

  broadcast(event, data) {
    this.io.emit(event, data);
  }

  getConnectedUsersCount() {
    return this.userSockets.size;
  }

  getIO() {
    return this.io;
  }
}

module.exports = SocketServer; 