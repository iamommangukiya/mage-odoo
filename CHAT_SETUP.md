# Real-Time Chat Setup

This document explains how to set up and run the real-time chat functionality for the Skill Swap Platform.

## Overview

The chat system allows users with **accepted swaps** to communicate in real-time. Only users who have mutually accepted a skill swap can chat with each other.

## Features

- ✅ **Real-time messaging** between users with accepted swaps
- ✅ **Message persistence** - messages are saved to the database
- ✅ **User authentication** - only authenticated users can access chats
- ✅ **Swap verification** - only users with accepted swaps can chat
- ✅ **Message status tracking** - sent, delivered, read status
- ✅ **Responsive UI** - works on mobile and desktop

## Setup Instructions

### 1. Start the Socket Server

The socket server handles real-time communication. Run it in a separate terminal:

```bash
npm run socket
```

This will start the socket server on port 3001 (or the port specified in `SOCKET_PORT` environment variable).

### 2. Start the Next.js Development Server

In another terminal, start the main application:

```bash
npm run dev
```

### 3. Environment Variables

Make sure you have these environment variables set:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How It Works

### Backend Components

1. **Socket Server** (`socket/server.js`):
   - Handles real-time connections
   - Authenticates users
   - Manages chat rooms for each swap
   - Saves messages to database
   - Broadcasts messages to swap participants

2. **API Endpoints**:
   - `/api/swap/accepted-users` - Fetches users with accepted swaps
   - `/api/chat/[swap_id]` - Fetches chat history for a swap

3. **Database Models**:
   - `Message` - Stores chat messages with status tracking
   - `Swap` - Defines accepted swaps between users
   - `User` - User information

### Frontend Components

1. **Chat Page** (`app/chat/page.tsx`):
   - Displays list of users with accepted swaps
   - Real-time message sending/receiving
   - Message history display
   - Responsive design

2. **Socket Hook** (`hooks/useSocket.ts`):
   - Manages socket connection
   - Handles authentication
   - Listens for real-time events

## Usage Flow

1. **User Authentication**: User logs in via NextAuth
2. **Fetch Accepted Swaps**: Chat page loads users with accepted swaps
3. **Select Chat**: User clicks on a swap partner to start chatting
4. **Join Chat Room**: Socket joins the specific swap's chat room
5. **Send/Receive Messages**: Real-time messaging via socket
6. **Message Persistence**: Messages are saved to database

## Security Features

- ✅ **Authentication Required**: Only logged-in users can access chat
- ✅ **Swap Verification**: Only users with accepted swaps can chat
- ✅ **Room Isolation**: Each swap has its own chat room
- ✅ **User Validation**: Server validates user permissions before allowing chat access

## Troubleshooting

### Socket Connection Issues

1. **Check if socket server is running**:
   ```bash
   npm run socket
   ```

2. **Verify environment variables**:
   - `NEXT_PUBLIC_SOCKET_URL` should point to your socket server
   - `NEXT_PUBLIC_APP_URL` should point to your Next.js app

3. **Check browser console** for connection errors

### Database Issues

1. **Ensure MongoDB is running**
2. **Check database connection** in `lib/db.ts`
3. **Verify models are properly imported**

### Message Not Sending

1. **Check user authentication** - user must be logged in
2. **Verify swap status** - swap must be "accepted"
3. **Check socket connection** - ensure socket is connected
4. **Review browser console** for error messages

## Development Notes

- The socket server runs on port 3001 by default
- Messages are stored in MongoDB with status tracking
- Real-time updates are handled via Socket.IO
- The UI is built with Next.js, TypeScript, and Tailwind CSS

## Testing

To test the chat functionality:

1. Create two user accounts
2. Create a swap request between the users
3. Accept the swap on both sides
4. Navigate to the chat page
5. Select the swap partner and start messaging

The messages should appear in real-time for both users. 