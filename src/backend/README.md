# Garden Mirror Backend API

This is the Node.js/Express backend for the Garden Mirror Event Management System.

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb/brew/mongodb-community

   # On Ubuntu
   sudo systemctl start mongod

   # On Windows
   net start MongoDB
   ```

3. **Seed the Database** (First time only)
   ```bash
   npm run seed
   ```

4. **Start the Server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

The server will start on http://localhost:5000

## Default Credentials

After seeding the database, you can use these credentials:

**Admin Login:**
- Username: `admin`
- Password: `admin123`

**User Logins:**
- Email: `sarah.johnson@email.com` / Password: `password123`
- Email: `michael.chen@email.com` / Password: `password123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/admin/login` - Admin login

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room (Admin)
- `PUT /api/rooms/:id` - Update room (Admin)
- `DELETE /api/rooms/:id` - Delete room (Admin)

### Packages
- `GET /api/packages` - Get all packages
- `POST /api/packages` - Create package (Admin)
- `PUT /api/packages/:id` - Update package (Admin)
- `DELETE /api/packages/:id` - Delete package (Admin)

### Reservations
- `GET /api/reservations` - Get all reservations (Admin)
- `GET /api/reservations/my-reservations` - Get user reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/:id` - Update reservation (Admin)
- `POST /api/reservations/check-availability` - Check room availability

### Feedback
- `GET /api/feedback` - Get public feedback
- `GET /api/feedback/admin` - Get all feedback (Admin)
- `POST /api/feedback` - Submit feedback
- `PUT /api/feedback/:id` - Update feedback visibility (Admin)
- `DELETE /api/feedback/:id` - Delete feedback (Admin)

### Admin
- `GET /api/admin/analytics` - Get dashboard analytics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/payments` - Get payment records
- `POST /api/admin/payments` - Process payment
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update system settings

## Environment Variables

Copy `.env.example` to `.env` and update the values as needed:

```bash
cp .env.example .env
```

## Database Schema

The system uses MongoDB with Mongoose ODM. Models are located in the `/models` directory:

- `User.js` - Customer user accounts
- `Admin.js` - Admin user accounts
- `Room.js` - Event venues/rooms
- `Package.js` - Event packages
- `Reservation.js` - Booking reservations
- `Feedback.js` - Customer feedback

## Development Notes

- The API includes CORS support for frontend integration
- Rate limiting is enabled to prevent abuse
- JWT tokens are used for authentication
- Input validation is implemented using express-validator
- File upload support is available via multer

## Troubleshooting

1. **MongoDB Connection Issues**
   - Make sure MongoDB is running
   - Check the `MONGODB_URI` in your `.env` file
   - Ensure MongoDB is accessible on the specified port

2. **Port Already in Use**
   - Change the `PORT` value in `.env`
   - Kill any existing processes using port 5000

3. **CORS Issues**
   - Update `FRONTEND_URL` in `.env` to match your frontend URL
   - Ensure the frontend is running on the specified URL