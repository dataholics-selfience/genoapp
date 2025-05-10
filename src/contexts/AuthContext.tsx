import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, query, collection, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface UserData {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  company: string;
  isDeleted?: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  signUp: (email: string, password: string, userData: UserData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            if (data.isDeleted) {
              await firebaseSignOut(auth);
              setCurrentUser(null);
              setUserData(null);
              throw new Error('auth/account-deleted');
            }
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          if ((error as Error).message === 'auth/account-deleted') {
            throw error;
          }
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, userData: UserData) => {
    try {
      // Check if email exists in deleted_accounts
      const deletedAccountsRef = collection(db, 'deleted_accounts');
      const deletedQuery = query(deletedAccountsRef, where('email', '==', email));
      const deletedSnapshot = await getDocs(deletedQuery);

      if (!deletedSnapshot.empty) {
        throw new Error('auth/email-previously-deleted');
      }

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: userData.fullName });
      
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        isDeleted: false,
        createdAt: new Date().toISOString()
      });
      
      setCurrentUser(user);
      setUserData(userData);
    } catch (error: any) {
      console.error('Error in signUp:', error);
      if (error.message === 'auth/email-previously-deleted') {
        throw new Error('auth/email-previously-deleted');
      }
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check if account is deleted
      const deletedAccountsRef = collection(db, 'deleted_accounts');
      const deletedQuery = query(deletedAccountsRef, where('email', '==', email));
      const deletedSnapshot = await getDocs(deletedQuery);

      if (!deletedSnapshot.empty) {
        throw new Error('auth/account-deleted');
      }

      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('auth/user-not-found');
      }
      
      const userData = userDoc.data() as UserData;
      if (userData.isDeleted) {
        await firebaseSignOut(auth);
        throw new Error('auth/account-deleted');
      }
      
      setUserData(userData);
    } catch (error: any) {
      console.error('Error in signIn:', error);
      
      if (error.message === 'auth/account-deleted') {
        throw new Error('auth/account-deleted');
      }
      
      // Map Firebase error codes to our custom error codes
      if (error.code === 'auth/invalid-email' || 
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/invalid-login-credentials') {
        throw new Error('auth/invalid-credential');
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  };

  const updateUserData = async (data: Partial<UserData>) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, data);
      
      if (userData) {
        const updatedUserData = { ...userData, ...data };
        setUserData(updatedUserData);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!currentUser || !userData?.email) return;

    try {
      // Mark account as deleted in users collection
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { isDeleted: true });

      // Add to deleted_accounts collection
      await addDoc(collection(db, 'deleted_accounts'), {
        email: userData.email,
        userId: currentUser.uid,
        deletedAt: new Date(),
        reason: 'user-requested'
      });

      // Sign out and clear state
      await signOut();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    signUp,
    signIn,
    signOut,
    updateUserData,
    deleteAccount,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};