import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import './styles/global.css'

// ── API ───────────────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || ''
export const api = axios.create({ baseURL: BASE })
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('fh_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

// ── Theme Context ─────────────────────────────────────────────────────────────
const ThemeCtx = createContext(null)
export function useTheme() { return useContext(ThemeCtx) }

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('fh_theme') || 'light')
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('fh_theme', theme)
  }, [theme])
  const toggle = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), [])
  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

// ── Auth Context ──────────────────────────────────────────────────────────────
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

// ── Theme Toggle Button ───────────────────────────────────────────────────────
function ThemeToggle({ isHome }) {
  const { theme, toggle } = useTheme()
  return (
    <button onClick={toggle} style={{
      background: isHome ? 'rgba(255,255,255,0.15)' : 'var(--card)',
      border: '1.5px solid ' + (isHome ? 'rgba(255,255,255,0.3)' : 'var(--border)'),
      borderRadius: 8, padding: '6px 10px', fontSize: 16, cursor: 'pointer',
      color: isHome ? '#fff' : 'var(--text)', transition: 'all 0.15s',
      display: 'flex', alignItems: 'center'
    }}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()
  const isHome = loc.pathname === '/'
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [loc.pathname])

  const textColor = isHome ? '#fff' : 'var(--text)'
  const mutedColor = isHome ? 'rgba(255,255,255,0.75)' : 'var(--muted)'
  const borderColor = isHome ? 'rgba(255,255,255,0.3)' : 'var(--border)'

  const NavLinks = ({ mobile }) => (
    <>
      {user ? (
        <>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
            <button className={mobile ? 'btn btn-ghost' : 'btn btn-ghost btn-sm'} style={{
              color: mobile ? 'var(--text)' : mutedColor,
              borderColor: mobile ? 'var(--border)' : borderColor,
              width: mobile ? '100%' : undefined
            }}>Dashboard</button>
          </Link>
          {user.role === 'seller' && (
            <Link to="/post-gig" onClick={() => setMenuOpen(false)}>
              <button className={mobile ? 'btn btn-ghost' : 'btn btn-ghost btn-sm'} style={{
                color: mobile ? 'var(--text)' : mutedColor,
                borderColor: mobile ? 'var(--border)' : borderColor,
                width: mobile ? '100%' : undefined
              }}>Post a Gig</button>
            </Link>
          )}
          {user.role === 'admin' && (
            <Link to="/admin" onClick={() => setMenuOpen(false)}>
              <button className={mobile ? 'btn btn-ghost' : 'btn btn-ghost btn-sm'} style={{
                width: mobile ? '100%' : undefined
              }}>Admin</button>
            </Link>
          )}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--brand)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            flexShrink: 0, border: '2px solid ' + (isHome ? 'rgba(255,255,255,0.4)' : 'var(--border)')
          }} onClick={() => { setMenuOpen(false); navigate(`/profile/${user.id || 'me'}`) }}
            title={`${user.name} — View Profile`}>
            {user.name?.slice(0,2).toUpperCase() || 'ME'}
          </div>
          {mobile && (
            <button className="btn btn-danger btn-sm" style={{ width: '100%' }}
              onClick={() => { logout(); navigate('/'); setMenuOpen(false) }}>
              Sign Out
            </button>
          )}
        </>
      ) : (
        <>
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            <button className={mobile ? 'btn btn-ghost' : 'btn btn-ghost btn-sm'} style={{
              color: mobile ? 'var(--text)' : mutedColor,
              borderColor: mobile ? 'var(--border)' : borderColor,
              width: mobile ? '100%' : undefined
            }}>Sign In</button>
          </Link>
          <Link to="/register" onClick={() => setMenuOpen(false)}>
            <button className={mobile ? 'btn btn-primary' : 'btn btn-primary btn-sm'}
              style={{ width: mobile ? '100%' : undefined }}>Join Free</button>
          </Link>
        </>
      )}
    </>
  )

  return (
    <>
      <nav style={{
        background: isHome ? 'transparent' : 'var(--nav-bg)',
        borderBottom: isHome ? 'none' : '1px solid var(--border)',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: isHome ? 'absolute' : 'sticky',
        top: 0, left: 0, right: 0, zIndex: 100,
      }}>
        <Link to="/" style={{ fontSize: 20, fontWeight: 800, color: isHome ? '#fff' : 'var(--brand)' }}>
          Freelance<span style={{ color: isHome ? '#a5b4fc' : 'var(--brand-d)' }}>Hub</span>
        </Link>

        {/* Desktop links */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle isHome={isHome} />
          <NavLinks />
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="mobile-actions" style={{ alignItems: 'center', gap: 10 }}>
          <ThemeToggle isHome={isHome} />
          <button
            className={`hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            style={{ color: isHome ? '#fff' : 'var(--text)' }}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <NavLinks mobile />
      </div>
    </>
  )
}

// ── Pages ─────────────────────────────────────────────────────────────────────
import Home      from './pages/Home.jsx'
import Login     from './pages/Login.jsx'
import Register  from './pages/Register.jsx'
import GigDetail from './pages/GigDetail.jsx'
import Dashboard from './pages/Dashboard.jsx'
import PostGig   from './pages/PostGig.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import UserProfile from './pages/UserProfile.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/"           element={<Home />} />
              <Route path="/login"      element={<Login />} />
              <Route path="/register"   element={<Register />} />
              <Route path="/gig/:id"    element={<GigDetail />} />
              <Route path="/profile/:id" element={<UserProfile />} />
              <Route path="/dashboard"  element={<Protected><Dashboard /></Protected>} />
              <Route path="/post-gig"   element={<Protected role="seller"><PostGig /></Protected>} />
              <Route path="/admin"      element={<Protected role="admin"><AdminPanel /></Protected>} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
