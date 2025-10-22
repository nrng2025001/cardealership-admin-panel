# Quick Setup Guide - Automotive Admin Dashboard

## 🚀 Quick Start (3 Steps)

### Step 1: Create `.env` File

Create a file named `.env` in the project root with these contents:

```env
# Backend API Configuration
VITE_API_BASE_URL=http://10.69.245.247:4000/api

# Firebase Configuration - Get from Firebase Console
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=car-dealership-app-9f2d5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
VITE_FIREBASE_STORAGE_BUCKET=car-dealership-app-9f2d5.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id-here
VITE_FIREBASE_APP_ID=your-app-id-here
```

**Where to get Firebase credentials:**
1. Go to https://console.firebase.google.com/
2. Select your project: `car-dealership-app-9f2d5`
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps"
5. Copy the config values

### Step 2: Install & Run

```bash
npm install
npm run dev
```

### Step 3: Login

Open http://localhost:5173 and login with:
```
Email: admin@test.com
Password: testpassword123
```

---

## ✅ What's Already Configured

✅ Firebase SDK installed  
✅ API client configured  
✅ All API endpoints integrated  
✅ User management page ready  
✅ Bulk import page ready  
✅ Dashboard showing real data  

---

## 📋 Feature Checklist

### Authentication ✅
- Login with Firebase
- Auto token refresh
- Role-based access

### User Management ✅ (Admin only)
- `/admin/users` or create route for `UserManagementPage`
- Create, edit, delete users
- Manage roles and permissions

### Bulk Import ✅ (Admin/GM)
- `/admin/bulk-upload`
- Upload Excel/CSV files
- View import history

### Bookings ✅
- View, create, update bookings
- Filter by status, dealer, advisor
- Assign advisors
- View audit logs

### Enquiries ✅
- Manage enquiries
- Auto-convert to bookings
- View statistics

### Quotations ✅
- Create and manage quotations
- Approval workflow
- PDF generation

### Stock/Vehicles ✅
- Manage vehicle inventory
- Price management
- Active/inactive status

### Dashboard ✅
- Real-time statistics
- Recent activities
- Charts and graphs

---

## 🔧 Optional: Add Routes

If you need to add routes for new pages, update your router:

```tsx
// In your router file (e.g., App.tsx or routes.tsx)
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { BulkUploadPage } from '@/pages/admin/BulkUploadPage';

// Add these routes
<Route path="/admin/users" element={<UserManagementPage />} />
<Route path="/admin/bulk-upload" element={<BulkUploadPage />} />
```

And add to sidebar navigation:

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

## 🎯 Test Your Integration

1. **Login**: Try logging in with admin credentials
2. **Dashboard**: Check if stats are loading from backend
3. **Bookings**: View bookings list
4. **User Management**: Create a new user
5. **Bulk Import**: Try uploading a sample Excel file

---

## 📝 Sample Excel Template for Bulk Import

Create an Excel file with these columns:

| customer_name | customer_phone | customer_email | dealer_code | variant | color | zone | region |
|---------------|----------------|----------------|-------------|---------|-------|------|--------|
| John Doe | +919876543210 | john@test.com | TATA001 | Tata Harrier EV | Blue | NORTH | Delhi |

**Required columns:** customer_name, customer_phone, dealer_code, variant

**Optional columns:** customer_email, color, zone, region, booking_date, expected_delivery_date, advisor_id, finance_required, financer_name, stock_availability

---

## ❓ Troubleshooting

**Cannot connect to backend?**
- Check if backend is running at `http://10.69.245.247:4000`
- Verify `.env` file exists and has correct URL

**Firebase errors?**
- Verify Firebase credentials in `.env`
- Check Firebase Console for project status

**Bulk import fails?**
- Check Excel file has required columns
- Verify dealer_code exists in backend

---

## 🎉 You're All Set!

Your admin dashboard is fully integrated and ready to use. Enjoy! 🚀

For detailed documentation, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

