import { collection, getDocs, updateDoc, doc, getDoc, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import type { AppUser, Role } from '../lib/types'

export async function getAllUsers(): Promise<AppUser[]> {
  const usersRef = collection(db, 'users')
  const snap = await getDocs(usersRef)
  return snap.docs.map(d => ({ ...(d.data() as AppUser) }))
}

export async function updateUserRole(uid: string, role: Role) {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, { role })
}

export async function getUserDisplayName(uid: string): Promise<string | null> {
  const userRef = doc(db, 'users', uid)
  const snap = await getDoc(userRef)
  if (!snap.exists()) return null
  const data = snap.data() as Partial<AppUser>
  return data.displayName ?? null
}

export async function getUsersDisplayNames(uids: string[]): Promise<Record<string, string | null>> {
  const uniqueUids = Array.from(new Set(uids.filter(Boolean)))
  const entries = await Promise.all(
    uniqueUids.map(async (uid) => {
      const userRef = doc(db, 'users', uid)
      const snap = await getDoc(userRef)
      if (!snap.exists()) return [uid, null] as const
      const data = snap.data() as Partial<AppUser>
      return [uid, data.displayName ?? null] as const
    })
  )
  return Object.fromEntries(entries)
}

export async function getAdminUserIds(): Promise<string[]> {
  const usersRef = collection(db, 'users')
  const q = query(usersRef, where('role', '==', 'admin'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => (d.data() as AppUser).uid)
}
