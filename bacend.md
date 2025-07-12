# 🚀 Skill Swap Platform — Backend Only (MongoDB + Cloudinary + Socket.io)

This project covers the **backend logic only** for a skill exchange platform using Next.js API routes, MongoDB (via Mongoose), Cloudinary for image uploads, and **Socket.IO for real-time chat**. It includes database schemas, protected API endpoints, secure messaging, and WebSocket-based communication between users.

---

## 🧱 Backend Tech Stack
- **Database**: MongoDB with Mongoose ODM
- **API Layer**: Next.js API Routes
- **Auth**: NextAuth.js (JWT, email, OAuth)
- **File Storage**: Cloudinary (for profile images)
- **Realtime Chat**: Socket.IO server with Next.js custom server setup

---

## 📁 Backend Folder Structure

```
/lib/
├── db.ts                 # MongoDB connection
└── models/
    ├── User.ts          # User schema
    ├── Swap.ts          # Swap request schema
    └── Message.ts       # Chat message schema

/pages/api/
├── auth/[...nextauth].ts   # NextAuth config
├── user.ts                 # GET & PUT user profile
├── swap.ts                 # POST, GET, PUT swap requests
├── chat.ts                 # GET & POST chat messages
├── upload.ts               # POST image to Cloudinary
└── socket.ts               # Socket.IO connection endpoint

/socket/
└── server.ts              # WebSocket logic using Socket.IO
```

---

## 🧑‍💻 Mongoose Schemas

### User.ts
```ts
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  photo_url: String,
  location: String,
  skills_offered: [String],
  skills_wanted: [String],
  availability: String,
  is_public: { type: Boolean, default: true },
});
```

### Swap.ts
```ts
const SwapSchema = new mongoose.Schema({
  from_user_id: mongoose.Schema.Types.ObjectId,
  to_user_id: mongoose.Schema.Types.ObjectId,
  offered_skill: String,
  wanted_skill: String,
  message: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
});
```

### Message.ts
```ts
const MessageSchema = new mongoose.Schema({
  swap_id: mongoose.Schema.Types.ObjectId,
  from_user_id: mongoose.Schema.Types.ObjectId,
  to_user_id: mongoose.Schema.Types.ObjectId,
  message: String,
  created_at: { type: Date, default: Date.now },
});
```

---

## ☁️ Cloudinary Image Upload Endpoint

### `/api/upload.ts`
```ts
// POST: Accepts form-data file and uploads it to Cloudinary
// Returns secure_url for storing in MongoDB
```

---

## 🔄 Socket.IO Setup
- Create a `socket/server.ts` file with a `Server` instance and socket event listeners
- Messages should emit `chat:new` and `chat:receive` events in real-time
- Frontend connects using `socket.io-client` in the chat component

---

## 🌐 API Endpoints

| Method | Endpoint              | Description                        |
|--------|------------------------|------------------------------------|
| GET    | `/api/user`           | Get current user profile           |
| PUT    | `/api/user`           | Update user profile                |
| POST   | `/api/swap`           | Send swap request                  |
| GET    | `/api/swap`           | Get all swaps for current user     |
| PUT    | `/api/swap/:id`       | Accept/reject swap request         |
| GET    | `/api/chat/:swap_id`  | Get messages for a swap            |
| POST   | `/api/chat`           | Send new message                   |
| POST   | `/api/upload`         | Upload image to Cloudinary         |
| GET    | `/api/socket`         | Connect to Socket.IO               |

---

## 📦 .env Sample
```
MONGODB_URI=mongodb+srv://...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXTAUTH_SECRET=super-secret
NEXTAUTH_URL=http://localhost:3000
```

---

## ✅ Backend Features
- [x] MongoDB schemas for user, swap, chat
- [x] Protected API routes using NextAuth session
- [x] File upload with Cloudinary
- [x] All core logic separated into endpoint routes
- [x] Real-time chat with Socket.IO

---

Use this file as a backend-only reference in Cursor. Frontend code should call these endpoints and subscribe to Socket.IO events for chat.
