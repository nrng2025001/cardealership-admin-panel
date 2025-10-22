# 🚗 Automotive Admin Dashboard

> **Full-featured admin dashboard for car dealership management** - Connected to backend API at `https://automotive-backend-frqe.onrender.com/api`

[![Status](https://img.shields.io/badge/Status-Production_Ready-success)]()
[![Backend](https://img.shields.io/badge/Backend-Connected-blue)]()
[![Auth](https://img.shields.io/badge/Auth-Firebase-orange)]()

---

## 🎯 Overview

Complete admin dashboard with real-time backend integration for managing:
- 👥 Users & Roles (ADMIN, GM, SM, TL, Advisors)
- 📤 Bulk Booking Imports (Excel/CSV)
- 🚗 Bookings with Timeline Tracking
- 📋 Enquiries (HOT/LOST/BOOKED categories)
- 💰 Quotations & Approvals
- 📦 Vehicle/Stock Inventory
- 📊 Real-time Dashboard Statistics

---

## ⚡ Quick Start

### 1. Install Dependencies (if not done)
   ```bash
   npm install
   ```

### 2. Environment Setup
Make sure `.env` file exists with Firebase credentials:
```bash
cat .env
```

Should contain:
```env
VITE_API_BASE_URL=https://automotive-backend-frqe.onrender.com/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. Run the Dashboard
   ```bash
   npm run dev
   ```

### 4. Access the Dashboard
   - **Local:** http://localhost:5173
   - **Production:** https://automotive-dashboard-ten.vercel.app

---

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Material-UI (MUI)** for components
- **Vite** for build tooling
- **Firebase Auth** for authentication
- **Axios** for API communication

### Backend Integration
- **REST API** at `https://automotive-backend-frqe.onrender.com/api`
- **Real-time data** synchronization
- **Role-based access control**
- **JWT token authentication**

---

## 📱 Features

### 🔐 Authentication & Authorization
- **Firebase Authentication** integration
- **Role-based access control** (ADMIN, GM, SM, TL, Advisors)
- **Protected routes** with automatic redirects
- **Session management** with token refresh

### 👥 User Management
- **Create/Edit/Delete** users
- **Role assignment** and management
- **User profile** management
- **Bulk user operations**

### 🚗 Booking Management
- **Complete CRUD** operations
- **Timeline tracking** (PENDING → ASSIGNED → IN_PROGRESS → CONFIRMED → DELIVERED)
- **Advisor assignment** with bulk operations
- **Status management** and updates
- **Customer information** tracking

### 📋 Enquiry Management
- **Enquiry tracking** (OPEN → IN_PROGRESS → CLOSED)
- **Category classification** (HOT/LOST/BOOKED)
- **Customer communication** history
- **Conversion tracking** to bookings

### 💰 Quotation Management
- **Quote generation** and management
- **Approval workflows**
- **Pricing management**
- **Customer communication**

### 📦 Stock/Inventory Management
- **Vehicle inventory** tracking
- **Stock levels** monitoring
- **Availability** management
- **Bulk operations**

### 📊 Dashboard & Analytics
- **Real-time statistics** and KPIs
- **Visual charts** and graphs
- **Performance metrics**
- **Status summaries** with breakdowns
- **Recent activity** tracking

### 📤 Bulk Operations
- **Excel/CSV import** for bookings
- **Bulk data processing**
- **Error handling** and validation
- **Progress tracking**

---

## 🚀 Advanced Features

### 📥 Bulk Download
- **Excel/JSON export** for bookings and enquiries
- **Date range filtering**
- **Status and category filtering**
- **Advisor filtering** for bookings
- **Progress indicators** and notifications

### 📊 Status Analytics
- **Real-time status summaries** on dashboard
- **Visual breakdown charts** with progress bars
- **Trend indicators** (up/down/stable)
- **Recent activity** tracking (7 days)

### 📤 Enhanced Upload
- **Drag & drop** file upload interface
- **File validation** (.xlsx, .xls, .csv)
- **Upload progress** tracking
- **Success/error feedback** with statistics
- **Template download** support

### 🔄 Advisor Assignment
- **Bulk assignment** of bookings to advisors
- **Auto-assignment** with multiple strategies (Round Robin, Least Load, Random)
- **Unassign** functionality
- **Assignment history** tracking

---

## 🛠️ Development

### Project Structure
```
src/
├── api/                 # API client and services
├── components/          # Reusable UI components
│   ├── common/         # Common components (DownloadButton, EnhancedUpload)
│   ├── dashboard/      # Dashboard-specific components
│   ├── forms/          # Form components
│   └── tables/         # Data table components
├── context/            # React context (AuthContext)
├── layouts/            # Layout components
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   ├── bookings/       # Booking management
│   ├── dashboard/      # Dashboard page
│   ├── dealership/     # Dealership management
│   ├── employees/      # Employee management
│   ├── enquiries/      # Enquiry management
│   ├── quotations/     # Quotation management
│   └── stocks/         # Stock management
├── theme/              # Material-UI theme
└── utils/              # Utility functions
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Environment Variables
```env
VITE_API_BASE_URL=https://automotive-backend-frqe.onrender.com/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

---

## 🚀 Deployment

### Vercel Deployment
The project is configured for automatic deployment on Vercel:

1. **Connect to GitHub** repository
2. **Automatic builds** on push to main branch
3. **Environment variables** configured in Vercel dashboard
4. **Custom domain** support

### Production URLs
- **Main:** https://automotive-dashboard-ten.vercel.app
- **Direct:** https://automotive-dashboard-a4nm8vzvi-nrng2025001s-projects.vercel.app

---

## 🔧 Configuration

### Firebase Setup
1. Create Firebase project
2. Enable Authentication
3. Configure sign-in methods
4. Add environment variables

### Backend API
- **Base URL:** `https://automotive-backend-frqe.onrender.com/api`
- **Authentication:** Firebase JWT tokens
- **CORS:** Configured for Vercel domain

---

## 📚 API Integration

### Authentication
```typescript
// Firebase token automatically added to requests
const response = await apiClient.get('/bookings');
```

### Data Fetching
```typescript
// Paginated data with filters
const bookings = await bookingAPI.getBookings({
  page: 1,
  limit: 20,
  status: 'PENDING'
});
```

### Bulk Operations
```typescript
// Bulk download with filters
const blob = await bookingAPI.downloadBookings({
  format: 'excel',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  status: 'CONFIRMED'
});
```

---

## 🎯 User Roles & Permissions

### ADMIN
- Full access to all features
- User management
- System configuration
- Bulk operations

### GENERAL_MANAGER (GM)
- Booking management
- Enquiry management
- Quotation approval
- Reporting access

### SALES_MANAGER (SM)
- Team management
- Booking oversight
- Performance tracking
- Limited admin access

### TEAM_LEAD (TL)
- Team coordination
- Booking assignment
- Customer management
- Limited reporting

### CUSTOMER_ADVISOR
- Customer interaction
- Booking updates
- Enquiry management
- Basic reporting

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Authentication Issues
```bash
# Clear browser cache
# Check Firebase configuration
# Verify environment variables
```

#### 2. API Connection Issues
```bash
# Check backend status
# Verify CORS configuration
# Check network connectivity
```

#### 3. Build Issues
```bash
# Clear node_modules
npm install
npm run build
```

### Debug Mode
```bash
# Enable debug logging
localStorage.setItem('debug', 'true');
```

---

## 📈 Performance

### Optimization Features
- **Code splitting** with Vite
- **Lazy loading** for routes
- **Memoization** for expensive operations
- **Efficient re-rendering** with React hooks
- **Bundle optimization** with manual chunks

### Monitoring
- **Console logging** for debugging
- **Error boundaries** for error handling
- **Performance metrics** tracking
- **User interaction** analytics

---

## 🔒 Security

### Authentication
- **Firebase JWT** tokens
- **Automatic token refresh**
- **Role-based access control**
- **Protected routes**

### Data Protection
- **HTTPS** encryption
- **Secure API** communication
- **Input validation**
- **XSS protection**

---

## 📞 Support

### Documentation
- **API Reference:** See `BACKEND_API_REFERENCE.md`
- **Integration Guide:** See `INTEGRATION_GUIDE.md`
- **Troubleshooting:** See `TROUBLESHOOTING.md`

### Contact
- **Repository:** https://github.com/nrng2025001/cardealership-admin-panel
- **Issues:** GitHub Issues tab
- **Documentation:** README files in project

---

## 🎉 Success Metrics

### Implemented Features
✅ **Complete CRUD operations** for all entities  
✅ **Real-time dashboard** with analytics  
✅ **Bulk operations** (import/export)  
✅ **Role-based access control**  
✅ **Firebase authentication**  
✅ **Responsive design**  
✅ **TypeScript implementation**  
✅ **Production deployment**  
✅ **Advanced features** (download, analytics, enhanced upload)  

### Performance
- **Fast loading** with Vite optimization
- **Responsive design** for all devices
- **Real-time updates** with API integration
- **Efficient data management** with pagination

---

**Status:** ✅ Production Ready  
**Last Updated:** October 2024  
**Version:** 1.0.0  
**License:** Private - Car Dealership Management System

----

**Built with ❤️ using React, TypeScript, and Material-UI**