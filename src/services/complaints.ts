import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import type { Complaint, Comment } from '../lib/types'
import { getAdminUserIds } from './users'
import { createNotification } from './notifications'

const complaintsRef = collection(db, 'complaints')

export async function createComplaint(data: Partial<Complaint>) {
  const docRef = await addDoc(complaintsRef, {
    title: data.title,
    description: data.description,
    status: 'open',
    isDeleted: false,
    authorId: data.authorId,
    authorName: data.authorName || null,
    createdAt: serverTimestamp(),
  })

  const adminIds = await getAdminUserIds()
  await Promise.all(
    adminIds.map((adminId) =>
      createNotification({
        recipientId: adminId,
        actorId: data.authorId || '',
        actorName: data.authorName || null,
        type: 'complaint_created',
        complaintId: docRef.id,
        complaintTitle: data.title || null,
        message: `${data.authorName || 'A user'} lodged a new complaint`,
      })
    )
  )

  return docRef.id
}

export async function updateComplaint(id: string, patch: Partial<Complaint>) {
  const d = doc(db, 'complaints', id)
  await updateDoc(d, { ...patch, updatedAt: serverTimestamp() })
}

export async function deleteComplaint(id: string) {
  await updateDoc(doc(db, 'complaints', id), {
    isDeleted: true,
    deletedAt: serverTimestamp(),
  })
}

export function listenAllComplaints(cb: (items: any[]) => void) {
  const q = query(complaintsRef, where('isDeleted', '==', false), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
    cb(data)
  })
}

export function listenUserComplaints(userId: string, cb: (items: any[]) => void) {
  const q = query(
    complaintsRef,
    where('authorId', '==', userId),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))))
}

export async function getComplaint(id: string) {
  const d = doc(db, 'complaints', id)
  const snap = await getDoc(d)
  if (!snap.exists()) return null
  const data = { id: snap.id, ...(snap.data() as any) }
  if (data.isDeleted) return null
  return data
}

// Comments are stored as subcollection: complaints/{id}/comments
export function listenComments(complaintId: string, cb: (items: any[]) => void) {
  const commentsRef = collection(db, 'complaints', complaintId, 'comments')
  const q = query(commentsRef, orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))))
}

export async function addComment(complaintId: string, comment: Partial<Comment>) {
  const commentsRef = collection(db, 'complaints', complaintId, 'comments')
  await addDoc(commentsRef, { ...comment, createdAt: serverTimestamp() })
}

export async function updateComment(complaintId: string, commentId: string, text: string) {
  const commentRef = doc(db, 'complaints', complaintId, 'comments', commentId)
  await updateDoc(commentRef, { text, updatedAt: serverTimestamp() })
}

export async function deleteComment(complaintId: string, commentId: string) {
  const commentRef = doc(db, 'complaints', complaintId, 'comments', commentId)
  await deleteDoc(commentRef)
}
