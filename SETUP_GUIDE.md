# 🚀 Complete Setup Guide - User Management System

This guide will walk you through setting up the User Management System from scratch, including all dependencies, configurations, and deployment options.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Third-Party Services](#third-party-services)
6. [Development Setup](#development-setup)
7. [Troubleshooting](#troubleshooting)
8. [Testing](#testing)

## 🔧 Prerequisites

### Required Software

| Software    | Version | Purpose             | Installation                                               |
| ----------- | ------- | ------------------- | ---------------------------------------------------------- |
| **Node.js** | v18+    | Runtime environment | [Download](https://nodejs.org/)                            |
| **npm**     | v8+     | Package manager     | Included with Node.js                                      |
| **MongoDB** | v5+     | Database            | [Download](https://www.mongodb.com/try/download/community) |
| **Git**     | Latest  | Version control     | [Download](https://git-scm.com/)                           |

### Optional Software

| Software            | Purpose      | Installation                                         |
| ------------------- | ------------ | ---------------------------------------------------- |
| **MongoDB Compass** | Database GUI | [Download](https://www.mongodb.com/products/compass) |
| **Postman**         | API testing  | [Download](https://www.postman.com/)                 |
| **VS Code**         | Code editor  | [Download](https://code.visualstudio.com/)           |

## 📥 Installation Steps

### Step 1: Clone Repository

```bash
# Clone the repository
git clone <repository-url>
cd mern-ums-app

# Verify project structure
ls -la
# Should show: backend/ frontend/ README.md SETUP_GUIDE.md
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

## ⚙️ Configuration

### Backend Configuration

#### 1. Environment Variables

```bash
# In backend directory
cp env.example .env
```

Edit `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ums_db

# JWT Configuration (Generate strong secrets)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long
JWT_REFRESH_EXPIRE=30d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourcompany.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Security Configuration
CSRF_SECRET=your-csrf-secret-key-minimum-32-characters
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

#### 2. Generate Strong Secrets

```bash
# Generate JWT secrets (run in terminal)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Frontend Configuration

```bash
# In frontend directory
cp .env.example .env
```

Edit `.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=World IT UMS
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=User Management System

# Feature Flags
VITE_ENABLE_REGISTRATION=true
VITE_ENABLE_EMAIL_VERIFICATION=true
```

## 🗄️ Database Setup

### MongoDB Atlas (Cloud)

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Choose free tier
3. **Create Database User**: Set username/password
4. **Whitelist IP**: Add your IP address
5. **Get Connection String**: Copy connection string
6. **Update .env**: Replace `MONGODB_URI` with Atlas connection string

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ums_db?retryWrites=true&w=majority
```

#### Initialize Database

```bash
# In backend directory
npm run db:generate
npm run db:push

# Optional: Add test data
npm run seed:test-data
```

## 🌐 Third-Party Services

### Cloudinary Setup (Image Upload)

1. **Create Account**: Go to [Cloudinary](https://cloudinary.com/)
2. **Get Credentials**: From dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
3. **Update .env**: Add credentials to backend `.env`

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. **Test Configuration**:

```bash
# In backend directory
npm run test:cloudinary
```

### Email Service Setup

#### Mailtrap

1. **Create Account**: Go to [Mailtrap](https://mailtrap.io/)
2. **Create Inbox**: In your dashboard, create a new inbox for testing
3. **Get SMTP Credentials**: From your inbox settings, copy the SMTP credentials
4. **Update .env**:

```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password
EMAIL_FROM=noreply@yourcompany.com
```

> **Note**: Mailtrap is perfect for development and testing as it captures all emails without actually sending them. All emails will appear in your Mailtrap inbox for inspection.

4. **Test Configuration**:

```bash
# In backend directory
npm run test:email
```

## 🔧 Development Setup

### Start Development Servers

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

### Verify Setup

1. **Backend Health Check**:

   ```bash
   curl http://localhost:5000/api/health
   # Should return: {"status":"OK","timestamp":"..."}
   ```

2. **Frontend Access**:

   - Open browser: http://localhost:5173
   - Should see login page

3. **Database Connection**:
   ```bash
   # In backend directory
   npm run db:studio
   # Opens Prisma Studio in browser
   ```

### Development Tools

#### VS Code Extensions (Recommended)

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

#### Browser Extensions

- **React Developer Tools**

### Health Checks

#### Backend Health Check

```bash
curl -X GET http://localhost:5000/api/health
```

#### Database Health Check

```bash
# In backend directory
npm run db:studio
# Should open Prisma Studio
```

#### Email Test

```bash
# In backend directory
npm run test:email
```

#### Cloudinary Test

```bash
# In backend directory
npm run test:cloudinary
```

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

### Frontend Testing

```bash
cd frontend

# Run linting
npm run lint

# Build test
npm run build
```
