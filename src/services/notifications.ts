import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore'
import { db } from '../../firebase'
import type { AppNotification, NotificationType } from '../lib/types'

const notificationsRef = collection(db, 'notifications')

interface CreateNotificationInput {
  recipientId: string
  actorId: string
  actorName?: string | null
  type: NotificationType
  complaintId: string
  complaintTitle?: string | null
  message: string
}

export async function createNotification(input: CreateNotificationInput) {
  if (!input.recipientId || input.recipientId === input.actorId) return
  await addDoc(notificationsRef, {
    recipientId: input.recipientId,
    actorId: input.actorId,
    actorName: input.actorName || null,
    type: input.type,
    complaintId: input.complaintId,
    complaintTitle: input.complaintTitle || null,
    message: input.message,
    isRead: false,
    createdAt: serverTimestamp(),
  } as AppNotification)
}

export function listenNotifications(recipientId: string, cb: (items: AppNotification[]) => void) {
  const q = query(
    notificationsRef,
    where('recipientId', '==', recipientId),
    where('isRead', '==', false)
  )
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as AppNotification) }))
    items.sort((a, b) => {
      const aTs = a.createdAt?.seconds ?? 0
      const bTs = b.createdAt?.seconds ?? 0
      return bTs - aTs
    })
    cb(items)
  }, () => cb([]))
}

export async function markNotificationAsRead(notificationId: string) {
  const ref = doc(db, 'notifications', notificationId)
  await updateDoc(ref, { isRead: true, readAt: serverTimestamp() })
}

export async function markAllNotificationsAsRead(notificationIds: string[]) {
  await Promise.all(notificationIds.map((id) => markNotificationAsRead(id)))
}

export async function deleteNotification(notificationId: string) {
  await deleteDoc(doc(db, 'notifications', notificationId))
}

export async function deleteAllNotifications(notificationIds: string[]) {
  await Promise.all(notificationIds.map((id) => deleteNotification(id)))
}
