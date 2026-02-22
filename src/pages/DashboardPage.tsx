import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { listenAllComplaints, listenUserComplaints } from '../services/complaints'
import { getUsersDisplayNames } from '../services/users'
import Header from '../components/Header'
import { formatDateTime } from '../lib/date'

type SortOrder = 'newest' | 'oldest'
type FilterPanelSection = 'people' | 'resolution' | 'date'

function toDate(value: any): Date | null {
  if (!value) return null
  if (typeof value?.toDate === 'function') return value.toDate()
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000)
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [items, setItems] = useState<any[]>([])
  const [authorNames, setAuthorNames] = useState<Record<string, string | null>>({})
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<Array<'open' | 'resolved'>>(['open', 'resolved'])
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)
  const [filterSection, setFilterSection] = useState<FilterPanelSection>('people')

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

  const authorOptions = useMemo(() => {
    const uniqueIds = Array.from(new Set(items.map((c) => c.authorId).filter(Boolean)))
    return uniqueIds
      .map((authorId) => ({
        id: authorId,
        label: authorNames[authorId] || items.find((c) => c.authorId === authorId)?.authorName || authorId,
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [items, authorNames])

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null
    const to = dateTo ? new Date(`${dateTo}T23:59:59`) : null

    const filtered = items.filter((c) => {
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(c.status)) return false
      if (isAdmin && selectedAuthors.length > 0 && !selectedAuthors.includes(c.authorId)) return false

      const createdAt = toDate(c.createdAt)
      if (from && (!createdAt || createdAt < from)) return false
      if (to && (!createdAt || createdAt > to)) return false

      if (!q) return true
      const haystack = `${c.title || ''} ${c.description || ''}`.toLowerCase()
      return haystack.includes(q)
    })

    filtered.sort((a, b) => {
      const aTime = toDate(a.createdAt)?.getTime() || 0
      const bTime = toDate(b.createdAt)?.getTime() || 0
      return sortOrder === 'newest' ? bTime - aTime : aTime - bTime
    })

    return filtered
  }, [items, search, dateFrom, dateTo, sortOrder, selectedAuthors, selectedStatuses, isAdmin])

  const toggleAuthor = (authorId: string) => {
    setSelectedAuthors((prev) =>
      prev.includes(authorId) ? prev.filter((id) => id !== authorId) : [...prev, authorId]
    )
  }

  const resetFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setSortOrder('newest')
    setSelectedAuthors([])
    setSelectedStatuses(['open', 'resolved'])
  }

  const toggleStatus = (status: 'open' | 'resolved') => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    )
  }

  useEffect(() => {
    if (!isAdmin) {
      setSelectedAuthors([])
      setFilterSection('date')
    }
  }, [isAdmin])

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Complaints</h1>
              {/* {user?.role === 'admin' && <p className="mt-1 text-sm text-muted-foreground">Viewing all complaints</p>} */}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="glass-input h-9 w-45 text-sm sm:w-56"
              />
              <button
                type="button"
                className="glass-btn"
                onClick={() => setFilterPanelOpen(true)}
              >
                Filters
              </button>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="glass-input h-9 w-46 py-1 text-sm"
              >
                <option value="newest">Date: Latest</option>
                <option value="oldest">Date: Oldest</option>
              </select>
              <Link to="/create" className="glass-btn">New Complaint</Link>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <p>Showing {filteredItems.length} of {items.length} complaints</p>
            {(search || dateFrom || dateTo || (isAdmin && selectedAuthors.length > 0) || selectedStatuses.length < 2 || sortOrder !== 'newest') && (
              <button type="button" onClick={resetFilters} className="glass-btn glass-btn-subtle py-1.5 text-sm">
                Reset filters
              </button>
            )}
          </div>
        </div>

        {filterPanelOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
            onClick={() => setFilterPanelOpen(false)}
          >
            <div
              className="glass-panel h-[460px] w-full max-w-4xl rounded-2xl p-4 sm:p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-foreground">Filters</h2>
                <p className="text-xs text-muted-foreground">Choose a section from the left</p>
              </div>

              <div className="grid h-[330px] gap-4 sm:grid-cols-[180px_1fr]">
                <aside className="rounded-xl border border-white/35 bg-white/20 p-2 dark:border-white/10 dark:bg-white/5">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setFilterSection('people')}
                      className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm ${
                        filterSection === 'people'
                          ? 'bg-white/45 text-foreground dark:bg-white/16'
                          : 'text-muted-foreground hover:bg-white/20 dark:hover:bg-white/10'
                      }`}
                    >
                      People
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setFilterSection('resolution')}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      filterSection === 'resolution'
                        ? 'bg-white/45 text-foreground dark:bg-white/16'
                        : 'text-muted-foreground hover:bg-white/20 dark:hover:bg-white/10'
                    }`}
                  >
                    Resolution
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterSection('date')}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      filterSection === 'date'
                        ? 'bg-white/45 text-foreground dark:bg-white/16'
                        : 'text-muted-foreground hover:bg-white/20 dark:hover:bg-white/10'
                    }`}
                  >
                    Date
                  </button>
                </aside>

                <section className="overflow-hidden rounded-xl border border-white/35 bg-white/20 p-3 dark:border-white/10 dark:bg-white/5">
                  {isAdmin && filterSection === 'people' ? (
                    <>
                      <div className="mb-2 text-sm font-medium text-foreground">People who complained</div>
                      {authorOptions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No complainants available.</p>
                      ) : (
                        <div className="h-[255px] overflow-auto pr-1">
                          <div className="space-y-1.5">
                            {authorOptions.map((author) => (
                              <button
                                key={author.id}
                                type="button"
                                onClick={() => toggleAuthor(author.id)}
                                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                                  selectedAuthors.includes(author.id)
                                    ? 'border-white/60 bg-white/45 text-foreground dark:border-white/25 dark:bg-white/18'
                                    : 'border-white/30 bg-white/10 text-muted-foreground hover:bg-white/20 dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/12'
                                }`}
                              >
                                {author.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : filterSection === 'resolution' ? (
                    <>
                      <div className="mb-3 text-sm font-medium text-foreground">Status</div>
                      <div className="mb-4 space-y-1.5">
                        {(['open', 'resolved'] as Array<'open' | 'resolved'>).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => toggleStatus(status)}
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                              selectedStatuses.includes(status)
                                ? 'border-white/60 bg-white/45 text-foreground dark:border-white/25 dark:bg-white/18'
                                : 'border-white/30 bg-white/10 text-muted-foreground hover:bg-white/20 dark:border-white/10 dark:bg-white/6 dark:hover:bg-white/12'
                            }`}
                          >
                            {status === 'open' ? 'Open' : 'Resolved'}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-3 text-sm font-medium text-foreground">Date range</div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-muted-foreground">From date</span>
                          <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="glass-input w-full"
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-muted-foreground">To date</span>
                          <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="glass-input w-full"
                          />
                        </label>
                      </div>
                    </>
                  )}
                </section>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? `${selectedAuthors.length} people selected` : `${selectedStatuses.length} statuses selected`}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="glass-btn glass-btn-subtle py-1.5 text-sm"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterPanelOpen(false)}
                    className="glass-btn py-1.5 text-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(search || dateFrom || dateTo || (isAdmin && selectedAuthors.length > 0) || selectedStatuses.length < 2 || sortOrder !== 'newest') && (
          <div className="mb-6 flex flex-wrap items-center gap-2 text-xs">
            {!!search && <span className="glass-chip">Search: {search}</span>}
            {!!dateFrom && <span className="glass-chip">From: {dateFrom}</span>}
            {!!dateTo && <span className="glass-chip">To: {dateTo}</span>}
            {isAdmin && selectedAuthors.length > 0 && <span className="glass-chip">People: {selectedAuthors.length}</span>}
            {selectedStatuses.length < 2 && (
              <span className="glass-chip">Status: {selectedStatuses.join(', ') || 'none'}</span>
            )}
            <span className="glass-chip">
              Sort: {sortOrder === 'newest' ? 'Date high to low' : 'Date low to high'}
            </span>
          </div>
        )}

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
        ) : filteredItems.length === 0 ? (
          <div className="glass-panel rounded-2xl py-14 text-center">
            <p className="text-muted-foreground">No complaints match your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((c) => {
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
