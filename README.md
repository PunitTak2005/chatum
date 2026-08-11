# ⚡ Chatum - Real-Time Chat Application

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://chatum-omega.vercel.app/)

A production-grade, high-performance **Real-Time Chat Application** engineered with **Node.js, Express, Socket.io, SQLite persistence**, and a **modern glassmorphic React (Vite) frontend**. Designed for seamless collaboration, lightning-fast message delivery, and an immersive user experience.

---

## 🌟 Features Overview

- **⚡ Instant Real-Time Messaging**: Real-time bi-directional message exchange powered by Socket.io with zero polling delay.
- **💾 SQLite Persistence**: Complete chat history, user channels, and profiles are persisted in SQLite (`chat.db`).
- **🟢 Live Online/Offline User Presence**: Dynamic presence detection tracking online members and relative "last seen" timestamps for offline members.
- **✍️ Real-Time Typing Indicators**: Sliding-window 1.5s typing heartbeats with animated glassmorphic pill badges.
- **📸 Profile Picture Upload & Customization**: Drag-and-drop or file upload with automatic client-side canvas compression (256×256) and profile editing.
- **🤖 AI-Generated User Avatars**: Native 3D character avatars for seeded team conversations across channels.
- **🏷️ Channel/Room Management**: Switch between `#general`, `#tech`, `#random`, or create custom channels dynamically.
- **🔍 Full-Text Message Search**: In-channel real-time keyword search with instant mark highlight.
- **✓✓ Read Receipts**: Visual status checkmarks (`delivered` ➔ `read`) when recipients view incoming messages.
- **🎨 Glassmorphic Dark Design System**: Curated HSL color palette, smooth micro-animations, and responsive layout.

---

## 📁 Project Architecture & Directory Structure

```
chat/
├── backend/
│   ├── chat.db                      # SQLite relational database
│   ├── .env                         # Backend environment variables
│   ├── .env.example                 # Example backend environment variables
│   ├── package.json                 # Backend dependencies and scripts
│   ├── test-server.js               # Automated 8-step verification test suite
│   ├── scripts/
│   │   ├── seed.js                  # Database seeder (rooms, users, AI avatars, chats)
│   │   └── clean-db.js              # Database cleaner (resets to clean state)
│   └── src/
│       ├── app.js                   # Express application configuration & middlewares
│       ├── server.js                # HTTP + Socket.io server entry point
│       ├── config/
│       │   └── database.js          # SQLite connection, promisified helpers & schema
│       ├── controllers/
│       │   ├── authController.js    # Login, profile update, and users endpoints
│       │   ├── messageController.js # Send, history pagination, search, and clear
│       │   └── roomController.js    # Fetch, create, and delete channels
│       ├── models/
│       │   ├── userModel.js         # User data queries & presence updates
│       │   ├── messageModel.js      # Message queries, search, and persistence
│       │   └── roomModel.js         # Channel queries and creation
│       ├── routes/
│       │   ├── authRoutes.js        # /api/auth routes
│       │   ├── messageRoutes.js     # /api/messages routes
│       │   └── roomRoutes.js        # /api/rooms routes
│       └── sockets/
│           └── chatSocket.js        # Real-time WebSocket lifecycle, rooms & presence
│
├── frontend/
│   ├── index.html                   # HTML entry point with Chatum branding
│   ├── vite.config.js               # Vite configuration (port 3252)
│   ├── .env                         # Frontend environment variables
│   ├── .env.example                 # Example frontend environment variables
│   ├── package.json                 # Frontend dependencies and scripts
│   ├── public/
│   │   └── avatars/                 # AI avatars and chatum.png brand logo
│   └── src/
│       ├── main.jsx                 # React root DOM mount
│       ├── App.jsx                  # Main application layout & room orchestration
│       ├── components/
│       │   ├── AuthModal.jsx        # Login & profile image upload modal
│       │   ├── EditProfileModal.jsx # Live profile update (name & photo) modal
│       │   ├── ChatHeader.jsx       # Channel header with active room & search toggle
│       │   ├── ChatInput.jsx        # Typing heartbeat input, emoji picker, send
│       │   ├── MessageList.jsx      # Scrollable chat feed with date separators
│       │   ├── MessageItem.jsx      # Message bubble with avatar presence dot & ticks
│       │   ├── RoomSidebar.jsx      # Channel list, user status bar & edit triggers
│       │   ├── TypingIndicator.jsx  # Glowing wave-dot typing badge
│       │   └── UserPresenceList.jsx # Sidebar member list (Online/Offline)
│       ├── context/
│       │   ├── AuthContext.jsx      # User authentication & session state
│       │   └── SocketContext.jsx    # Socket.io connection, rooms, presence & messages
│       ├── services/
│       │   ├── api.js               # REST API client (fetch)
│       │   └── socket.js            # Socket.io client singleton
│       └── styles/
│           └── main.css             # Glassmorphic CSS design system
│
├── package.json                     # Root workspace scripts
└── README.md                        # Documentation
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `9001` | Port where the Express & Socket.io server listens |
| `CLIENT_URL` | `http://localhost:3252` | Allowed client origin for CORS |
| `NODE_ENV` | `development` | Server environment mode (`development` or `production`) |

