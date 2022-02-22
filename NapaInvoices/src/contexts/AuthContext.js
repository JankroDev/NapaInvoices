import React, { useContext, useState, useEffect } from 'react'
import app from '../initialize';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

const AuthContext = React.createContext();

const firebaseApp = app();
const auth = getAuth();

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({children}) {

    useEffect(() => {
      const unsubscriber = onAuthStateChanged(auth, (user) =>{
        if(user){
          setCurrentUser(user);
          setIsLoggedIn(true);
        }else{
          setIsLoggedIn(false);
        }
          
      })
    
      return unsubscriber
    }, [])
    

    const [currentUser, setCurrentUser] = useState();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    function login(email, password){
       return signInWithEmailAndPassword(auth,email, password)
    }

    function logout(auth){
      setCurrentUser("")
      return signOut(auth);
    }

    const value = {
        currentUser,
        isLoggedIn,
        login, 
        logout
    }

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  )
  
}




