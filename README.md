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

## Lead Allocation Extension

This version adds a production-style lead intake and allocation flow on top of the existing app. The backend now stores leads, providers, assignments, allocation state, and webhook events in Firestore-backed collections. Lead creation is deterministic: the same phone number plus service type is rejected at the database layer, mandatory providers are always assigned first, and the remaining provider slots are filled by a persistent round-robin cursor.

Concurrency is handled inside a Firestore transaction. The transaction reads the target lead document, the providers needed for the service, and the persisted allocation cursor, then writes the lead, assignments, quota updates, and next cursor value as one atomic unit. That prevents duplicate providers, quota overruns, and round-robin drift during simultaneous requests.

Webhook idempotency uses a `webhookEvents` collection keyed by `eventId`. If the same reset webhook is received again, the transaction sees the existing event record and exits without applying quota resets a second time.

## 📁 Project Structure

```
Smart Leads Dashboard/
├── backend/                    # Node.js/TypeScript backend
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── config/
│   │   │   └── firebase.ts    # Firebase configuration
│   │   ├── models/
│   │   │   └── domain.ts      # Lead, provider, assignment, and webhook models
│   │   ├── controllers/       # Business logic
│   │   │   ├── auth.controller.ts
│   │   │   ├── dashboard.controller.ts
│   │   │   ├── leads.controller.ts
│   │   │   └── webhooks.controller.ts
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── auth.ts
│   │   │   └── rbac.ts
│   │   ├── routes/            # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   ├── leads.routes.ts
│   │   │   └── webhooks.routes.ts
│   │   ├── services/          # Reusable domain services
│   │   │   ├── allocation.service.ts
│   │   │   ├── localStore.ts
│   │   │   └── webhook.service.ts
│   │   ├── seed.ts            # Seed script for services and providers
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
│   │   │   ├── ProviderDashboard.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── RequestService.tsx
│   │   │   └── TestTools.tsx
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
4. Go to **Settings** > **Secrets and variables** > **Actions** > **Variables**.
5. Add a variable named `VITE_API_URL` with your Cloud Run backend API URL, for example `https://your-service-xyz-uc.a.run.app/api`.
6. Push to the `main` branch to trigger the deployment workflow automatically.

If you prefer to keep the Cloud Run URL in a separate variable, you can set `CLOUD_RUN_API_URL` instead and leave `VITE_API_URL` unset.

The frontend build now fails fast if no production API URL is provided, which prevents GitHub Pages from shipping a placeholder backend address.

### Notes

- The frontend is configured with the GitHub Pages base path `/leads_dashboard/` in [frontend/vite.config.ts](frontend/vite.config.ts).
- If you rename the repository, update the `base` value in `frontend/vite.config.ts` to match the new repo path.
- You can also run the deployment manually from the **Actions** tab using the `workflow_dispatch` trigger.
- The deployed frontend reads the API URL from the Actions variable and should point at the Cloud Run service, not the old Render host.

## 🚢 Cloud Run Backend Deployment

The backend includes a Cloud Run deployment workflow at [.github/workflows/deploy-cloud-run.yml](.github/workflows/deploy-cloud-run.yml).

Before using it, configure these GitHub Actions values:

- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT_EMAIL`
- `GCP_PROJECT_ID`
- `JWT_SECRET`
- `CLOUD_RUN_SERVICE_NAME`
- `CLOUD_RUN_REGION`
- `CLOUD_RUN_CORS_ORIGIN`
- `CLOUD_RUN_RUNTIME_SERVICE_ACCOUNT_EMAIL`

After deployment, copy the Cloud Run service URL into `VITE_API_URL` so the GitHub Pages frontend uses the new stable backend endpoint.

The backend now uses Google application default credentials on Cloud Run, so the runtime service account needs Firestore access, but you do not need to store a Firebase private key in GitHub secrets.

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Leads Endpoints

- `POST /api/leads` - Create a new lead and trigger allocation

### Dashboard Endpoints

- `GET /api/dashboard/services` - List the seeded service types
- `GET /api/dashboard/providers` - List all providers
- `GET /api/dashboard/providers/:providerId` - Get provider dashboard data and assigned leads

### Webhook Endpoints

- `POST /api/webhooks/reset-quota` - Idempotent quota reset webhook

### Seed

- `npm run seed` - Seed the three services, eight providers, and default allocation state after building the backend

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

### Allocation Strategy

Each service has a mandatory provider set and a fair round-robin pool. The allocation cursor is stored in Firestore so it survives restarts. For each new lead, the backend locks the relevant documents in a transaction, creates the lead once, assigns the mandatory providers, then fills the remaining slots from the fair pool while skipping exhausted or inactive providers.

### Concurrency Handling

The transaction reads the lead uniqueness document, provider quota documents, and allocation state before writing any updates. Lead uniqueness is enforced through a deterministic lead document ID derived from phone number plus service type. Provider assignments use deterministic compound document IDs as well, so the same provider cannot be attached to the same lead twice.

### Idempotency Handling

Webhook reset requests write a `webhookEvents` document keyed by `eventId`. If the event already exists, the transaction exits without resetting quotas again. That makes repeated deliveries safe.

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
