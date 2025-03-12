import { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined)

  const signUpNewUser = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      console.log("Error signing up user:", error)
      return { success: false, error }
    }
    return { success: true, data }
  }

  const signInUser =  async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })
      if (error) {
        console.error("Error signing in user:", error)
        return { success: false, error: error.message }
      }
      return { success: true, data }
    } catch (error) {
      console.error("Error signing in user:", error)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  const signOut = () => {
    const { error } = supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
    } 
  }

  return (
    <AuthContext.Provider value={{ session, signUpNewUser, signInUser, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const UserAuth = () => {
  return useContext(AuthContext)
}