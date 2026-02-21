import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { listenAllComplaints, listenUserComplaints } from '../services/complaints'
import { getUsersDisplayNames } from '../services/users'
import Header from '../components/Header'
import { formatDateTime } from '../lib/date'

export default function DashboardPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [authorNames, setAuthorNames] = useState<Record<string, string | null>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const unsub = user.role === 'admin'
      ? listenAllComplaints((data) => {
          setItems(data)
          setLoading(false)
        })
      : listenUserComplaints(user.uid, (data) => {
          setItems(data)
          setLoading(false)
        })
    return () => unsub()
  }, [user])

  useEffect(() => {
    const authorIds = items.map((c) => c.authorId).filter(Boolean)
    if (authorIds.length === 0) {
      setAuthorNames({})
      return
    }

    let cancelled = false
    getUsersDisplayNames(authorIds)
      .then((names) => {
        if (!cancelled) setAuthorNames(names)
      })
      .catch(() => {
        if (!cancelled) setAuthorNames({})
      })

    return () => {
      cancelled = true
    }
  }, [items])

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Complaints</h1>
            {user?.role === 'admin' && <p className="mt-1 text-sm text-muted-foreground">Viewing all complaints</p>}
          </div>
          <div className="flex gap-2">
            <Link to="/create" className="glass-btn">New Complaint</Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-panel rounded-xl p-4 animate-pulse">
                <div className="mb-3 h-8 w-2/3 rounded bg-white/40 dark:bg-white/10" />
                <div className="mb-2 h-4 rounded bg-white/35 dark:bg-white/10" />
                <div className="h-4 w-4/5 rounded bg-white/35 dark:bg-white/10" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-panel rounded-2xl py-14 text-center">
            <p className="text-muted-foreground">No complaints yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((c) => {
              const statusClass = c.status === 'open'
                ? 'border-emerald-300/60 bg-emerald-100/60 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-200'
                : 'border-rose-300/60 bg-rose-100/60 text-rose-800 dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-200'

              return (
                <Link
                  to={`/complaints/${c.id}`}
                  key={c.id}
                  className="glass-panel block rounded-2xl p-4 transition hover:-translate-y-px hover:bg-white/50 dark:hover:bg-white/9"
                >
                  <div className="flex min-h-40 flex-col">
                    <h2 className="mb-1 line-clamp-2 text-base font-semibold text-foreground">{c.title}</h2>
                    <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">{c.description?.slice(0, 150)}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        <div>{authorNames[c.authorId] || c.authorName || c.authorId}</div>
                        <div>{formatDateTime(c.createdAt)}</div>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}`}>{c.status}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
