import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Check, Clock3, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  getComplaint,
  listenComments,
  addComment,
  updateComplaint,
  deleteComplaint,
  updateComment,
  deleteComment,
} from '../services/complaints'
import { useToast } from '../hooks/useToast'
import Header from '../components/Header'
import EditComplaintModal from '../components/EditComplaintModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { formatDateTime } from '../lib/date'

export default function ComplaintDetailPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [c, setC] = useState<any | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [text, setText] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  useEffect(() => {
    if (!id) return
    getComplaint(id).then(setC)
    const unsub = listenComments(id, setComments)
    return () => unsub()
  }, [id])

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id || !text.trim()) return
    if (c?.status !== 'open') {
      toast.error('Comments are closed for resolved complaints')
      return
    }

    try {
      await addComment(id, { text, authorId: user.uid, authorName: user.displayName })
      setText('')
      toast.success('Comment added')
    } catch {
      toast.error('Failed to add comment')
    }
  }

  const markResolved = async () => {
    if (!id) return
    try {
      await updateComplaint(id, { status: 'resolved' })
      setC({ ...c, status: 'resolved' })
      toast.success('Marked as resolved')
    } catch {
      toast.error('Failed to update status')
    }
  }

  const remove = async () => {
    if (!id) return
    if (!confirm('Delete complaint?')) return
    try {
      await deleteComplaint(id)
      toast.success('Complaint deleted')
      nav('/app')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const save = async (title: string, description: string) => {
    if (!id || c?.status !== 'open') return
    await updateComplaint(id, { title, description })
    setC({ ...c, title, description })
  }

  const beginEditComment = (commentId: string, commentText: string) => {
    setEditingCommentId(commentId)
    setEditingCommentText(commentText)
  }

  const cancelEditComment = () => {
    setEditingCommentId(null)
    setEditingCommentText('')
  }

  const saveEditedComment = async (commentId: string) => {
    if (!id || !editingCommentText.trim()) return
    if (c?.status !== 'open') {
      toast.error('Comments are closed for resolved complaints')
      return
    }

    try {
      await updateComment(id, commentId, editingCommentText.trim())
      cancelEditComment()
      toast.success('Comment updated')
    } catch {
      toast.error('Failed to update comment')
    }
  }

  const removeComment = async (commentId: string) => {
    if (!id) return
    if (!confirm('Delete this comment?')) return

    try {
      await deleteComment(id, commentId)
      toast.success('Comment deleted')
    } catch {
      toast.error('Failed to delete comment')
    }
  }

  if (!c) return <div className="p-4 sm:p-6">Complaint not found or deleted.</div>

  const isAuthor = user?.uid === c.authorId
  const isAdmin = user?.role === 'admin'
  const complaintOpen = c.status === 'open'

  const statusClass = complaintOpen
    ? 'border-emerald-300/60 bg-emerald-100/60 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-200'
    : 'border-rose-300/60 bg-rose-100/60 text-rose-800 dark:border-rose-700/60 dark:bg-rose-900/30 dark:text-rose-200'

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-3xl p-4 sm:p-6">
        <div className="glass-panel mb-4 rounded-2xl p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{c.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">By {c.authorName || c.authorId}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-sm font-medium ${statusClass}`}>{c.status}</span>

              {isAdmin && complaintOpen && (
                <button
                  onClick={markResolved}
                  className="glass-icon-btn text-foreground hover:border-emerald-400/65 hover:bg-emerald-100/70 hover:text-emerald-800 dark:hover:border-emerald-700/65 dark:hover:bg-emerald-900/45 dark:hover:text-emerald-200"
                  title="Mark as resolved"
                  aria-label="Mark as resolved"
                >
                  <Check className="size-4" />
                </button>
              )}

              {isAuthor && complaintOpen && (
                <button
                  onClick={() => setEditOpen(true)}
                  className="glass-icon-btn text-foreground hover:border-zinc-300/70 hover:bg-zinc-200/70 hover:text-zinc-800 dark:hover:border-zinc-700/65 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
                  title="Edit complaint"
                  aria-label="Edit complaint"
                >
                  <Pencil className="size-4" />
                </button>
              )}

              {(isAuthor || isAdmin) && (
                <button
                  onClick={remove}
                  className="glass-icon-btn text-foreground hover:border-rose-300/75 hover:bg-rose-100/70 hover:text-rose-800 dark:hover:border-rose-700/65 dark:hover:bg-rose-900/50 dark:hover:text-rose-200"
                  title="Delete complaint"
                  aria-label="Delete complaint"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          </div>

          <p className="mb-6 text-base leading-relaxed text-foreground">{c.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" />
            Logged on {formatDateTime(c.createdAt)}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Comments</h2>
          <div className="mb-6 space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet</p>
            ) : (
              comments.map((cm) => {
                const canDeleteComment = complaintOpen && (user?.uid === cm.authorId || user?.role === 'admin')
                const canEditComment = user?.uid === cm.authorId && complaintOpen
                const isEditing = editingCommentId === cm.id

                return (
                  <div key={cm.id} className="glass-panel flex min-h-25 flex-col rounded-xl px-3 py-2.5">
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          rows={3}
                          className="glass-input w-full text-sm"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => saveEditedComment(cm.id)}
                            className="glass-btn py-1.5 text-sm"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditComment}
                            className="glass-btn glass-btn-subtle py-1.5 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm text-foreground">{cm.text}</div>
                          {canDeleteComment && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="glass-icon-btn size-7"
                                  aria-label="Comment actions"
                                >
                                  <MoreHorizontal className="size-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                {canEditComment && (
                                  <DropdownMenuItem onClick={() => beginEditComment(cm.id, cm.text)}>
                                    <Pencil className="size-4" />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem variant="destructive" onClick={() => removeComment(cm.id)}>
                                  <Trash2 className="size-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                          <span>{cm.authorName || cm.authorId}</span>
                          <span>{formatDateTime(cm.createdAt)}</span>
                        </div>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {complaintOpen ? (
            <form onSubmit={submitComment} className="flex flex-col gap-2 sm:flex-row">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment..."
                className="glass-input flex-1"
              />
              <button className="glass-btn py-2.5 sm:w-auto hover:bg-white/65 dark:hover:bg-white/18">
                Send
              </button>
            </form>
          ) : (
            <div className="glass-panel flex items-center gap-2 rounded-xl border-rose-300/50 bg-rose-100/45 px-3 py-2 text-sm text-rose-800 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-200">
              <Clock3 className="size-4" />
              Comments are now locked because this complaint is resolved.
            </div>
          )}
        </div>
      </main>

      <EditComplaintModal
        title={c.title}
        description={c.description}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={save}
      />
    </div>
  )
}
