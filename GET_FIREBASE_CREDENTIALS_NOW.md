# 🔥 Get Firebase Web SDK Credentials - Step by Step

## ⏱️ This will take 2 minutes

Your Firebase project: **car-dealership-app-9f2d5**

---

## 📋 Step-by-Step Instructions

### Step 1: Open Firebase Console (30 seconds)

Click this link:
```
https://console.firebase.google.com/u/0/project/car-dealership-app-9f2d5/settings/general
```

**If it asks you to login:** Use your Google account that has access to this Firebase project

---

### Step 2: Find Web App Config (30 seconds)

Once you're in Project Settings:

1. Scroll down to the section called **"Your apps"** or **"SDK setup and configuration"**

2. Look for icons representing different platforms:
   - 📱 iOS
   - 🤖 Android  
   - **</> Web** ← **You need this one**

**Two scenarios:**

#### Scenario A: Web app already exists
- You'll see it listed with a name like "Web app" or something similar
- Click on it or click the **config** icon (⚙️) next to it
- You'll see the `firebaseConfig` code

#### Scenario B: No web app exists yet
- Click the **"Add app"** button
- Select the **</>** (Web) icon
- Enter a nickname: `Car Dealership Dashboard`
- **Don't check** "Also set up Firebase Hosting"
- Click **"Register app"**

---

### Step 3: Copy the Configuration (30 seconds)

You'll see JavaScript code that looks EXACTLY like this:

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDa_2Fx7K3m8L9_example_key_here",
  authDomain: "car-dealership-app-9f2d5.firebaseapp.com",
  projectId: "car-dealership-app-9f2d5",
  storageBucket: "car-dealership-app-9f2d5.firebasestorage.app",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:abc123def456ghi789"
};
```

**Copy the 6 values:**
1. `apiKey` - Starts with "AIzaSy..."
2. `authDomain` - Ends with ".firebaseapp.com"
3. `projectId` - Should be "car-dealership-app-9f2d5"
4. `storageBucket` - Ends with ".firebasestorage.app" or ".appspot.com"
5. `messagingSenderId` - A number
6. `appId` - Starts with "1:..."

---

### Step 4: Update .env File (30 seconds)

**Option A: Manual Edit**

Open file: `/Users/adityajaif/Desktop/automotiveDashboard/.env`

Replace everything with:

```env
# Backend API
VITE_API_BASE_URL=http://10.69.245.247:4000/api

# Firebase Web SDK (from Firebase Console - Step 3)
VITE_FIREBASE_API_KEY=PASTE_YOUR_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=car-dealership-app-9f2d5.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=car-dealership-app-9f2d5
VITE_FIREBASE_STORAGE_BUCKET=PASTE_YOUR_STORAGE_BUCKET_HERE
VITE_FIREBASE_MESSAGING_SENDER_ID=PASTE_YOUR_SENDER_ID_HERE
VITE_FIREBASE_APP_ID=PASTE_YOUR_APP_ID_HERE
```

**Option B: Use Terminal**

Tell me the 6 values and I'll update the file for you via terminal.

---

### Step 5: Restart Dev Server (10 seconds)

```bash
# In the terminal running the React Dashboard:
# Press: Ctrl + C

# Then restart:
npm run dev
```

### Step 6: Hard Refresh Browser (5 seconds)

```bash
# Once dev server is running, go to http://localhost:5173
# Press: Cmd + Shift + R (Mac) or Ctrl + Shift + R (Windows)
```

---

## ✅ How to Verify It Works

### In Browser Console (F12):

**Before Fix:**
```
❌ Missing Firebase configuration: ['apiKey', 'authDomain', ...]
❌ Firebase initialization error
```

**After Fix:**
```
✅ Firebase initialized successfully
```

### Login Page Should:
```
✅ Show login form
✅ Accept credentials
✅ No timeout errors
✅ Redirect to dashboard after login
```

---

## 🆘 Can't Access Firebase Console?

### Option 1: Check Email
- Look for emails from Firebase
- They often contain project links

### Option 2: Check Browser History
- Search history for "firebase.google.com"
- You may have accessed it before

### Option 3: Ask Team Member
- If someone else set up the Firebase project
- They can share the Web SDK config

### Option 4: Use Firebase CLI
```bash
# If you have Firebase CLI installed:
firebase apps:sdkconfig WEB
```

---

## 📞 Need Help?

If you're stuck:

1. **Share your screen** showing Firebase Console
2. **Copy-paste** the firebaseConfig you see
3. I'll format it for the .env file

The Web SDK API key is **NOT secret** - it's safe to share!

---

## ⚡ Quick Summary

| Step | What | Time |
|------|------|------|
| 1 | Open Firebase Console | 30s |
| 2 | Find Web app | 30s |
| 3 | Copy config | 30s |
| 4 | Update .env | 30s |
| 5 | Restart server | 10s |
| 6 | Hard refresh browser | 5s |
| **Total** | **Fix timeout issue** | **~2 min** |

---

**Once you have the Firebase config, the timeout will be GONE and everything will work!** 🚀

Just get those 6 values from Firebase Console and paste them in the .env file!

