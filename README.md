# Smart Leads Dashboard

A full-stack web application for managing and tracking sales leads with role-based access control, authentication, and real-time data management.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Contributing](#contributing)

## ✨ Features

- **User Authentication**: Secure login and registration with Firebase
- **Role-Based Access Control (RBAC)**: Different permission levels for users
- **Lead Management**: Create, read, update, and delete leads
- **Advanced Filtering**: Filter leads by multiple criteria
- **Pagination**: Efficient data handling with pagination
- **CSV Export**: Export lead data to CSV format
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop

## 📁 Project Structure

```
Smart Leads Dashboard/
├── backend/                    # Node.js/TypeScript backend
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── config/
│   │   │   └── firebase.ts    # Firebase configuration
│   │   ├── controllers/       # Business logic
│   │   │   ├── auth.controller.ts
│   │   │   └── leads.controller.ts
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── auth.ts
│   │   │   └── rbac.ts
│   │   ├── routes/            # API routes
│   │   │   ├── auth.routes.ts
│   │   │   └── leads.controller.ts
│   │   └── types/             # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React/TypeScript frontend
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Main component
│   │   ├── api/
│   │   │   └── axios.ts       # API client configuration
│   │   ├── components/        # Reusable components
│   │   │   ├── Filters.tsx
│   │   │   ├── LeadForm.tsx
│   │   │   ├── LeadTable.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   └── useDebounce.ts
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/
│   │       └── csvExport.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── README.md                   # Project documentation

```

## 📦 Prerequisites

Make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Git**
- **Firebase Project** with credentials

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Smart Leads Dashboard"
```

### 2. Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

## 🔧 Backend Setup

### 1. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
JWT_SECRET=your_jwt_secret
```

### 2. Firebase Configuration

Update `src/config/firebase.ts` with your Firebase credentials:

```typescript
import * as admin from "firebase-admin";

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-project.firebaseio.com",
});

export default admin;
```

### 3. Build Backend

```bash
npm run build
```

## 💻 Frontend Setup

### 1. Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 2. Build Frontend

```bash
npm run build
```

## 🌍 Environment Variables

### Backend (.env)

| Variable     | Description                          |
| ------------ | ------------------------------------ |
| `PORT`       | Server port (default: 5000)          |
| `NODE_ENV`   | Environment (development/production) |
| `FIREBASE_*` | Firebase project credentials         |
| `JWT_SECRET` | Secret key for JWT tokens            |

### Frontend (.env)

| Variable          | Description                  |
| ----------------- | ---------------------------- |
| `VITE_API_URL`    | Backend API base URL         |
| `VITE_FIREBASE_*` | Firebase project credentials |

## ▶️ Running the Application

### Development Mode

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

The backend server will start at `http://localhost:5000`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

The frontend will start at `http://localhost:5173` (or another available port)

### Production Mode

#### Build

```bash
cd backend
npm run build

cd ../frontend
npm run build
```

#### Start Production Server

```bash
cd backend
npm start
```

## 🌐 GitHub Pages Deployment

The repository includes a GitHub Actions workflow at [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml) that deploys the frontend to GitHub Pages.

### Repository Setup in GitHub

1. Open the repository on GitHub.
2. Go to **Settings** > **Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to the `main` branch to trigger the deployment workflow automatically.

### Notes

- The frontend is configured with the GitHub Pages base path `/leads_dashboard/` in [frontend/vite.config.ts](frontend/vite.config.ts).
- If you rename the repository, update the `base` value in `frontend/vite.config.ts` to match the new repo path.
- You can also run the deployment manually from the **Actions** tab using the `workflow_dispatch` trigger.

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Leads Endpoints

- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get a specific lead
- `POST /api/leads` - Create a new lead
- `PUT /api/leads/:id` - Update a lead
- `DELETE /api/leads/:id` - Delete a lead
- `GET /api/leads/export/csv` - Export leads as CSV

### Request/Response Examples

See `API_DOCS.md` for detailed request/response examples and authentication requirements.

## 🛠️ Development

### Technologies Used

**Backend:**

- Node.js
- Express.js
- TypeScript
- Firebase Admin SDK
- JWT Authentication

**Frontend:**

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Context API

### Scripts

**Backend:**

```bash
npm run dev      # Start development server
npm run build    # Build TypeScript
npm run start    # Start production server
```

**Frontend:**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **RBAC**: Role-based access control middleware
- **Firebase Security**: Leverages Firebase security rules
- **Protected Routes**: Client-side route protection
- **Environment Variables**: Sensitive data not exposed

## 📝 Git Workflow

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Commit your changes
git commit -m "feat: description of changes"

# Push to remote
git push origin feature/your-feature-name

# Create a pull request
```

## 🐛 Troubleshooting

### Backend won't start

- Check if port 5000 is available
- Verify Firebase credentials in `.env`
- Run `npm install` again

### Frontend won't connect to backend

- Ensure backend is running on correct port
- Check `VITE_API_URL` in `.env`
- Verify CORS is enabled in backend

### Firebase authentication issues

- Verify Firebase credentials are correct
- Check Firebase Security Rules
- Ensure service account has proper permissions

## 📧 Support

For questions or issues, please contact the development team or create an issue in the repository.

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributors

- Your Name - Initial work

---

**Last Updated**: May 2026

# Smart Leads Dashboard

A full-stack lead management application built with the MERN stack + Firebase.

## Features

- JWT Authentication with bcrypt password hashing
- Role-Based Access Control (Admin / Sales)
- Full Lead CRUD (Create, Read, Update, Delete)
- Filter by Status, Source | Search by name/email
- Sort by newest/oldest | Backend pagination (10/page)
- CSV Export | Dark Mode | Responsive UI

## Tech Stack

**Frontend:** React, TypeScript, TailwindCSS, React Router, Axios  
**Backend:** Node.js, Express, TypeScript, Firebase Firestore, JWT, bcrypt

## Getting Started

1. Clone the repo
2. Set up Firebase and fill in `.env` (see `.env.example`)
3. `cd backend && npm install && npm run dev`
4. `cd frontend && npm install && npm run dev`

## API Endpoints

| Method | Endpoint           | Access     |
| ------ | ------------------ | ---------- |
| POST   | /api/auth/register | Public     |
| POST   | /api/auth/login    | Public     |
| GET    | /api/leads         | Auth       |
| POST   | /api/leads         | Auth       |
| PUT    | /api/leads/:id     | Auth       |
| DELETE | /api/leads/:id     | Admin only |
