import React, { useContext } from "react";
import { useEffect } from "react";
import { createContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import { useState } from "react";

const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState([]);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "doctor", user.uid));
        setUser({ ...docSnap.data(), ...user });
      } else {
        setUser(false);
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;

export function useAuth() {
  return useContext(AuthContext);
}
