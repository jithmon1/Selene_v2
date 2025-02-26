import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FIREBASE_AUTH, FIRESTORE_DB } from '@/FirebaseConfig';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { JournalEntry } from '@/src/constants/Types'; // Adjust the import path as necessary

// Create Context
const UserDataContext = createContext<{ userData: JournalEntry[] | null; deleteJournal: (id: string) => void } | null>(null);

export const UserDataProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(FIREBASE_AUTH.currentUser);
  const [userData, setUserData] = useState<JournalEntry[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(FIREBASE_AUTH, (authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch journal data once user is available
  useEffect(() => {
    if (!user || loading) return;

    const journalsCollectionRef = collection(FIRESTORE_DB, 'users', user.uid, 'journals');
    const unsubscribeFirestore = onSnapshot(
      journalsCollectionRef,
      (querySnapshot) => {
        const journals = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as JournalEntry));
        setUserData(journals);
      },
      (error) => {
        console.error("Error fetching user journals:", error);
      }
    );

    return () => unsubscribeFirestore();
  }, [user, loading]);

  // Function to delete a journal entry
  const deleteJournal = async (id: string) => {
    if (user) {
      try {
        const journalRef = doc(FIRESTORE_DB, 'users', user.uid, 'journals', id);
        await deleteDoc(journalRef);

        // Optimistically update the UI
        setUserData((prevData) => prevData?.filter((entry) => entry.id !== id) || null);
      } catch (error) {
        console.error("Error deleting journal:", error);
      }
    }
  };

  return (
    <UserDataContext.Provider value={{ userData, deleteJournal }}>
      {children}
    </UserDataContext.Provider>
  );
};

// Custom Hook to Use User Data Anywhere
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
