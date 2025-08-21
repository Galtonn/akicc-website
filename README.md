# AKICC Website

A complete e-commerce website for AKICC, a company that sells printers, printer parts, and provides maintenance/fixing services.

## Features

### 🏠 Home Page
- Hero banner with company introduction
- Three product sections: Hot Products, New Arrivals, Open Box
- Call-to-action buttons
- Responsive design

### 🛍️ Products Page
- Product catalog with search functionality
- Category filtering
- Product sorting (newest, name, price)
- Add to "My List" functionality
- Product details view

### 👤 User Authentication
- User registration with account types (Dealer/End User)
- Login/logout functionality
- Protected routes
- JWT token authentication

### 📋 My List Feature
- Save products to personal list
- Remove products from list
- Send list to admin for quotes
- List management interface

### 📞 Contact & Booking
- Two types of contact forms:
  - **Booking Form**: For service appointments and quotes
  - **General Inquiry Form**: For general questions
- Email notifications to admin
- Database storage for bookings

### ℹ️ About Page
- Company information and services
- Professional printer solutions overview
- Company values and benefits

### 🔧 Admin Panel
- Product management (Add, Edit, Delete)
- Booking management
- Sent lists tracking
- User management
- Admin-only access

## Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database
- **JWT** for authentication
- **Multer** for file uploads
- **Nodemailer** for email functionality
- **bcryptjs** for password hashing

### Frontend
- **React.js** with hooks
- **React Router** for navigation
- **Axios** for API calls
- **React Icons** for icons
- **React Toastify** for notifications
- **Custom CSS** with responsive design

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd akicc-website
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

### 3. Environment Setup

Create a `.env` file in the server directory:
```env
PORT=5000
JWT_SECRET=your-secret-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Note**: For email functionality, you'll need to:
1. Use a Gmail account
2. Enable 2-factor authentication
3. Generate an app password
4. Use the app password in EMAIL_PASS

### 4. Create uploads directory
```bash
mkdir server/uploads
```

### 5. Start the application

#### Development mode (both frontend and backend)
```bash
npm run dev
```

#### Or start separately:

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

### 6. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Admin Account

The system creates a default admin account on first run:
- **Username**: admin
- **Password**: admin123
- **Email**: admin@akicc.com

**Important**: Change the default password after first login!

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Add product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### My List
- `GET /api/mylist` - Get user's list
- `POST /api/mylist` - Add product to list
- `DELETE /api/mylist/:productId` - Remove product from list
- `POST /api/mylist/send` - Send list to admins

### Contact
- `POST /api/contact/booking` - Send booking request
- `POST /api/contact/inquiry` - Send general inquiry

### Admin
- `GET /api/bookings` - Get all bookings (admin only)
- `GET /api/sent-lists` - Get sent lists (admin only)

## Database Schema

### Users
- id, username, email, password, userType, createdAt

### Products
- id, name, brand, model, serialNumber, description, image, dealerPrice, endUserPrice, category, createdAt

### My Lists
- id, userId, productId, createdAt

### Sent Lists
- id, userId, productIds, sentAt

### Bookings
- id, email, phone, companyName, senderName, bookingDetails, createdAt

## File Structure

```
akicc-website/
├── client/                 # React frontend
│   ├── public/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.js
├── server/                 # Node.js backend
│   ├── uploads/           # File uploads directory
│   └── index.js           # Main server file
├── package.json
└── README.md
```

## Features in Detail

### Product Management
- **Categories**: hot, new, openbox, parts, supplies
- **Pricing**: Separate dealer and end-user pricing
- **Images**: File upload support with fallback
- **Search**: Product name search functionality
- **Filtering**: Category-based filtering

### User Types
- **End User**: Standard pricing, individual orders
- **Dealer**: Wholesale pricing, bulk order features
- **Admin**: Full system access

### Email Notifications
- Booking requests sent to admin email
- General inquiries sent to admin email
- Product list requests sent to admin email
- All emails include detailed information

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Protected admin routes
- Input validation and sanitization

## Customization

### Styling
The website uses custom CSS classes. Main styling is in `client/src/index.css`.

### Categories
Product categories can be modified in the admin panel and include:
- Hot Products
- New Arrivals
- Open Box
- Parts
- Supplies

### Email Configuration
Update the email settings in the server's `.env` file and the email templates in `server/index.js`.

## Deployment

### Backend Deployment
1. Set up a Node.js hosting service (Heroku, DigitalOcean, etc.)
2. Configure environment variables
3. Set up a production database (PostgreSQL recommended)
4. Deploy the server directory

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy the build folder to a static hosting service (Netlify, Vercel, etc.)
3. Update API endpoints to point to your production backend

### Database Migration
For production, consider migrating from SQLite to PostgreSQL or MySQL for better performance and scalability.

## Support

For technical support or questions about the AKICC website, please contact the development team.

## License

This project is proprietary software developed for AKICC. All rights reserved. 