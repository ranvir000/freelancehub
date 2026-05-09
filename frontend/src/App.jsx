import React, { createContext, useContext, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

// ── API base URL (auto-switches between local and deployed) ──────────────────
const BASE = import.meta.env.VITE_API_URL || ''
export const api = axios.create({ baseURL: BASE })
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('fh_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

// ── Auth Context ─────────────────────────────────────────────────────────────
const AuthCtx = createContext(null)
export function useAuth() { return useContext(AuthCtx) }

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fh_user')) } catch { return null }
  })
  const login = useCallback((userData, token) => {
    setUser(userData)
    localStorage.setItem('fh_user', JSON.stringify(userData))
    localStorage.setItem('fh_token', token)
  }, [])
  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('fh_user')
    localStorage.removeItem('fh_token')
  }, [])
  return <AuthCtx.Provider value={{ user, login, logout }}>{children}</AuthCtx.Provider>
}

// ── Toast Context ─────────────────────────────────────────────────────────────
const ToastCtx = createContext(null)
export function useToast() { return useContext(ToastCtx) }

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }, [])
  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? '✓' : '✕'} {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

// ── Protected Route ───────────────────────────────────────────────────────────
function Protected({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" />
  return children
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()
  const isHome = loc.pathname === '/'

  return (
    <nav style={{
      background: isHome ? 'transparent' : '#fff',
      borderBottom: isHome ? 'none' : '1px solid var(--border)',
      padding: '0 24px', height: 64,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: isHome ? 'absolute' : 'sticky',
      top: 0, left: 0, right: 0, zIndex: 100,
    }}>
      <Link to="/" style={{ fontSize: 20, fontWeight: 800, color: isHome ? '#fff' : 'var(--brand)' }}>
        Freelance<span style={{ color: isHome ? '#a5b4fc' : 'var(--brand-d)' }}>Hub</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user ? (
          <>
            <Link to="/dashboard">
              <button className="btn btn-ghost btn-sm" style={{ color: isHome ? '#fff' : undefined, borderColor: isHome ? 'rgba(255,255,255,0.4)' : undefined }}>
                Dashboard
              </button>
            </Link>
            {user.role === 'seller' && (
              <Link to="/post-gig">
                <button className="btn btn-ghost btn-sm" style={{ color: isHome ? '#fff' : undefined, borderColor: isHome ? 'rgba(255,255,255,0.4)' : undefined }}>
                  Post a Gig
                </button>
              </Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin">
                <button className="btn btn-ghost btn-sm">Admin</button>
              </Link>
            )}
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--brand)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, cursor: 'pointer'
            }} onClick={() => { logout(); navigate('/') }}>
              {user.name?.slice(0,2).toUpperCase() || 'ME'}
            </div>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="btn btn-ghost btn-sm" style={{ color: isHome ? '#fff' : undefined, borderColor: isHome ? 'rgba(255,255,255,0.4)' : undefined }}>
                Sign In
              </button>
            </Link>
            <Link to="/register">
              <button className="btn btn-primary btn-sm">Join Free</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

// ── Pages (imported lazily via inline definition for simplicity) ──────────────
import Home     from './pages/Home.jsx'
import Login    from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import GigDetail from './pages/GigDetail.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PostGig  from './pages/PostGig.jsx'
import AdminPanel from './pages/AdminPanel.jsx'

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/"        element={<Home />} />
            <Route path="/login"   element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/gig/:id" element={<GigDetail />} />
            <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
            <Route path="/post-gig"  element={<Protected role="seller"><PostGig /></Protected>} />
            <Route path="/admin"     element={<Protected role="admin"><AdminPanel /></Protected>} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}
