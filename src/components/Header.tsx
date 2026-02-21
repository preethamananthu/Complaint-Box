import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Bell, LogOut, Pencil, UserCircle2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import EditProfileModal from './EditProfileModal'
import { deleteAllNotifications, deleteNotification, listenNotifications } from '../services/notifications'
import type { AppNotification } from '../lib/types'
import { formatDateTime } from '../lib/date'

export default function Header() {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const nav = useNavigate()

  useEffect(() => {
    if (!user) return
    const unsub = listenNotifications(user.uid, setNotifications)
    return () => unsub()
  }, [user])

  const handleLogout = async () => {
    await logout()
    nav('/')
  }

  const handleOpenNotification = async (n: AppNotification) => {
    if (!n.id) return
    await deleteNotification(n.id)
    nav(`/complaints/${n.complaintId}`)
  }

  const handleClearAll = async () => {
    const ids = notifications.map((n) => n.id).filter(Boolean) as string[]
    if (ids.length === 0) return
    await deleteAllNotifications(ids)
  }

  const handleDeleteNotification = async (e: React.MouseEvent, id?: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!id) return
    await deleteNotification(id)
  }

  return (
    <>
      <header className="w-full border-b border-white/30 bg-white/35 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5 sm:p-4">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/app" className="text-lg font-semibold text-foreground">Complaint Box</Link>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {user && <div className="max-w-full truncate text-sm text-muted-foreground">{user.displayName ?? user.email}</div>}
            <ThemeToggle />
            {user?.role === 'admin' && <Link to="/admin" className="glass-btn text-sm">Users</Link>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="glass-icon-btn relative size-9" aria-label="Notifications">
                  <Bell className="size-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-rose-600 px-1.5 text-[10px] leading-4 text-white">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm font-medium text-foreground">Notifications</span>
                  <button type="button" onClick={handleClearAll} className="text-xs text-muted-foreground hover:text-foreground">
                    Clear all
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground">No notifications yet</div>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <DropdownMenuItem key={n.id} onClick={() => handleOpenNotification(n)} className="flex-col items-start gap-0.5">
                      <div className="flex w-full items-start justify-between gap-2">
                        <span className="text-sm text-foreground">{n.message}</span>
                        <button
                          type="button"
                          aria-label="Delete notification"
                          className="rounded p-0.5 text-muted-foreground hover:bg-white/20 hover:text-foreground"
                          onClick={(e) => handleDeleteNotification(e, n.id)}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground">{n.complaintTitle || 'Complaint'} • {formatDateTime(n.createdAt)}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="glass-icon-btn size-9" aria-label="User menu">
                  <UserCircle2 className="size-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                  <Pencil className="size-4" />
                  Edit profile
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <EditProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  )
}
