# 📁 Dobby Ads — File Manager

> A Google Drive-style web application where users can register, create nested folders, and upload images. Built with React, Node.js, MongoDB, and Tailwind CSS v4. Includes an MCP server for AI-powered interactions via Claude Desktop.

---

## 🔗 Live Demo

- **Frontend:** `https://your-frontend-url.vercel.app`
- **Backend API:** `https://your-backend-url.railway.app`

**Test Credentials:**
- Email: `test@dobbyads.com`
- Password: `test1234`

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [API Reference](#api-reference)
- [MCP Server (Bonus)](#mcp-server-bonus)
- [What is MCP?](#what-is-mcp)
- [Deployment](#deployment)

---

## ✅ Features

| Feature | Description |
|---|---|
| **Signup / Login / Logout** | JWT-based authentication in Node.js |
| **Create Nested Folders** | Unlimited depth, just like Google Drive |
| **Folder Size Calculation** | Recursively sums all image sizes including nested folders |
| **Upload Images** | Drag & drop or click to upload (Name + Image required) |
| **User-Specific Access** | Users only see their own folders and images |
| **MCP Server (Bonus)** | AI assistant can create folders and list content via natural language |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (JSON Web Tokens), bcryptjs |
| File Upload | Multer (local disk storage) |
| MCP Server | `@modelcontextprotocol/sdk`, Zod, Axios |

---

## 📁 Project Structure

```
dobby-ads/
│
├── server/                    ← Node.js Backend
│   ├── config/
│   │   └── db.js              ← MongoDB connection
│   ├── middleware/
│   │   └── auth.js            ← JWT auth middleware
│   ├── models/
│   │   ├── User.js            ← User schema
│   │   ├── Folder.js          ← Folder schema (with parent reference for nesting)
│   │   └── Image.js           ← Image schema
│   ├── routes/
│   │   ├── auth.js            ← /api/auth (register, login, me)
│   │   ├── folders.js         ← /api/folders (CRUD + recursive size)
│   │   └── images.js          ← /api/images (upload, list, delete)
│   ├── uploads/               ← Auto-created. Stores uploaded images
│   ├── .env                   ← Environment variables (do NOT commit)
│   └── index.js               ← Express app entry point
│
├── client/                    ← React Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js       ← Axios instance with JWT interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── FolderCard.jsx
│   │   │   ├── ImageCard.jsx
│   │   │   ├── CreateFolderModal.jsx
│   │   │   └── UploadImageModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx ← Global auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx  ← Main file manager page
│   │   ├── App.jsx            ← Routes + protected routes
│   │   ├── main.jsx
│   │   └── index.css          ← Tailwind v4 import
│   ├── index.html
│   └── vite.config.js         ← Vite + Tailwind v4 plugin
│
└── mcp-server/                ← Bonus: MCP Server
    ├── .env                   ← API base URL + auth token
    └── index.js               ← MCP tools: create_folder, list_folders, etc.
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **MongoDB** — either:
  - Local installation: [Download MongoDB Community](https://www.mongodb.com/try/download/community)
  - OR free cloud: [MongoDB Atlas](https://www.mongodb.com/atlas) (sign up free)
- **Git** — [Download](https://git-scm.com)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/dobby-ads.git
cd dobby-ads
```

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../client
npm install
```

### Step 4: Install MCP Server Dependencies (Bonus)

```bash
cd ../mcp-server
npm install
```

---

## 🔑 Environment Variables

### Backend — `server/.env`

Create a file named `.env` inside the `server/` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/dobby-ads
JWT_SECRET=dobby_super_secret_key_2024
CLIENT_URL=http://localhost:5173
```

> **Using MongoDB Atlas (cloud)?** Replace `MONGO_URI` with your Atlas connection string:
> `mongodb+srv://username:password@cluster.mongodb.net/dobby-ads`

### MCP Server — `mcp-server/.env`

```env
API_BASE_URL=http://localhost:5000/api
AUTH_TOKEN=PASTE_YOUR_JWT_TOKEN_HERE
```

> You get the `AUTH_TOKEN` after logging in. See the [MCP Setup section](#mcp-server-bonus) below.

---

## ▶️ Running the App

Open **3 separate terminals**:

**Terminal 1 — Start MongoDB (skip if using Atlas)**
```bash
mongod
```

**Terminal 2 — Start Backend**
```bash
cd server
npm run dev
```
Backend runs at: `http://localhost:5000`

**Terminal 3 — Start Frontend**
```bash
cd client
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## 📡 API Reference

All protected routes require the header:
```
Authorization: Bearer <your_jwt_token>
```

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Login, returns JWT | No |
| GET | `/api/auth/me` | Get current user | Yes |

**Register body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```

**Login body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

---

### Folder Routes — `/api/folders`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/folders?parent=null` | List root folders | Yes |
| GET | `/api/folders?parent=<id>` | List subfolders | Yes |
| GET | `/api/folders/:id` | Get folder + breadcrumb | Yes |
| POST | `/api/folders` | Create folder | Yes |
| DELETE | `/api/folders/:id` | Delete folder + all contents | Yes |

**Create folder body:**
```json
{ "name": "Campaigns", "parent": null }
```
> Set `"parent"` to a folder's `_id` to create a nested folder.

---

### Image Routes — `/api/images`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/images?folder=<id>` | List images in a folder | Yes |
| POST | `/api/images` | Upload image (multipart/form-data) | Yes |
| DELETE | `/api/images/:id` | Delete image | Yes |

**Upload image — form fields:**
```
name: "My Banner"
folder: "64abc123..."    ← folder _id
image: [file]            ← the image file
```

---

## 🤖 MCP Server (Bonus)

### What is MCP?

**MCP (Model Context Protocol)** is an open standard by Anthropic that lets AI assistants like Claude connect to external tools and services.

Think of it like this:

> Without MCP → Claude can only chat with you  
> With MCP → Claude can actually **DO things** in your app

When you connect your MCP server to Claude Desktop, you can type commands like:

> *"Create a folder called Summer Ads inside Campaigns"*

...and Claude will actually create that folder in your database — no clicking required.

### How it Works (Simple Explanation)

```
You type in Claude Desktop
        ↓
Claude Desktop reads your claude_desktop_config.json
        ↓
It starts your mcp-server/index.js as a background process
        ↓
Claude understands your command and calls the right "tool"
(e.g. create_folder, list_folders)
        ↓
Your MCP server makes an HTTP request to your Node.js backend
        ↓
The backend saves to MongoDB
        ↓
Claude tells you "Done! Folder created ✓"
```

### Available MCP Tools

| Tool Name | What it Does |
|---|---|
| `list_folders` | Lists all folders (root or inside a parent) |
| `create_folder` | Creates a new folder (optionally nested) |
| `list_images` | Lists all images inside a folder |
| `get_folder_info` | Gets folder details + breadcrumb path |
| `find_folder_by_name` | Searches for a folder by name |

### Step-by-Step MCP Setup

#### Step 1: Get your JWT Token

1. Start your backend and frontend
2. Register or log in at `http://localhost:5173`
3. Open your browser's **Developer Tools** (press F12)
4. Go to the **Application** tab → **Local Storage** → `http://localhost:5173`
5. Copy the value of the `token` key

#### Step 2: Add token to MCP server

Paste it in `mcp-server/.env`:
```env
API_BASE_URL=http://localhost:5000/api
AUTH_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Step 3: Find the Claude Desktop config file

**On Windows:**
```
C:\Users\YOUR_NAME\AppData\Roaming\Claude\claude_desktop_config.json
```

**On Mac:**
```
/Users/YOUR_NAME/Library/Application Support/Claude/claude_desktop_config.json
```

**On Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

> If this file doesn't exist, create it (also create the `Claude` folder if needed).

#### Step 4: Edit the config file

Open the file and paste this (replace the path with your actual project path):

**Windows example:**
```json
{
  "mcpServers": {
    "dobby-ads": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\Projects\\dobby-ads\\mcp-server\\index.js"],
      "env": {
        "API_BASE_URL": "http://localhost:5000/api",
        "AUTH_TOKEN": "PASTE_YOUR_JWT_TOKEN_HERE"
      }
    }
  }
}
```

**Mac/Linux example:**
```json
{
  "mcpServers": {
    "dobby-ads": {
      "command": "node",
      "args": ["/Users/yourname/projects/dobby-ads/mcp-server/index.js"],
      "env": {
        "API_BASE_URL": "http://localhost:5000/api",
        "AUTH_TOKEN": "PASTE_YOUR_JWT_TOKEN_HERE"
      }
    }
  }
}
```

> **Important on Windows:** Use double backslashes `\\` in file paths.

#### Step 5: Restart Claude Desktop

Fully close and reopen the Claude Desktop app.

#### Step 6: Test it!

In Claude Desktop, type:
```
Create a folder called "Campaigns"
```
or
```
List all my folders
```
or
```
Create a folder called "Summer Ads" inside "Campaigns"
```

Claude will automatically find and run the correct tool!

---

## 🌐 Deployment

### Deploy Backend to Railway (free)

1. Go to [railway.app](https://railway.app) and sign up
2. Click **New Project** → **Deploy from GitHub**
3. Select your repo, choose the `server` folder as root
4. Add environment variables in Railway dashboard (same as your `.env`)
5. Railway gives you a public URL like `https://dobby-ads-backend.up.railway.app`

### Deploy Frontend to Vercel (free)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **Add New Project** → import your GitHub repo
3. Set **Root Directory** to `client`
4. Add environment variable: `VITE_API_URL=https://your-railway-url.up.railway.app`
5. Update `client/src/api/axios.js` to use `import.meta.env.VITE_API_URL`
6. Deploy!

### MongoDB Atlas (free cloud database)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up
2. Create a free M0 cluster
3. Create a database user with username + password
4. Under **Network Access**, allow connections from anywhere: `0.0.0.0/0`
5. Get your connection string and use it as `MONGO_URI`

---

## 🔒 Security Notes

- `.env` files are in `.gitignore` — never commit them
- Passwords are hashed with bcrypt (12 rounds)
- All API routes are protected by JWT middleware
- Users can only access their own data (owner-filtered queries)
- File uploads are validated (images only, 10MB max)

---

## 📝 .gitignore

Make sure your `.gitignore` contains:

```
node_modules/
.env
server/uploads/
dist/
.DS_Store
```

---

## 👨‍💻 Author

Built as part of the Dobby Ads Full Stack Developer Internship Assignment.

- **Deadline:** 72 hours
- **Stack:** React + Node.js + MongoDB + MCP Server
```