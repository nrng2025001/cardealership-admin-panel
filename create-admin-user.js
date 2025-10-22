// Script to create admin user in Firebase Auth
// Run with: node create-admin-user.js

const admin = require('firebase-admin');

// Initialize Firebase Admin with your credentials
const serviceAccount = {
  projectId: "car-dealership-app-9f2d5",
  // You'll need to add your service account key here or use environment variables
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "car-dealership-app-9f2d5"
  });

  const auth = admin.auth();

  async function createAdminUser() {
    const email = 'admin@cardealership.com';
    const password = 'Admin123!';
    const displayName = 'Admin User';
    const uid = 'demo_admin_cardealership_com'; // Match the backend seed UID

    try {
      // Try to get the user first
      try {
        const user = await auth.getUser(uid);
        console.log('✅ User already exists:', user.email);
        return;
      } catch (error) {
        // User doesn't exist, create it
      }

      const userRecord = await auth.createUser({
        uid,
        email,
        emailVerified: true,
        password,
        displayName,
        disabled: false,
      });

      console.log('✅ Successfully created admin user:');
      console.log('   Email:', email);
      console.log('   Password:', password);
      console.log('   UID:', userRecord.uid);
      console.log('\n🎉 You can now login to the dashboard!');
    } catch (error) {
      console.error('❌ Error creating user:', error.message);
      
      if (error.code === 'auth/email-already-exists') {
        console.log('\n✅ User already exists with this email!');
        console.log('   You can login with:');
        console.log('   Email:', email);
        console.log('   Password:', password);
      }
    }
  }

  createAdminUser().then(() => process.exit(0));

} catch (error) {
  console.error('\n❌ Error initializing Firebase Admin:');
  console.error(error.message);
  console.error('\n📝 To fix this:');
  console.error('1. Go to Firebase Console → Project Settings → Service Accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Download the JSON file');
  console.error('4. Set environment variable: GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json');
  console.error('5. Or update this script with the service account credentials');
  process.exit(1);
}

