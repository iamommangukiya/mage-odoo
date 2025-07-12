// Load environment variables from .env file
require('dotenv').config();

const { Server: SocketIOServer } = require('socket.io');
const { Server: HTTPServer } = require('http');
const mongoose = require('mongoose');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

console.log('MongoDB URI found:', MONGODB_URI ? 'Yes' : 'No');
console.log('MongoDB URI starts with:', MONGODB_URI ? MONGODB_URI.substring(0, 20) + '...' : 'No URI');

let cached = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    console.log('Attempting to connect to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      console.log('✅ MongoDB connected');
      return mongoose;
    }).catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      throw err;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

global.mongoose = cached;

// Define models directly
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  photo_url: String,
  location: String,
  skills_offered: [String],
  bio: String,
  skills_wanted: [String],
  availability: String,
  is_public: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  total_swaps: { type: Number, default: 0 },
  completed_swaps: { type: Number, default: 0 },
  joined_date: { type: Date, default: Date.now },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
});

const SwapSchema = new mongoose.Schema({
  from_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  offered_skill: String,
  wanted_skill: String,
  message: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
});

const MessageSchema = new mongoose.Schema({
  swap_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Swap' },
  from_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  to_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: String,
  status: { 
    type: String, 
    enum: ['sent', 'delivered', 'read'], 
    default: 'sent' 
  },
  created_at: { type: Date, default: Date.now },
});

const NotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  message: String,
  type: String,
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

// Create models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Swap = mongoose.models.Swap || mongoose.model('Swap', SwapSchema);
const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

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

      // Handle joining chat room for a specific swap
      socket.on('join-chat', async (data) => {
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
      socket.on('leave-chat', (data) => {
        socket.leave(`swap_${data.swapId}`);
        console.log(`User left chat for swap ${data.swapId}`);
      });

      // Handle sending chat messages
      socket.on('send-message', async (data) => {
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

// Create HTTP server and start the socket server
const httpServer = new HTTPServer();
const socketServer = new SocketServer(httpServer);

// Start listening on a port
const PORT = process.env.SOCKET_PORT ? parseInt(process.env.SOCKET_PORT) : 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`📡 Ready for real-time chat connections`);
});

module.exports = SocketServer; 