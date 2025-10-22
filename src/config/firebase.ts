// Firebase Configuration
// This file initializes Firebase with the app configuration

import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.error('❌ Missing Firebase configuration:', missingKeys);
  console.error('Please ensure .env file has all required VITE_FIREBASE_* variables');
  console.error('');
  console.error('📋 TO FIX THIS:');
  console.error('1. Go to https://console.firebase.google.com/');
  console.error('2. Select project: car-dealership-app-9f2d5');
  console.error('3. Settings (⚙️) → Project Settings → Your apps');
  console.error('4. Add Web app (</>) or select existing one');
  console.error('5. Copy the firebaseConfig values to .env');
  console.error('');
  console.error('📄 See: FIREBASE_SETUP_REQUIRED.md for detailed instructions');
}

console.log('🔥 Firebase config loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey,
});

// Initialize Firebase
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Set Firebase auth persistence to LOCAL (persist across browser sessions)
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('✅ Firebase initialized successfully with LOCAL persistence');
    })
    .catch((error) => {
      console.error('⚠️ Firebase persistence setup failed:', error);
      console.log('✅ Firebase initialized but may not persist sessions');
    });
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.error('⚠️ App will continue without Firebase authentication');
  console.error('📋 Please configure Firebase to enable login functionality');
  // Don't throw - allow app to continue without Firebase
  // User will see error messages but can still potentially use the app
}

export { auth };
export default app;

