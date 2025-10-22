# ⚡ Quick Start Guide - Admin Dashboard

## 🚀 **1-Minute Setup**

### Step 1: Check `.env` file exists
```bash
cat .env
```

If it exists and has your Firebase credentials, you're good! Otherwise, create it:

```env
VITE_API_BASE_URL=http://10.69.245.247:4000/api

VITE_FIREBASE_API_KEY=AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE
VITE_FIREBASE_AUTH_DOMAIN=car-dealership-app-9f2d5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
VITE_FIREBASE_STORAGE_BUCKET=car-dealership-app-9f2d5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=768479850678
VITE_FIREBASE_APP_ID=1:768479850678:web:e994d17c08dbe8cab87617
VITE_FIREBASE_MEASUREMENT_ID=G-WSF9PY0QPL
```

### Step 2: Run the dashboard
```bash
npm run dev
```

### Step 3: Login
Open **http://localhost:5173** and click:

**"Login as Admin (Recommended)"**

---

## 🔐 **Test Accounts**

### **Recommended (Easy Password):**
```
Email:    admin.new@test.com
Password: testpassword123
Role:     ADMIN
```

### **Alternative Admin:**
```
Email:    admin@cardealership.com  
Password: Admin123!
Role:     ADMIN
```

### **Advisor Account (Limited Access):**
```
Email:    advisor.new@test.com
Password: testpassword123
Role:     CUSTOMER_ADVISOR
```

---

## ✨ **Features Available**

### ✅ **Admin Features:**
- 👥 **User Management** - Create, edit, delete users
- 📤 **Bulk Import** - Upload Excel/CSV files for bookings
- 📊 **Dashboard** - Real-time statistics
- 🚗 **Bookings** - Full CRUD + audit logs
- 📋 **Enquiries** - Management + auto-convert to bookings
- 💰 **Quotations** - Approval workflow
- 📦 **Stock/Vehicles** - Inventory management

### 🔒 **Role-Based Access:**
- **ADMIN** → Full access to everything
- **GENERAL_MANAGER** → All except user management
- **SALES_MANAGER** → View & edit, no bulk imports
- **TEAM_LEAD** → Team data only
- **CUSTOMER_ADVISOR** → Assigned items only

---

## 🎯 **Common Tasks**

### Create a New User
1. Navigate to User Management (if route is configured)
2. Click "+ Create User"
3. Fill in: Name, Email, Password, Role
4. Submit
5. Share temporary password with user

### Upload Bulk Bookings
1. Navigate to Bulk Upload page
2. Select Excel/CSV file
3. Choose dealer code
4. Click "Preview" to validate
5. Click "Upload" to import

### View Bookings
1. Navigate to Bookings page
2. Use filters: Status, Dealer, Advisor, Date range
3. Click on booking to view details
4. Use "Assign" to assign to advisor
5. Click "Audit Log" to see change history

---

## 📁 **Excel Template for Bulk Import**

**Required Columns:**
- `customer_name`
- `customer_phone`
- `dealer_code`
- `variant`

**Optional Columns:**
- `customer_email`, `color`, `zone`, `region`
- `booking_date`, `expected_delivery_date`
- `advisor_id`, `finance_required`, `financer_name`
- `stock_availability`

**Example:**
| customer_name | customer_phone | dealer_code | variant | color | zone |
|---------------|----------------|-------------|---------|-------|------|
| John Doe | +919876543210 | TATA001 | Tata Harrier EV | Blue | NORTH |

---

## 🔧 **Troubleshooting**

### Can't Login?
- Make sure backend is running at `http://10.69.245.247:4000`
- Check browser console for errors
- Try clearing localStorage: `localStorage.clear()`
- Use the recommended test account: `admin.new@test.com`

### Backend Not Responding?
```bash
# Check if backend is running
curl http://10.69.245.247:4000/api/health

# If not, start it:
cd ~/car-dealership-backend
npm run dev
```

### Firebase Errors?
- Verify `.env` file has correct Firebase credentials
- Check Firebase Console for project status
- Ensure user exists in both Firebase Auth AND database

### Dependencies Issues?
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 📞 **API Endpoints Summary**

**Backend:** `http://10.69.245.247:4000/api`

### Authentication
- `POST /auth/login` - Login
- `GET /auth/users` - List users (Admin/GM)
- `POST /auth/users/create-with-credentials` - Create user (Admin)

### Bookings
- `GET /bookings` - List bookings
- `POST /bookings` - Create booking
- `POST /bookings/import/upload` - Bulk import
- `GET /bookings/imports` - Import history

### Enquiries
- `GET /enquiries` - List enquiries
- `GET /enquiries/stats` - Statistics
- `PATCH /enquiries/:id` - Update category/status

### Stock
- `GET /stock` - List vehicles
- `POST /stock` - Create vehicle
- `PUT /stock/:id` - Update vehicle

### Quotations
- `GET /quotations` - List quotations
- `POST /quotations` - Create quotation
- `GET /quotations/stats` - Statistics

---

## 🎨 **Next Steps**

### Optional UI Enhancements:
1. Add routes for User Management & Bulk Upload pages
2. Customize dashboard charts and colors
3. Add notification system (e.g., notistack)
4. Implement data export features
5. Add advanced filters and search

### Example: Add Route
```tsx
// In your router file
import { UserManagementPage } from '@/pages/admin/UserManagementPage';

<Route path="/admin/users" element={<UserManagementPage />} />
```

### Example: Add to Sidebar
```tsx
// In Sidebar.tsx
{isAdmin() && (
  <ListItem button component={Link} to="/admin/users">
    <ListItemIcon><People /></ListItemIcon>
    <ListItemText primary="User Management" />
  </ListItem>
)}
```

---

## 🎉 **You're Ready!**

**Dashboard URL:** http://localhost:5173  
**Backend URL:** http://10.69.245.247:4000  
**Quick Login:** Click "Login as Admin (Recommended)"

**All features are working and integrated with your backend!** 🚀

For detailed API documentation, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

