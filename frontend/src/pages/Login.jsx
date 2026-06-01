import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('signin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function clear() { setError(''); setMessage('') }

  async function handleSignIn(e) {
    e.preventDefault()
    clear()
    setLoading(true)
    try {
      const fd = new FormData(e.target)
      await login(fd.get('username'), fd.get('password'), fd.get('remember') === 'on')
      navigate('/')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleRegister(e) {
    e.preventDefault()
    clear()
    setLoading(true)
    try {
      const fd = new FormData(e.target)
      const data = Object.fromEntries(fd)
      await api.register({ username: data.username, email: data.email, password: data.password, full_name: data.full_name })
      setMessage('Account created! You can now sign in.')
      setTab('signin')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  async function handleForgot(e) {
    e.preventDefault()
    clear()
    setLoading(true)
    try {
      const fd = new FormData(e.target)
      await api.forgotPassword(fd.get('email'))
      setMessage('If that email exists, a reset link has been sent.')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Inventory</h1>
        </div>

        <div className="login-tabs">
          <button className={`login-tab ${tab === 'signin' ? 'active' : ''}`} onClick={() => { setTab('signin'); clear() }}>Sign In</button>
          <button className={`login-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); clear() }}>Register</button>
          <button className={`login-tab ${tab === 'forgot' ? 'active' : ''}`} onClick={() => { setTab('forgot'); clear() }}>Forgot</button>
        </div>

        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {tab === 'signin' && (
          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" placeholder="Enter your username" autoFocus required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Enter your password" required />
            </div>
            <label className="login-remember">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full name</label>
              <input type="text" name="full_name" placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" name="username" placeholder="Choose a username" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="At least 6 characters" minLength={6} required />
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
            <p className="login-footer-text">
              Already have an account?{' '}
              <button type="button" className="login-link" onClick={() => setTab('signin')}>Sign in</button>
            </p>
          </form>
        )}

        {tab === 'forgot' && (
          <form onSubmit={handleForgot}>
            <p className="login-hint">Enter your email and we'll send you instructions to reset your password.</p>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="you@example.com" required />
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <p className="login-footer-text">
              Remember your password?{' '}
              <button type="button" className="login-link" onClick={() => setTab('signin')}>Sign in</button>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
