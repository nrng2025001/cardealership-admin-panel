# 🚗 Automotive Admin Dashboard

> **Full-featured admin dashboard for car dealership management** - Connected to backend API at `http://10.69.245.247:4000/api`

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
VITE_API_BASE_URL=http://10.69.245.247:4000/api
VITE_FIREBASE_API_KEY=AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE
VITE_FIREBASE_AUTH_DOMAIN=car-dealership-app-9f2d5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
VITE_FIREBASE_STORAGE_BUCKET=car-dealership-app-9f2d5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=768479850678
VITE_FIREBASE_APP_ID=1:768479850678:web:e994d17c08dbe8cab87617
```

### 3. Run the Dashboard
   ```bash
   npm run dev
   ```

### 4. Login
Open **http://localhost:5173** and use:

**Recommended:**
```
Email:    admin.new@test.com
Password: testpassword123
```

Or click **"Login as Admin (Recommended)"** button!

---

## 🔐 Test Accounts

| Email | Password | Role | Access Level |
|-------|----------|------|--------------|
| `admin.new@test.com` | `testpassword123` | ADMIN | ⭐ Full Access |
| `advisor.new@test.com` | `testpassword123` | CUSTOMER_ADVISOR | 👁️ View Only |
| `admin@cardealership.com` | `Admin123!` | ADMIN | ⭐ Full Access |

---

## ✨ Features

### 🎨 **Frontend (React + TypeScript + Material-UI)**
- ✅ Firebase Authentication Integration
- ✅ Role-based Access Control
- ✅ Responsive Material-UI Design
- ✅ Real-time Data Updates
- ✅ Advanced Filtering & Search
- ✅ Pagination Support
- ✅ File Upload (Excel/CSV)
- ✅ Audit Log Viewer
- ✅ Error Handling & Validation

### 🔌 **Backend Integration**
- ✅ Complete REST API Integration
- ✅ Automatic Token Refresh
- ✅ Request Interceptors
- ✅ Error Handling
- ✅ TypeScript Type Safety
- ✅ Pagination Handling
- ✅ File Upload Support

### 👥 **User Management** (Admin Only)
- Create new users with roles
- Update user roles
- Reset passwords
- Activate/Deactivate users
- Delete users
- View user activity

### 📤 **Bulk Import** (Admin/GM)
- Upload Excel/CSV files
- Preview before import
- Validation with error reporting
- Import history tracking
- Download error reports
- Sample template download

### 🚗 **Booking Management**
- View all bookings with filters
- Timeline views (Today, Delivery Today, Overdue)
- Assign advisors
- Update status & remarks
- View audit logs
- Advanced search

### 📋 **Enquiry Management**
- Category management (HOT/LOST/BOOKED)
- Auto-convert to bookings
- Statistics dashboard
- Filter by status/category
- Advisor assignment

### 💰 **Quotation Management**
- Create quotations from enquiries
- Approval workflow
- PDF generation
- Send to customer
- Status tracking

### 📦 **Stock/Vehicle Management**
- Add/Edit/Delete vehicles
- Filter by dealer type
- Price management (Ex-showroom, On-road)
- Stock availability tracking

### 📊 **Dashboard Analytics**
- Real-time statistics
- Enquiry breakdown (HOT/LOST/BOOKED)
- Booking status overview
- Recent activity feed
- User count
- Stock levels

---

## 📂 Project Structure

```
automotiveDashboard/
├── src/
│   ├── api/                    # API Integration Layer
│   │   ├── client.ts          # Axios client with auth
│   │   ├── types.ts           # TypeScript types
│   │   ├── bookings.ts        # Booking API
│   │   ├── enquiries.ts       # Enquiry API
│   │   ├── quotations.ts      # Quotation API
│   │   ├── stocks.ts          # Stock/Vehicle API
│   │   ├── employees.ts       # User Management API
│   │   └── dashboard.ts       # Dashboard Statistics API
│   │
│   ├── config/
│   │   └── firebase.ts        # Firebase configuration
│   │
│   ├── context/
│   │   └── AuthContext.tsx    # Auth + Role management
│   │
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── UserManagementPage.tsx
│   │   │   └── BulkUploadPage.tsx
│   │   ├── bookings/
│   │   ├── enquiries/
│   │   ├── quotations/
│   │   ├── stocks/
│   │   ├── dashboard/
│   │   └── LoginPage.tsx
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── forms/
│   │   └── tables/
│   │
│   └── layouts/
│       ├── MainLayout.tsx
│       └── Sidebar.tsx
│
├── .env                       # Environment variables
├── QUICK_START.md            # Quick start guide
├── INTEGRATION_GUIDE.md      # Detailed integration docs
├── BACKEND_API_REFERENCE.md  # API endpoint reference
└── README.md                 # This file
```

---

## 🔒 Role-Based Permissions

| Feature | Admin | GM | SM | TL | Advisor |
|---------|:-----:|:--:|:--:|:--:|:-------:|
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Bulk Import | ✅ | ✅ | ❌ | ❌ | ❌ |
| View All Bookings | ✅ | ✅ | ✅ | ✅ | 👁️ Own |
| Edit Bookings | ✅ | ✅ | ✅ | ✅ | ⚠️ Limited |
| Assign Advisors | ✅ | ✅ | ✅ | ✅ | ❌ |
| Stock Management | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ✅ | ❌ | ❌ |
| Dashboard Stats | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **UI Library:** Material-UI (MUI) v7
- **Routing:** React Router v7
- **State Management:** React Context API
- **HTTP Client:** Axios
- **Charts:** Recharts + MUI X Charts
- **Data Grid:** MUI X Data Grid
- **Authentication:** Firebase Auth
- **Build Tool:** Vite

### Backend (Integrated)
- **API:** Node.js + Express + TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Firebase Admin SDK
- **File Processing:** ExcelJS
- **Hosting:** `http://10.69.245.247:4000`

