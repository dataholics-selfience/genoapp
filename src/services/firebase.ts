import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  onAuthStateChanged 
} from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAGP46j09m5LH_XhP2qdAfB_cLNHC82rZA",
  authDomain: "genoi-7777.firebaseapp.com",
  projectId: "genoi-7777",
  storageBucket: "genoi-7777.firebasestorage.app",
  messagingSenderId: "894331831616",
  appId: "1:894331831616:web:1e1583b1a3b8cdd140e6a5",
  measurementId: "G-GPH8EYLKFP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = getAuth(app);

// Initialize Firestore with security rules
const db = getFirestore(app);

// Set up auth persistence and state listener after initialization
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('User is signed in:', user.email);
      } else {
        console.log('User is signed out');
      }
    });
  })
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

// Enable Firestore persistence with better error handling
try {
  enableIndexedDbPersistence(db);
} catch (err: any) {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support persistence.');
  }
}

// Export initialized services
export { auth, db, sendPasswordResetEmail, sendEmailVerification };