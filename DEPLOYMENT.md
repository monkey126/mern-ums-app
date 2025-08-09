# MERN UMS Deployment Guide

This guide covers deploying the User Management System (UMS) application with:

- **Frontend**: Vercel (React/Vite)
- **Backend**: Render (Node.js/Express)
- **Database**: MongoDB Atlas

## Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to GitHub
2. **Accounts**:
   - [Vercel Account](https://vercel.com)
   - [Render Account](https://render.com)
   - [MongoDB Atlas Account](https://www.mongodb.com/atlas)
   - [Cloudinary Account](https://cloudinary.com) (for image uploads)

## Part 1: Database Setup (MongoDB Atlas)

### 1.1 Create MongoDB Atlas Cluster

1. Log into [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new project or use existing one
3. Click "Build a Database" → Choose "Free" tier
4. Select a cloud provider and region
5. Name your cluster (e.g., `ums-production`)
6. Click "Create Cluster"

### 1.2 Configure Database Access

1. **Database Access**:

   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Username: `ums-user` (or your preference)
   - Generate a secure password and save it
   - Database User Privileges: "Read and write to any database"

2. **Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is needed for Render to connect

### 1.3 Get Connection String

1. Go to "Clusters" → Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `ums_production`

Example: `mongodb+srv://ums-user:yourpassword@cluster0.xxxxx.mongodb.net/ums_production?retryWrites=true&w=majority`

## Part 2: Backend Deployment (Render)

### 2.1 Create Web Service

1. Log into [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select your repository and click "Connect"

### 2.2 Configure Service Settings

**Basic Settings:**

- **Name**: `ums-backend` (or your preference)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your production branch)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 2.3 Environment Variables

Add these environment variables in Render dashboard:

```bash
# Database
MONGODB_URI=mongodb+srv://ums-user:yourpassword@cluster0.xxxxx.mongodb.net/ums_production?retryWrites=true&w=majority

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-minimum-32-characters

# Email Configuration (Gmail example)
EMAIL_FROM=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Frontend URL (will update after Vercel deployment)
FRONTEND_URL=https://your-app-name.vercel.app

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Server Configuration
NODE_ENV=production
PORT=10000
```

### 2.4 Generate Strong Secrets

Use this command to generate secure JWT secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.5 Deploy Backend

1. Click "Create Web Service"
2. Wait for the build and deployment to complete
3. Note your backend URL: `https://your-service-name.onrender.com`

## Part 3: Frontend Deployment (Vercel)

### 3.1 Deploy to Vercel

1. Log into [Vercel](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Click "Import" on your repository

### 3.2 Configure Build Settings

Vercel should auto-detect Vite. If not, configure:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3.3 Environment Variables

Add this environment variable in Vercel dashboard:

```bash
VITE_API_URL=https://your-backend-service.onrender.com/api
```

Replace `your-backend-service` with your actual Render service name.

### 3.4 Deploy Frontend

1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL: `https://your-project.vercel.app`

## Part 4: Final Configuration

### 4.1 Update Backend FRONTEND_URL

1. Go back to your Render service
2. Update the `FRONTEND_URL` environment variable with your Vercel URL
3. Trigger a new deployment

### 4.2 Test Deployment

1. Visit your Vercel frontend URL
2. Try registering a new account
3. Check email verification
4. Test login functionality
5. Verify all features work correctly
