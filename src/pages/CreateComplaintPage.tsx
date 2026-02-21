import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { createComplaint } from '../services/complaints'
import { useToast } from '../hooks/useToast'
import Header from '../components/Header'

export default function CreateComplaintPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim() || !description.trim()) {
      toast.error('Please fill all fields')
      return
    }
    setLoading(true)
    try {
      const id = await createComplaint({ title, description, authorId: user.uid, authorName: user.displayName })
      toast.success('Complaint created successfully')
      nav(`/complaints/${id}`)
    } catch (err: any) {
      toast.error('Failed to create complaint')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Header />
      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <form onSubmit={submit} className="glass-panel max-w-2xl rounded-2xl p-6">
          <h1 className="mb-1 text-2xl font-semibold text-foreground">Create Complaint</h1>
          <p className="mb-6 text-sm text-muted-foreground">Share your feedback with us</p>
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-foreground">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter complaint title"
              className="glass-input w-full"
              required
            />
          </label>
          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-medium text-foreground">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your complaint in detail"
              rows={5}
              className="glass-input w-full"
              required
            />
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="glass-btn py-2.5 disabled:opacity-50 sm:w-auto"
            >
              {loading ? 'Posting...' : 'Post Complaint'}
            </button>
            <button
              type="button"
              onClick={() => nav('/app')}
              className="glass-btn glass-btn-subtle py-2.5 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
