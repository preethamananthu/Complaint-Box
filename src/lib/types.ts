export type Role = 'admin' | 'user'

export interface AppUser {
  uid: string
  email: string | null
  displayName?: string | null
  role: Role
  createdAt: { seconds: number; nanoseconds: number } | null
}

export interface Complaint {
  id?: string
  title: string
  description: string
  status: 'open' | 'resolved'
  isDeleted?: boolean
  authorId: string
  authorName?: string | null
  createdAt: any
  updatedAt?: any
  deletedAt?: any
}

export interface Comment {
  id?: string
  text: string
  authorId: string
  authorName?: string | null
  createdAt: any
  updatedAt?: any
}

export type NotificationType = 'complaint_created' | 'comment_added'

export interface AppNotification {
  id?: string
  recipientId: string
  actorId: string
  actorName?: string | null
  type: NotificationType
  complaintId: string
  complaintTitle?: string | null
  message: string
  isRead: boolean
  createdAt: any
  readAt?: any
}