---

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

---

## 🔧 Configuration

### Environment Variables

Create/update `.env`:

```env
# Backend API
VITE_API_BASE_URL=http://10.69.245.247:4000/api

# Firebase (Get from Firebase Console)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=car-dealership-app-9f2d5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
VITE_FIREBASE_STORAGE_BUCKET=car-dealership-app-9f2d5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Adding New Routes (Optional)

```tsx
// In your router configuration
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { BulkUploadPage } from '@/pages/admin/BulkUploadPage';

// Add routes
<Route path="/admin/users" element={<UserManagementPage />} />
<Route path="/admin/bulk-upload" element={<BulkUploadPage />} />
```

### Updating Sidebar (Optional)

```tsx
// In Sidebar.tsx
import { People, CloudUpload } from '@mui/icons-material';

{isAdmin() && (
  <>
    <ListItem button component={Link} to="/admin/users">
      <ListItemIcon><People /></ListItemIcon>
      <ListItemText primary="User Management" />
    </ListItem>
    <ListItem button component={Link} to="/admin/bulk-upload">
      <ListItemIcon><CloudUpload /></ListItemIcon>
      <ListItemText primary="Bulk Import" />
    </ListItem>
  </>
)}
```

---

## 📊 API Integration

### Sample API Call

```typescript
import { bookingAPI } from '@/api/bookings';

// Get bookings with filters
const data = await bookingAPI.getBookings({
  page: 1,
  limit: 20,
  status: 'PENDING',
  dealerCode: 'TATA001'
});

console.log(data.data.bookings); // Array of bookings
console.log(data.data.pagination); // Pagination info
```

### Authentication

All API calls automatically include the Firebase ID token:

```typescript
// Handled by axios interceptor in src/api/client.ts
headers: {
  'Authorization': `Bearer ${firebaseIdToken}`,
  'Content-Type': 'application/json'
}
```

---

## 🚨 Troubleshooting

### Issue: Can't login
**Solution:**
1. Check if backend is running: `curl http://10.69.245.247:4000/api/health`
2. Clear browser storage: `localStorage.clear()`
3. Check browser console for errors
4. Use test credentials: `admin.new@test.com` / `testpassword123`

### Issue: API calls failing
**Solution:**
1. Verify `.env` has correct `VITE_API_BASE_URL`
2. Check network tab in browser DevTools
3. Ensure backend is accessible
4. Check if Firebase token is present: `localStorage.getItem('authToken')`

### Issue: Rollup/Vite build errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Firebase errors
**Solution:**
1. Verify Firebase credentials in `.env`
2. Check Firebase Console for project status
3. Ensure user exists in Firebase Auth

---

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 1 minute
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Complete backend integration guide
- **[BACKEND_API_REFERENCE.md](./BACKEND_API_REFERENCE.md)** - API endpoint reference
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions

---

## 🎯 Key Features Implemented

✅ **Authentication System**
- Firebase Auth integration
- Custom token generation
- Auto token refresh
- Role-based access control

✅ **User Management**
- Create users with roles
- Update user permissions
- Password reset functionality
- User activation/deactivation

✅ **Bulk Data Import**
- Excel/CSV file upload
- Data validation & preview
- Import history tracking
- Error reporting & download

✅ **Complete CRUD Operations**
- Bookings, Enquiries, Quotations, Stock
- Advanced filtering & search
- Pagination support
- Real-time updates

✅ **Dashboard Analytics**
- Real-time statistics
- Visual charts & graphs
- Activity feed
- Role-based views

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

Outputs to `dist/` directory.

### Environment Variables for Production

Update `.env` with production values:
```env
VITE_API_BASE_URL=https://your-production-api.com/api
# ... Firebase production config
```

---

## 📞 Support & Resources

**Backend API:** http://10.69.245.247:4000/api  
**Firebase Project:** car-dealership-app-9f2d5  
**Frontend Port:** http://localhost:5173

**Test Credentials:**
- Admin: `admin.new@test.com` / `testpassword123`
- Advisor: `advisor.new@test.com` / `testpassword123`

---

## 🎉 Status

**✅ PRODUCTION READY** - All features integrated and tested!

- ✅ Firebase Authentication
- ✅ Backend API Integration
- ✅ User Management
- ✅ Bulk Import
- ✅ CRUD Operations
- ✅ Role-based Permissions
- ✅ Dashboard Analytics
- ✅ Audit Logging

**Ready to deploy!** 🚀

---

## 📄 License

Private - Car Dealership Management System

---

**Built with ❤️ using React, TypeScript, and Material-UI**
