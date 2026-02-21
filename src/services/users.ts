import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
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
