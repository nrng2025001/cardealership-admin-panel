# 🔧 Troubleshooting Guide - Admin Dashboard

## 🚨 White Screen After Login

### Check Browser Console

Open browser DevTools (F12 or Cmd+Option+I) and check the Console tab for errors.

### Common Issues & Solutions:

#### 1️⃣ **Firebase Configuration Error**

**Symptoms:**
```
❌ Missing Firebase configuration
❌ Firebase initialization error
```

**Solution:**
```bash
# Verify .env file exists and has all variables
cat .env

# Should contain:
VITE_FIREBASE_API_KEY=AIzaSyCY3Iw35gcZhVrG3ZUH2B3I2LHoVBwkALE
VITE_FIREBASE_AUTH_DOMAIN=car-dealership-app-9f2d5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
VITE_FIREBASE_STORAGE_BUCKET=car-dealership-app-9f2d5.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=768479850678
VITE_FIREBASE_APP_ID=1:768479850678:web:e994d17c08dbe8cab87617

# After fixing, restart dev server:
# Press Ctrl+C to stop
npm run dev
```

#### 2️⃣ **Auth State Stuck in Loading**

**Symptoms:**
- White screen with "Loading..." message
- No errors in console

**Console should show:**
```
🔧 Initializing auth state...
🔐 Firebase auth state changed: No user
👤 No Firebase user - showing login
✅ Auth initialization complete
```

**If stuck, check for:**
- `⏰ Auth state check timeout` message (after 5 seconds)
- Firebase network issues

**Solution:**
```javascript
// Clear local storage and try again
localStorage.clear();
window.location.reload();
```

#### 3️⃣ **API Response Format Mismatch**

**Symptoms:**
```
TypeError: Cannot read property 'data' of undefined
TypeError: Cannot read property 'pagination' of undefined
```

**Solution:**
Check console network tab for API responses. Backend might be returning different format than expected.

#### 4️⃣ **Role/Permission Issues**

**Symptoms:**
- Dashboard loads but empty
- "Access Denied" messages

**Check:**
```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('User role:', user.role.name);

// Should be: ADMIN, GENERAL_MANAGER, etc.
```

**Solution:**
Make sure user has correct role in database.

---

## 🔍 Debug Mode - Step by Step

### Step 1: Check Firebase Loading

**Open browser console and look for:**
```
🔥 Firebase config loaded: { projectId: "car-dealership-app-9f2d5", ... }
✅ Firebase initialized successfully
```

**If you see errors here:**
- Missing Firebase credentials in `.env`
- Restart dev server after adding credentials

### Step 2: Check Auth State

**Look for:**
```
🔧 Initializing auth state...
🔐 Firebase auth state changed: User logged in (or No user)
✅ Auth initialization complete
```

**If auth state timeout appears:**
```
⏰ Auth state check timeout - forcing loading to false
```
This means Firebase is taking too long. Check internet connection or Firebase status.

### Step 3: Check User Data

After login, check:
```javascript
// In browser console:
localStorage.getItem('currentUser')
localStorage.getItem('authToken')
```

**Should show:**
- `currentUser`: JSON object with user info
- `authToken`: Firebase JWT token (long string)

### Step 4: Check API Calls

Open Network tab and filter for XHR/Fetch requests:

After login, you should see calls to:
- `/api/enquiries/stats`
- `/api/quotations/stats`
- `/api/bookings?limit=1`
- `/api/auth/users?limit=1`
- `/api/stock?limit=1`

**If API calls fail:**
- Check if backend is running: `curl http://10.69.245.247:4000/api/health`
- Check token in request headers
- Check CORS settings

---

## 🛠️ Quick Fixes

### Fix 1: Clear Everything and Restart

```bash
# Stop dev server (Ctrl+C)

# Clear browser storage
# In browser console:
localStorage.clear();
sessionStorage.clear();

# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart
npm run dev

# Login again
```

### Fix 2: Force Logout and Re-login

```javascript
// In browser console:
localStorage.clear();
window.location.href = '/login';

// Then login again
```

### Fix 3: Check Backend is Running

```bash
# Check if backend is accessible
curl http://10.69.245.247:4000/api/health

# If not running, start it:
cd ~/car-dealership-backend
npm run dev
```

### Fix 4: Test API Manually

```bash
# Test login endpoint
curl -X POST http://10.69.245.247:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin.new@test.com","password":"testpassword123"}'

# Should return:
# {"success":true,"data":{"token":"...","user":{...}}}
```

---

## 🐛 Enable Debug Logging

The app now has extensive console logging. Check browser console for:

**Auth Flow:**
```
🔧 Initializing auth state...
🔐 Firebase auth state changed
✅ User data restored
✅ Auth initialization complete
```

**API Calls:**
All API errors are logged to console automatically.

**Component Errors:**
Error Boundary will catch and display any React component errors.

---

## 📊 Expected Console Output (Normal Flow)

### On Page Load:
```
🔥 Firebase config loaded: { projectId: "car-dealership-app-9f2d5", ... }
✅ Firebase initialized successfully
🔧 Initializing auth state...
🔐 Firebase auth state changed: No user
👤 No Firebase user - showing login
✅ Auth initialization complete
```

### After Login:
```
API Request: POST /api/auth/login
🔐 Firebase auth state changed: User logged in
✅ User data restored: admin.new@test.com
✅ Auth initialization complete
API Request: GET /api/enquiries/stats
API Request: GET /api/quotations/stats
API Request: GET /api/bookings?limit=1
API Request: GET /api/auth/users?limit=1
API Request: GET /api/stock?limit=1
```

---

## 🎯 Still Having Issues?

### Checklist:

- [ ] `.env` file exists with all Firebase variables
- [ ] Dev server restarted after changing .env
- [ ] Backend is running at `http://10.69.245.247:4000`
- [ ] Browser console shows no errors
- [ ] localStorage has authToken and currentUser after login
- [ ] Network tab shows successful API calls
- [ ] User role is ADMIN or GENERAL_MANAGER

### Get Detailed Logs:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Clear console**
4. **Refresh page**
5. **Login**
6. **Copy all console output**
7. **Share for debugging**

---

## 🚑 Emergency Reset

If nothing works:

```bash
# 1. Stop everything
# Press Ctrl+C in terminal

# 2. Clear everything
rm -rf node_modules package-lock.json

# 3. Reinstall
npm install

# 4. Clear browser
# In browser console:
localStorage.clear();
sessionStorage.clear();
indexedDB.deleteDatabase('firebaseLocalStorageDb');

# 5. Restart
npm run dev

# 6. Hard refresh browser
# Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# 7. Login again
```

---

## 📞 Need More Help?

Check these files for detailed information:
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Full integration docs
- [STATUS.md](./STATUS.md) - Current status

**Still stuck? Check browser console and network tab for specific error messages!**

