# 🚀 Expat Ease - Deployment Guide

## Frontend Deployment (Vercel/Netlify)

### 1. Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_URL=https://your-backend-domain.com
```

### 2. Build Command

```bash
npm run build
```

### 3. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com`

### 4. Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable: `VITE_API_URL=https://your-backend-url.com`

## Backend Deployment (Railway/Render/Heroku)

### Required Environment Variables

```
DATABASE_URL=postgresql://user:password@host:port/database
FRONTEND_URL=https://your-frontend-domain.com
SECRET_KEY=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Database Migration

For production, you'll need to:

1. Set up a PostgreSQL database
2. Update DATABASE_URL in environment variables
3. Run database migrations

## Current Status

✅ Frontend builds successfully
✅ Environment variables configured
✅ API URLs made configurable
⚠️ Backend needs production database
⚠️ Backend needs production deployment setup
