import { useState } from 'react'
import { useToast } from '../hooks/useToast'

interface EditComplaintModalProps {
  title: string
  description: string
  open: boolean
  onClose: () => void
  onSave: (title: string, description: string) => Promise<void>
}

export default function EditComplaintModal({
  title: initialTitle,
  description: initialDesc,
  open,
  onClose,
  onSave,
}: EditComplaintModalProps) {
  const toast = useToast()
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDesc)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(title, description)
      toast.success('Complaint updated')
      onClose()
    } catch {
      toast.error('Failed to update')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Edit Complaint</h2>
        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-foreground">Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="glass-input w-full" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-foreground">Description</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="glass-input w-full" />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="glass-btn flex-1 justify-center py-2.5 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="glass-btn glass-btn-subtle flex-1 justify-center py-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
