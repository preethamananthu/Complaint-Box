import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Sparkles, MessagesSquare } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ThemeToggle className="absolute right-4 top-4 z-20" />

      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-white/30 blur-3xl dark:bg-white/10" />
      <div className="pointer-events-none absolute -right-15 top-36 h-80 w-80 rounded-full bg-white/20 blur-3xl dark:bg-white/10" />

      <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-20">
        <section className="glass-panel relative overflow-hidden rounded-3xl p-8 sm:p-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/40 px-3 py-1 text-xs font-medium text-foreground/80 backdrop-blur dark:border-white/20 dark:bg-white/10">
            <Sparkles className="size-3.5" />
            Voice-driven complaint management
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Complaint handling that feels calm, clear, and accountable.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Capture issues, track responses, and close the loop with complete transparency for users and admins.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/signup" className="glass-btn inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              Get started
              <ArrowRight className="size-4" />
            </Link>
            <Link to="/login" className="glass-btn glass-btn-subtle px-5 py-2.5 text-sm">
              Sign in
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            <div className="glass-panel rounded-2xl p-4">
              <ShieldCheck className="mb-2 size-4" />
              <div className="text-sm font-medium">Role-aware access</div>
              <p className="mt-1 text-xs text-muted-foreground">Clear permissions for users and admins.</p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <MessagesSquare className="mb-2 size-4" />
              <div className="text-sm font-medium">Threaded comments</div>
              <p className="mt-1 text-xs text-muted-foreground">Collaborative updates on every complaint.</p>
            </div>
            <div className="glass-panel rounded-2xl p-4">
              <Sparkles className="mb-2 size-4" />
              <div className="text-sm font-medium">Clean audit trail</div>
              <p className="mt-1 text-xs text-muted-foreground">Status changes and actions are always visible.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
