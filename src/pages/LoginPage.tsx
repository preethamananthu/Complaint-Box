import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import { getFirebaseErrorMessage } from '../lib/firebaseError'

export default function LoginPage() {
  const { login, googleSignIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      nav('/app')
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err, 'Could not sign in. Check your credentials and try again.'))
    } finally {
      setLoading(false)
    }
  }

  const google = async () => {
    setLoading(true)
    try {
      await googleSignIn()
      nav('/app')
    } catch (err: any) {
      setError(getFirebaseErrorMessage(err, 'Google sign-in failed. Please try again.'))
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
        <h1 className="mb-1 text-3xl font-semibold text-foreground">Welcome back</h1>
        <p className="mb-6 text-sm font-medium text-foreground/65">Sign in to your account</p>
        {error && <div className="error-banner mb-4">{error}</div>}
        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-foreground">Email</span>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="glass-input w-full" />
        </label>
        <label className="mb-6 block">
          <span className="mb-2 block text-sm font-medium text-foreground">Password</span>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="glass-input w-full" />
        </label>
        <button disabled={loading} className="glass-btn w-full justify-center py-2.5 disabled:opacity-50">{loading? 'Signing in...' : 'Sign in'}</button>
        <button type="button" onClick={google} className="glass-btn glass-btn-subtle mt-3 w-full justify-center py-2.5">Continue with Google</button>
        <div className="mt-6 flex flex-wrap justify-between gap-2 text-sm">
          <Link to="/forgot" className="text-muted-foreground hover:text-foreground hover:underline transition">Forgot password?</Link>
          <Link to="/signup" className="text-muted-foreground hover:text-foreground hover:underline transition">Create account</Link>
        </div>
      </form>
    </div>
  )
}
