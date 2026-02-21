import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth, db } from '../../firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import type { AppUser } from '../lib/types'
import { toSentenceCase } from '../lib/text'

interface AuthContextValue {
  user: AppUser | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signup: (email: string, password: string, displayName?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  googleSignIn: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (displayName: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const isAdminUser = (uid: string) =>
    (import.meta.env.VITE_ADMIN_UIDS as string | undefined)
      ?.split(',')
      .map((s) => s.trim())
      .includes(uid) ?? false

  const ensureUserProfile = async (fbUser: FirebaseUser): Promise<AppUser> => {
    const uref = doc(db, 'users', fbUser.uid)
    const snap = await getDoc(uref)

    if (snap.exists()) {
      return snap.data() as AppUser
    }

    const role = isAdminUser(fbUser.uid) ? 'admin' : 'user'

    const newUser: AppUser = {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: toSentenceCase(fbUser.displayName),
      role,
      createdAt: serverTimestamp() as any,
    }

    await setDoc(uref, newUser)
    return newUser
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)

      if (!fbUser) {
        setUser(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const profile = await ensureUserProfile(fbUser)
        setUser(profile)
      } catch (err) {
        console.error('Failed to load/create user profile after auth state change:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [])

  const signup = async (email: string, password: string, displayName?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const u = cred.user
    const role = isAdminUser(u.uid) ? 'admin' : 'user'
    const uref = doc(db, 'users', u.uid)

    await setDoc(uref, {
      uid: u.uid,
      email: u.email,
      displayName: toSentenceCase(displayName),
      role,
      createdAt: serverTimestamp(),
    })
  }

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => signOut(auth)

  const resetPassword = (email: string) => sendPasswordResetEmail(auth, email)

  const updateProfile = async (displayName: string) => {
    if (!firebaseUser || !user) throw new Error('User is not signed in')
    const normalizedName = toSentenceCase(displayName)
    const uref = doc(db, 'users', firebaseUser.uid)

    await setDoc(
      uref,
      {
        displayName: normalizedName,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    setUser({
      ...user,
      displayName: normalizedName,
    })
  }

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signup, login, googleSignIn, logout, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
