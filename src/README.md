# Garden Mirror Event Management System

## Overview
Garden Mirror is a comprehensive event management reservation system built with the MERN stack (MongoDB, Express.js, React, Node.js). The system provides customer-facing pages for browsing and booking events, an admin dashboard for managing bookings and analytics, and integrated customer support features.

## System Architecture

### Frontend (React + TypeScript + Tailwind CSS)
- **Customer Pages**: Home, About, Packages, Gallery, Contact, Reviews
- **Reservation System**: Interactive calendar booking with real-time availability
- **User Authentication**: Registration, login, profile management
- **Admin Dashboard**: Comprehensive management interface
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend (Node.js + Express.js)
- **RESTful API**: Complete API endpoints for all system operations
- **Authentication**: JWT-based authentication for users and admins
- **Role-based Access**: Different permissions for customers and administrators
- **File Management**: Support for image uploads and document generation
- **Rate Limiting**: Protection against abuse and spam

### Database (MongoDB)
- **Users**: Customer accounts with profile information
- **Admins**: Administrative accounts with role-based permissions
- **Reservations**: Event bookings with status tracking
- **Payments**: Financial transactions and payment history
- **Rooms**: Venue spaces with capacity and pricing
- **Packages**: Event packages with inclusions and pricing
- **Events**: Event types and categories
- **Feedback**: Customer reviews and ratings
- **File Management**: Document and image storage tracking

## Key Features

### Customer Features
- **Event Browsing**: View available packages and venues
- **Real-time Booking**: Interactive calendar with availability checking
- **Profile Management**: Update personal information and preferences
- **Booking History**: Track past and upcoming reservations
- **Reviews System**: Submit and view feedback
- **Payment Tracking**: Monitor payment status and history
- **Chatbot Support**: AI-powered customer assistance

### Admin Features
- **Dashboard Analytics**: Comprehensive business metrics and KPIs
- **Reservation Management**: Complete booking oversight and control
- **Manual Booking**: Walk-in reservation creation
- **Payment Processing**: Downpayment tracking and balance management
- **Room Management**: Add, edit, and manage venue spaces
- **Package Management**: Create and modify event packages
- **User Management**: Customer account oversight
- **Settings Configuration**: System-wide configuration management
- **Invoice Generation**: Automated billing and receipt creation
- **Export Capabilities**: Data export for reporting

### Payment System
- **Two-Phase Payment**: 30% downpayment upon reservation, 70% balance payment
- **Configurable Rates**: Adjustable downpayment percentages
- **Payment Tracking**: Complete transaction history
- **Invoice Generation**: Automated billing documents
- **Receipt Management**: Digital receipt system

## Technology Stack

### Frontend Dependencies
- **React 18**: Component-based UI framework
- **TypeScript**: Type-safe JavaScript development
- **React Router**: Client-side routing
- **React Query**: Server state management
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: Pre-built component library
- **Lucide React**: Icon library
- **Sonner**: Toast notifications
- **Motion**: Animation library

### Backend Dependencies
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Multer**: File upload handling
- **Compression**: Response compression

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/garden-mirror
   JWT_SECRET=your-jwt-secret-key
   FRONTEND_URL=http://localhost:3000
   ```

4. Seed the database (optional):
   ```bash
   npm run seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password

### Reservations
- `GET /api/reservations` - Get all reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id` - Update reservation
- `POST /api/reservations/check-availability` - Check availability

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room (admin)
- `PUT /api/rooms/:id` - Update room (admin)
- `DELETE /api/rooms/:id` - Delete room (admin)

### Packages
- `GET /api/packages` - Get all packages
- `POST /api/packages` - Create package (admin)
- `PUT /api/packages/:id` - Update package (admin)
- `DELETE /api/packages/:id` - Delete package (admin)

### Admin
- `GET /api/admin/analytics` - Get dashboard analytics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/payments` - Get payment history
- `POST /api/admin/payments` - Process payment
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings

## Deployment

### Production Build
1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Deploy to your preferred hosting platform (Vercel, Netlify, AWS, etc.)

### Environment Variables
Make sure to set all required environment variables in production:
- Database connection strings
- JWT secrets
- API URLs
- File storage configuration

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
This project is licensed under the MIT License.

## Support
For support and questions, please contact the development team or create an issue in the repository.