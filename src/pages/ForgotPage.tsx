import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import { getFirebaseErrorMessage } from '../lib/firebaseError'

export default function ForgotPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err, 'Could not send reset email. Please try again.'))
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <ThemeToggle className="absolute right-4 top-4" />
      <form onSubmit={submit} className="glass-panel w-full max-w-md rounded-2xl p-6">
        <Link to="/" className="mb-4 inline-flex text-sm text-muted-foreground hover:text-foreground">
          Back to home
        </Link>
        <h1 className="mb-4 text-2xl font-semibold">Reset password</h1>
        {error && <div className="error-banner mb-3">{error}</div>}
        {sent ? <div className="text-muted-foreground">Check your email for reset link.</div> : (
          <>
            <label className="mb-4 block">Email
              <input value={email} onChange={e=>setEmail(e.target.value)} className="glass-input mt-1 w-full" />
            </label>
            <button className="glass-btn w-full justify-center py-2.5">Send reset</button>
          </>
        )}
      </form>
    </div>
  )
}
