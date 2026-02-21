import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getFirebaseErrorMessage } from '../lib/firebaseError'

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
}

export default function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.displayName || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) setName(user?.displayName || '')
  }, [open, user?.displayName])

  if (!open) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await updateProfile(name)
      onClose()
    } catch (err) {
      setError(getFirebaseErrorMessage(err, 'Could not update profile. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 p-4 backdrop-blur-md">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-white/55 bg-white/45 p-6 shadow-xl backdrop-blur-2xl dark:border-white/15 dark:bg-white/10">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Edit profile</h2>
        {error && <div className="error-banner mb-3">{error}</div>}
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-foreground">Display name</span>
          <input className="glass-input w-full" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="glass-btn flex-1 justify-center py-2.5 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onClose} className="glass-btn glass-btn-subtle flex-1 justify-center py-2.5">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
