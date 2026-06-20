import { useState, type FormEvent } from 'react'
import { Instagram } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ApiError } from '../api/client'

export default function Auth() {
  const { login, signup } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const isSignup = mode === 'signup'
  const canSubmit =
    username.trim().length >= 3 &&
    password.length >= 6 &&
    (!isSignup || fullName.trim().length > 0)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit || busy) return
    setBusy(true)
    setError('')
    try {
      if (isSignup) await signup(username.trim(), fullName.trim(), password)
      else await login(username.trim(), password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong')
      setBusy(false)
    }
  }

  function switchMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setError('')
  }

  function fillDemo() {
    setMode('login')
    setUsername('maya.travels')
    setPassword('password123')
    setError('')
  }

  return (
    <div className="auth-page">
      <div className="auth-stack">
        <div className="auth-card">
          <div className="auth-logo">
            <Instagram size={34} strokeWidth={1.6} />
            <span className="logo">Instagram</span>
          </div>

          {isSignup && (
            <p className="auth-tagline">
              Sign up to see photos and videos from your friends.
            </p>
          )}

          <form onSubmit={onSubmit} className="auth-form">
            {isSignup && (
              <input
                className="auth-input"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            )}
            <input
              className="auth-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
              autoComplete="username"
              autoCapitalize="none"
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-submit" type="submit" disabled={!canSubmit || busy}>
              {busy ? '…' : isSignup ? 'Sign up' : 'Log in'}
            </button>
          </form>

          {!isSignup && (
            <button className="auth-demo" onClick={fillDemo} type="button">
              Use a demo account
            </button>
          )}
        </div>

        <div className="auth-card auth-switch">
          {isSignup ? 'Have an account?' : "Don't have an account?"}{' '}
          <button onClick={switchMode} type="button">
            {isSignup ? 'Log in' : 'Sign up'}
          </button>
        </div>

        <p className="auth-hint">
          Demo accounts use the password <code>password123</code> — e.g.{' '}
          <code>maya.travels</code>, <code>leo.cooks</code>, or <code>you</code>.
        </p>
      </div>
    </div>
  )
}
