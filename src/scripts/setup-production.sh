#!/bin/bash

# Production Setup Script for Garden Mirror
echo "🚀 Garden Mirror Production Setup"
echo "=================================="

# Function to generate random string
generate_secret() {
    openssl rand -base64 32
}

# Create production environment files
echo "📄 Creating production environment configuration..."

# Frontend production environment
cat > .env.production << EOF
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_ENVIRONMENT=production
EOF

# Backend production environment
JWT_SECRET=$(generate_secret)
cat > backend/.env.production << EOF
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/garden_mirror

# Server Configuration
NODE_ENV=production
PORT=5000

# JWT Configuration (GENERATED - KEEP SECURE)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# CORS Configuration
FRONTEND_URL=https://your-frontend-domain.com

# Admin Configuration
ADMIN_EMAIL=admin@gardenmirror.com
ADMIN_PASSWORD=change-this-secure-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

echo "✅ Production environment files created"
echo ""
echo "🔧 Next Steps:"
echo "1. Update MongoDB URI in backend/.env.production"
echo "2. Update email configuration"
echo "3. Update frontend/backend domains"
echo "4. Change default admin password"
echo "5. Deploy to your chosen platform"
echo ""
echo "📋 Platform-specific deployment:"
echo "- Vercel + Railway: Follow DEPLOYMENT.md section"
echo "- Docker: Use docker-compose.yml"
echo "- Manual: Copy .env.production to .env on servers"
echo ""
echo "🔒 Security Reminders:"
echo "- Never commit .env files to version control"
echo "- Use strong passwords and secrets"
echo "- Enable HTTPS in production"
echo "- Configure proper CORS origins"
echo "- Set up database backups"