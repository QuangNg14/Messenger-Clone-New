import React, {useContext, useState, useEffect} from 'react'
import { auth, db } from "../../services/firebase"

const AuthContext = React.createContext()

export function useAuth(){
  return useContext(AuthContext)
}

export function AuthProvider({children}) {
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)

  const signup = (email, password) => {
    return auth.createUserWithEmailAndPassword(email, password)
  }

  const login = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password)
  }

  const logout = () => {
    return auth.signOut()
  }

  const resetPassword = (email) =>{
    return auth.sendPasswordResetEmail(email)
  }

  const updateEmail = (email) =>{
    return currentUser.updateEmail(email)
  }

  const updatePassword = (password) =>{
    return currentUser.updatePassword(password)
  }



  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      // khi nào thấy change in authUser -> notify us
      setCurrentUser(user) 
      setLoading(false)
    })
      //only run once
    return unsubscribe
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateEmail,
    updatePassword
  }

  return(
    <AuthContext.Provider value = {value}>
      {!loading && children}
      {/* if we are not loading, we will render the children */}
    </AuthContext.Provider>
  )
}