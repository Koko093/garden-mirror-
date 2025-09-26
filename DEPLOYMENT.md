# Garden Mirror - Deployment Guide

This guide covers deploying the Garden Mirror Event Management System to various platforms.

## 🏗️ Architecture Overview

- **Frontend**: React.js with TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js/Express.js with MongoDB
- **Database**: MongoDB (with Mongoose ODM)
- **Authentication**: JWT-based authentication system

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

#### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_ENVIRONMENT=production
REACT_APP_PAYMONGO_PUBLIC_KEY=pk_live_your_public_key_here
```

#### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/garden-mirror

# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# PayMongo Configuration
PAYMONGO_SECRET_KEY=sk_live_your_secret_key_here
PAYMONGO_PUBLIC_KEY=pk_live_your_public_key_here
PAYMONGO_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@gardenmirror.com

# Security
BCRYPT_ROUNDS=12

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp,application/pdf

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### 2. Database Setup

#### Option A: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create database user and get connection string
4. Whitelist your deployment platform's IP addresses
5. Update `MONGODB_URI` in your backend environment variables

#### Option B: Self-hosted MongoDB
1. Set up MongoDB instance on your preferred cloud provider
2. Configure network access and security
3. Update connection string accordingly

## 🚀 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend Deployment on Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project root**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings
   - Add environment variables:
     - `REACT_APP_API_URL`
     - `REACT_APP_ENVIRONMENT`

#### Backend Deployment on Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Deploy backend**
   ```bash
   cd backend
   railway init
   railway up
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set MONGODB_URI=your-mongodb-connection-string
   railway variables set JWT_SECRET=your-jwt-secret
   railway variables set NODE_ENV=production
   railway variables set FRONTEND_URL=https://your-vercel-domain.vercel.app
   ```

### Option 2: Netlify (Frontend) + Render (Backend)

#### Frontend Deployment on Netlify

1. **Connect GitHub Repository**
   - Go to [Netlify](https://www.netlify.com/)
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

2. **Environment Variables**
   - Add in Netlify site settings:
     - `REACT_APP_API_URL`
     - `REACT_APP_ENVIRONMENT`

#### Backend Deployment on Render

1. **Connect Repository**
   - Go to [Render](https://render.com/)
   - Create new Web Service
   - Connect your GitHub repository
   - Set root directory to `backend`

2. **Configuration**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node

3. **Environment Variables**
   - Add all backend environment variables in Render dashboard

### Option 3: Full Stack on Render

1. **Backend Service**
   - Create Web Service for backend
   - Root directory: `backend`
   - Build: `npm install`
   - Start: `npm start`

2. **Frontend Service**
   - Create Static Site for frontend
   - Build: `npm run build`
   - Publish: `build`

## 🛠️ Build Configuration

### Frontend Build Optimization

Update `package.json` build script for optimization:

```json
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build"
  }
}
```

### Backend Production Settings

The backend is already configured for production with:
- Helmet for security headers
- CORS configuration
- Rate limiting
- Compression
- Error handling
- Health check endpoint

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong JWT secrets
   - Use environment-specific database URLs

2. **CORS Configuration**
   - Set specific frontend URLs in production
   - Avoid using wildcard (*) in production

3. **Rate Limiting**
   - Configure appropriate limits based on your needs
   - Monitor for abuse

4. **Database Security**
   - Use MongoDB Atlas with IP whitelisting
   - Use strong database passwords
   - Enable authentication

## 📊 Monitoring & Maintenance

### Health Checks

The backend includes a health check endpoint:
```
GET /api/health
```

### Logging

Add logging service like:
- Railway Logs (built-in)
- Render Logs (built-in)
- External: LogRocket, Sentry

### Database Backups

- MongoDB Atlas: Automatic backups included
- Self-hosted: Set up regular backup schedules

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `FRONTEND_URL` matches your deployed frontend domain
   - Check CORS configuration in backend

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check IP whitelist settings
   - Ensure database user has proper permissions

3. **Build Failures**
   - Check all dependencies are listed in `package.json`
   - Verify environment variables are set
   - Check build logs for specific errors

4. **API Endpoint Not Found**
   - Verify API URL in frontend environment variables
   - Check backend deployment status
   - Ensure all routes are properly configured

### Debug Commands

```bash
# Check backend logs on Railway
railway logs

# Check frontend build on Vercel
vercel logs

# Test API endpoints
curl https://your-backend-url.com/api/health
```

## 📈 Scaling Considerations

### Performance Optimization

1. **Frontend**
   - Code splitting with React.lazy()
   - Image optimization
   - CDN for static assets

2. **Backend**
   - Database indexing
   - Caching strategies
   - Load balancing (for high traffic)

3. **Database**
   - Connection pooling
   - Query optimization
   - Read replicas (for high read loads)

## 🆘 Support

If you encounter issues during deployment:

1. Check the deployment platform's documentation
2. Review error logs carefully
3. Verify all environment variables are set correctly
4. Test API endpoints individually
5. Check database connectivity

## 📝 Post-Deployment Steps

1. **Test all functionality**
   - User registration and login
   - Admin dashboard access
   - Reservation system
   - Payment flow
   - Email notifications

2. **Set up monitoring**
   - Uptime monitoring
   - Error tracking
   - Performance monitoring

3. **Configure backups**
   - Database backups
   - File storage backups

4. **Set up alerts**
   - Downtime alerts
   - Error rate alerts
   - Performance alerts

---

## 🎉 Congratulations!

Your Garden Mirror Event Management System should now be live and accessible to users. Remember to:

- Monitor the application regularly
- Keep dependencies updated
- Backup your database regularly
- Monitor for security vulnerabilities
- Scale resources as needed based on usage

For ongoing support and updates, refer to the project documentation and maintain good DevOps practices.