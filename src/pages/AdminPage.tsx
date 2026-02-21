import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { getAllUsers, updateUserRole } from '../services/users'
import { useToast } from '../hooks/useToast'
import type { AppUser, Role } from '../lib/types'

export default function AdminPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllUsers()
        setUsers(data)
      } catch {
        toast.error('Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const changeRole = async (uid: string, role: Role) => {
    try {
      await updateUserRole(uid, role)
      setUsers(users.map(u => u.uid === uid ? { ...u, role } : u))
      toast.success(`Role updated to ${role}`)
    } catch {
      toast.error('Failed to update role')
    }
  }

  if (user?.role !== 'admin') {
    return <div className="p-4 sm:p-6">Access denied</div>
  }

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-4xl p-4 sm:p-6">
        <h1 className="mb-1 text-2xl font-semibold text-foreground">User Management</h1>
        <p className="mb-6 text-sm text-muted-foreground">Manage user roles and permissions</p>
        {loading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : (
          <div className="glass-panel overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-160">
                <thead className="border-b border-border/60 bg-white/20 dark:bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.uid} className={`${i !== users.length - 1 ? 'border-b border-border/40' : ''}`}>
                      <td className="px-4 py-3 text-sm text-foreground">{u.email}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{u.displayName || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="glass-chip text-xs">{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => changeRole(u.uid, e.target.value as Role)}
                          className="glass-input px-2 py-1 text-sm"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
