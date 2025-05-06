import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { logFirebaseError } from '../utils/firebaseErrorHandler';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  async function signup(email, password, name, pincode, phone, userType = 'user') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with name
      await updateProfile(user, { displayName: name });
      
      // Save additional user data to firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        name,
        pincode,
        phone,
        userType,
        createdAt: new Date(),
      });
      
      return user;
    } catch (error) {
      console.error("Error in signup: ", error);
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function getUserProfile(uid) {
    try {
      setProfileError(null);
      
      // First, check if user exists
      if (!uid) {
        console.log("No uid provided to getUserProfile");
        return null;
      }
      
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        return userData;
      } else {
        console.log("No user profile found for uid:", uid);
        
        // Create a basic profile if missing
        if (currentUser) {
          const basicProfile = {
            email: currentUser.email,
            name: currentUser.displayName || '',
            phone: '',
            createdAt: new Date(),
            userType: 'user'
          };
          
          // Save this basic profile
          await setDoc(doc(db, 'users', uid), basicProfile);
          setUserProfile(basicProfile);
          return basicProfile;
        }
        
        setUserProfile(null);
        return null;
      }
    } catch (error) {
      console.error("Error getting user profile: ", error);
      setProfileError(error.message);
      // Return a minimal profile instead of null to prevent UI issues
      if (currentUser) {
        const fallbackProfile = {
          email: currentUser.email,
          name: currentUser.displayName || '',
          phone: '',
          userType: 'user'
        };
        setUserProfile(fallbackProfile);
        return fallbackProfile;
      }
      return null;
    }
  }

  async function updateUserProfile(uid, profileData) {
    try {
      if (!uid) {
        throw new Error("User ID is required to update profile");
      }
      
      if (!currentUser) {
        throw new Error("You need to be logged in to update your profile");
      }
      
      const userDocRef = doc(db, 'users', uid);
      
      // Add timestamp for the update
      const updatedData = {
        ...profileData,
        updatedAt: new Date()
      };
      
      // Check if the document exists first
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        // Update existing document
        await updateDoc(userDocRef, updatedData);
      } else {
        // Create new document if it doesn't exist
        // We need to include email in the data for new documents
        const newDocData = {
          ...updatedData,
          email: currentUser?.email || '',
          createdAt: new Date(),
          userType: 'user', // Default user type
        };
        await setDoc(userDocRef, newDocData);
      }
      
      // If name is being updated, also update in Firebase Auth
      if (profileData.name && currentUser) {
        await updateProfile(currentUser, {
          displayName: profileData.name
        });
      }
      
      // Refresh the profile data in context
      const updatedProfile = await getUserProfile(uid);
      setUserProfile(updatedProfile);
      
      return updatedProfile;
    } catch (error) {
      logFirebaseError(error, 'updateUserProfile');
      throw error;
    }
  }

  useEffect(() => {
    let unsubscribed = false;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user && !unsubscribed) {
        try {
          const profile = await getUserProfile(user.uid);
          
          // Only update state if component is still mounted
          if (!unsubscribed) {
            setUserProfile(profile);
          }
        } catch (error) {
          if (!unsubscribed) {
            console.error("Error in auth state change:", error);
            setProfileError(error.message);
          }
        }
      } else {
        if (!unsubscribed) {
          setUserProfile(null);
        }
      }
      
      if (!unsubscribed) {
        setLoading(false);
      }
    });

    return () => {
      unsubscribed = true;
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    userProfile,
    profileError,
    signup,
    login,
    logout,
    getUserProfile,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 