### Frontend (`frontend/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | `http://localhost:9001` | Backend REST API & Socket.io server endpoint |

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

---

### Step 1: Install Dependencies

From the repository root:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

---

### Step 2: Database Initialization & Seeding (Optional)

The database automatically initializes tables upon server start. If you wish to populate the database with authentic team conversations and AI avatars:
```bash
# Seed initial channels, AI users, and conversations
npm run seed:db

# Or to wipe the database clean at any time
npm run clean:db
```

---

### Step 3: Run the Backend Server

```bash
# From backend directory
cd backend
npm run dev
```
> 🚀 **Backend will start on:** `http://localhost:9001`

---

### Step 4: Run the Frontend Application

```bash
# In a new terminal, from frontend directory
cd frontend
npm run dev
```
> 🌐 **Frontend will start on:** `http://localhost:3252`

---

### Step 5: Open Chatum in Browser
Open **[http://localhost:3252](http://localhost:3252)** in your browser.
- Open **two different browser tabs/windows** (or an Incognito window) to test multi-user messaging, live typing indicators, and presence updates in real time!

---

## ☁️ Cloud Deployment Guide

### Option 1: Deploy on Render (Recommended & 1-Click Ready)

Render provides native WebSocket support and free web hosting.

#### Quick Steps:
1. Push your repository to **GitHub** or **GitLab**.
2. Go to **[Render Dashboard](https://dashboard.render.com)**.
3. Click **New +** ➔ **Web Service**.
4. Connect your GitHub repository.
5. Set the following settings:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
6. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `*` (or your deployed frontend URL)
7. Click **Create Web Service**. Your backend will be live at `https://your-backend-name.onrender.com`.

> 💡 **Blueprint Deployment**: You can also use Render Blueprints by pointing to the included `render.yaml` file to deploy both backend and frontend automatically!

---

### Option 2: Deploy on Railway

1. Go to **[Railway.app](https://railway.app)** and click **New Project** ➔ **Deploy from GitHub repo**.
2. Select your repository.
3. In **Settings**:
   - Set **Root Directory**: `/backend`
   - Set **Start Command**: `npm start`
   - Set **Healthcheck Path**: `/api/health`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `*`
5. Railway will automatically build and deploy your backend service with an assigned public HTTPS domain.

---

### Option 3: Deploy with Docker / Fly.io

1. **Build Docker Image**:
   ```bash
   cd backend
   docker build -t chatum-backend .
   docker run -p 9001:9001 chatum-backend
   ```
2. **Deploy to Fly.io**:
   ```bash
   cd backend
   fly launch
   fly deploy
   ```

---

### 🌐 Deploying the Frontend (Vercel / Netlify)

1. Push your code to **GitHub**.
2. Go to **[Vercel](https://vercel.com)** or **[Netlify](https://netlify.com)**.
3. Import your repository:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_BACKEND_URL`: `https://your-backend-name.onrender.com` (your deployed backend URL)
5. Click **Deploy**. Your real-time frontend is live!

---

## 🧪 Automated Testing

Chatum includes an automated 8-step full-stack verification test suite:
```bash
# Run backend test suite
npm run test:backend
# or from backend/
npm test
```

### Tests Covered:
1. `GET /api/health` - Backend health check & uptime verification.
2. `GET /api/rooms` - Channel list retrieval.
3. `POST /api/rooms` - Custom channel creation.
4. `POST /api/messages` - REST message dispatch.
5. `GET /api/messages?room=:room` - SQLite history persistence verification.
6. `GET /api/messages/search` - Keyword message search.
7. `Socket.io Multi-Client Test` - Real-time typing indicators & bi-directional message exchange.
8. `POST /api/auth/login` - Username authentication & token issuance.

---

## 📡 API & Socket Event Reference

### REST Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and uptime |
| `POST` | `/api/auth/login` | Username authentication & avatar registration |
| `GET` | `/api/auth/users` | Retrieve all registered users with presence data |
| `PUT` | `/api/auth/profile` | Update username & profile picture |
| `DELETE` | `/api/auth/users` | Clear all registered users (cleanup) |
| `GET` | `/api/rooms` | Fetch all channels |
| `POST` | `/api/rooms` | Create a new channel |
| `DELETE` | `/api/rooms/:id` | Delete a custom channel |
| `GET` | `/api/messages` | Fetch paginated chat history for a channel |
| `POST` | `/api/messages` | Send message via REST API |
| `GET` | `/api/messages/search` | Search messages by keyword within a channel |
| `DELETE` | `/api/messages` | Clear chat history globally or by room |

---

### Socket.io Events

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `user_login` | Client ➔ Server | `{ username, avatar }` | Authenticates socket session and broadcasts presence |
| `join_room` | Client ➔ Server | `{ room }` | Switches user's active socket room |
| `send_message` | Client ➔ Server | `{ room, sender, senderAvatar, content }` | Dispatches message to all room members & saves to SQLite |
| `receive_message` | Server ➔ Client | `MessageObject` | Delivers real-time message to connected clients |
| `typing_start` | Client ➔ Server | `{ room, username }` | Notifies room members that user is typing |
| `typing_stop` | Client ➔ Server | `{ room, username }` | Notifies room members that typing has stopped |
| `user_typing_start`| Server ➔ Client | `{ room, username }` | Broadcasts typing event to other clients |
| `user_typing_stop` | Server ➔ Client | `{ room, username }` | Broadcasts stop typing event |
| `message_read` | Client ➔ Server | `{ messageId, room, readBy }` | Updates message status to `read` |
| `message_status_updated` | Server ➔ Client | `{ messageId, status }` | Broadcasts read receipts checkmark change |
| `presence_update` | Server ➔ Client | `{ users, onlineUsers, onlineCount }` | Unified member presence update |
| `profile_updated` | Server ➔ Client | `{ oldUsername, user }` | Broadcasts profile name/photo update |

---

## 🎨 Design Decisions

1. **Architecture Separation**:
   - Clean MVC pattern in backend: Models handle SQLite database transactions, Controllers handle business logic, Routes define endpoints, and Sockets manage real-time events.
   - Decoupled state management in frontend using Context API (`AuthContext` and `SocketContext`) ensuring components only re-render when relevant state changes.

2. **Database Persistence with SQLite**:
   - Chosen for zero-configuration, robust local ACID compliance.
   - All messages, custom channels, and users survive server restarts.

3. **Hybrid Presence Sync**:
   - Merges real-time socket connections with persistent SQLite records so offline users remain visible with their last active timestamp.

4. **Typing Heartbeat Mechanism**:
   - Rather than sending typing events on every single keystroke, the client pulses a 1.5s heartbeat while typing and utilizes a 6-second sliding watchdog window to prevent stale indicators.

5. **Client-Side Image Optimization**:
   - Profile images are compressed via HTML5 Canvas to 256×256 pixels prior to upload, keeping Base64 payloads compact (<30KB) and WebSocket transmissions instant.

6. **Ref-Based Event Handling in React**:
   - Socket listener callbacks in `SocketContext.jsx` utilize `useRef` references for `currentRoomRef` and `userRef` to prevent React stale closure bugs during rapid room switching.

---

## 💡 Assumptions Made

1. **Dummy Authentication**:
   - As per requirements, authentication is username-based with avatar customization. A dummy JWT-like token is generated and persisted in `localStorage` for session resumption.
2. **Channel Scope**:
   - Default channels (`#general`, `#tech`, `#random`) are system-level and protected from accidental deletion; custom channels created by users can be deleted.
3. **Network Compatibility**:
   - CORS is configured to allow `*` in development with WebSocket fallback to long-polling if restrictive firewalls block native WebSocket connections.
4. **Port Configuration**:
   - Backend is configured to run on port `9001` and frontend on port `3252` across all configuration files.

---

## 📄 License
This project is open-source and available under the **MIT License**.
