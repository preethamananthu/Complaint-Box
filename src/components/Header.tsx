import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { LogOut, Pencil, UserCircle2 } from 'lucide-react'
import { useState } from 'react'
import EditProfileModal from './EditProfileModal'

export default function Header() {
  const { user, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const nav = useNavigate()

  const handleLogout = async () => {
    await logout()
    nav('/')
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
