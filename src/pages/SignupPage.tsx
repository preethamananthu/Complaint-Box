import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import { getFirebaseErrorMessage } from '../lib/firebaseError'

const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d).+$/

export default function SignupPage() {
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!PASSWORD_RULE.test(password)) {
      setError('Password must contain at least 1 uppercase letter and 1 number.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await signup(email, password, displayName)
      nav('/app')
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err, 'Could not create account. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <ThemeToggle className="absolute right-4 top-4" />
      <form onSubmit={submit} className="glass-panel w-full max-w-md rounded-2xl p-8">
        <Link to="/" className="mb-4 inline-flex text-sm text-muted-foreground hover:text-foreground">
          Back to home
        </Link>
        <h1 className="mb-1 text-3xl font-semibold text-foreground">Create account</h1>
        <p className="mb-6 text-sm text-muted-foreground">Join us today</p>
        {error && <div className="error-banner mb-4">{error}</div>}
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-foreground">Full Name</span>
          <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="John Doe" className="glass-input w-full" />
        </label>
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-foreground">Email</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="glass-input w-full" required />
        </label>
        <label className="mb-2 block">
          <span className="mb-2 block text-sm font-medium text-foreground">Password</span>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="glass-input w-full" required />
        </label>
        <p className="mb-4 text-xs text-muted-foreground">Use at least 1 uppercase letter and 1 number.</p>
        <label className="mb-6 block">
          <span className="mb-2 block text-sm font-medium text-foreground">Confirm Password</span>
          <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="••••••••" className="glass-input w-full" required />
        </label>
        <button disabled={loading} className="glass-btn w-full justify-center py-2.5 disabled:opacity-50">{loading? 'Creating...' : 'Create account'}</button>
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link to="/login" className="text-foreground hover:opacity-70 transition">Sign in</Link>
        </div>
      </form>
    </div>
  )
}
