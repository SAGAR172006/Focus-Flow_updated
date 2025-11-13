
-----

# Focus-Flow 🚀

Focus-Flow is a modern, all-in-one productivity suite designed to help you manage your tasks, time, and wellness in a single, streamlined application. It features a rich analytics dashboard, AI-powered tools, and a full authentication system.

This project was a migration from an initial Supabase/TypeScript build to a full MERN-stack (MongoDB, Express, React, Node.js) application running on JavaScript, complete with a custom backend and API.

## ✨ Features

  * 🔐 **Full Authentication:** Secure user registration and login (Email/Password), Google OAuth 2.0, and a "Continue as Guest" option.
  * 📊 **Analytics Dashboard:** A dynamic dashboard that visualizes your productivity, including charts for focus time, completed tasks, and calorie trends.
  * ⏰ **Focus Tools:** A suite of timers including a **Pomodoro** timer, a **Countdown** timer, and a **Stopwatch** to manage work sessions. All sessions are logged to your profile.
  * ✅ **Task Manager:** A full CRUD (Create, Read, Update, Delete) task manager to organize your to-do lists by category and priority.
  * 🍎 **Wellness Tracker:** A simple calorie tracker to log food ("calories gained") and exercise ("calories spent") and view your net balance for the day.
  * 📄 **AI Document Analyzer:** Upload PDF or TXT files and use Google's Gemini AI to generate summaries, extract key points, or list action items.
  * 📺 **Smart YouTube Search:** Search for YouTube videos, get a list of results with metadata (like duration), and receive an AI-generated summary of the video's content before you watch.
  * ✏️ **PDF Editor:** A simple, client-side PDF editor that allows you to upload a PDF and add text, images, or highlights directly onto the document and save the modified file.

## 🛠️ Tech Stack

### Frontend

  * **React 18**
  * **Vite** (Next-gen frontend tooling)
  * **Tailwind CSS** (Utility-first CSS framework)
  * **React Router v6** (Client-side routing)
  * **Recharts** (Dashboard charts)
  * **pdf-lib** / **react-pdf** (PDF viewing and editing)

### Backend

  * **Node.js**
  * **Express.js** (API framework)
  * **MongoDB** (NoSQL database)
  * **Mongoose** (Object Data Modeling for MongoDB)
  * **JSON Web Tokens (JWT)** (For secure auth, stored in `httpOnly` cookies)
  * **Passport.js** (For Google OAuth 2.0 authentication)
  * **Google Gemini API** (Powering all AI summary features)
  * **Google YouTube Data API** (For video search)
  * **youtube-transcript** (For fetching video transcripts)

-----

## 🚀 Getting Started

To run this project locally, you will need to run both the `frontend` and `backend` servers simultaneously in two separate terminals.

### Prerequisites

  * [Node.js](https://nodejs.org/) (v18 or later)
  * [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or a local MongoDB instance)
  * **Google Cloud Project** with the following enabled:
    1.  **YouTube Data API v3**
    2.  **Vertex AI Gemini API**
    3.  **OAuth 2.0 Credentials**

### 1\. Backend Setup

1.  **Navigate to the backend:**

    ```bash
    cd backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Create your environment file:**
    Create a file named `.env` in the `backend` folder and paste in the content from `.env.example` below.

4.  **Fill in your `.env` variables** (See "Environment Variables" section).

5.  **Run the server:**

    ```bash
    npm run dev
    ```

    Your backend server should now be running on `http://localhost:5000` (or your specified `PORT`) and connected to MongoDB.

### 2\. Frontend Setup

1.  **Open a new terminal.**

2.  **Navigate to the frontend:**

    ```bash
    cd frontend
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Run the client:**

    ```bash
    npm run dev
    ```

    Your React application should now be running on `http://localhost:5173`.

-----

## ⚙️ Environment Variables

You must create a `.env` file in the `backend` folder.

#### `backend/.env.example`

```env
# Server Port
PORT=5000

# MongoDB Connection String (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://<username>:<password>@your-cluster.mongodb.net/YourDBName?retryWrites=true&w=majority

# JWT Secret (create a long, random string)
JWT_SECRET=YOUR_SUPER_SECRET_RANDOM_STRING_HERE
JWT_EXPIRE=30d

# Frontend URL (for CORS)
CORS_ORIGIN=http://localhost:5173

# Google API Keys
YOUTUBE_API_KEY=YOUR_YOUTUBE_DATA_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

**Important:** For Google OAuth, make sure you add the following to your "Authorized redirect URIs" in the Google Cloud Console:

  * `http://localhost:5000/api/auth/google/callback`

-----

## 🗺️ API Endpoints

All data routes are protected and require user authentication.

\<details\>
\<summary\>\<strong\>Click to expand API Route List\</strong\>\</summary\>

### Auth Routes (`/api/auth`)

  * `POST /register`: Create a new user account.
  * `POST /login`: Log in a user and set an `httpOnly` cookie.
  * `POST /logout`: Clear the auth cookie.
  * `GET /me`: Get the currently logged-in user's profile.
  * `GET /google`: Initiate Google OAuth 2.0 flow.
  * `GET /google/callback`: Callback URL for Google to redirect to.
  * `POST /guest`: Log in as a temporary guest user.

### Task Routes (`/api/tasks`)

  * `GET /`: Get all tasks for the logged-in user.
  * `POST /`: Create a new task.
  * `PUT /:id`: Update a task (e.g., mark as complete).
  * `DELETE /:id`: Delete a task.

### Calorie Routes (`/api/calories`)

  * `GET /`: Get all calorie records for the user.
  * `POST /`: Create a new calorie record ("gained" or "spent").

### Time Log Routes (`/api/log-time`)

  * `POST /`: Log a new completed timer session (Pomodoro, Timer, Stopwatch).

### Dashboard Routes (`/api/dashboard`)

  * `GET /analytics`: Get a combined payload of all tasks, logs, and calorie records for the dashboard.

### AI Routes

  * `POST /api/analyze`: Send a block of text and analysis type ("summary", "keypoints") to the Gemini AI.
  * `POST /api/youtube-search`: Send a search query to the YouTube API, then fetch transcripts and get AI summaries for each video.

\</details\>

## 🙏 Acknowledgements

  * Project inspired by components from [lovable.dev](https://lovable.dev/).
  * UI built with [shadcn/ui](https://ui.shadcn.com/).

## E-Sign - S@gar/P