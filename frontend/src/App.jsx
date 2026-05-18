import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { LogOut, User, LayoutDashboard, Settings } from 'lucide-react'
import './styles/global.css'

// ── API ───────────────────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_URL || ''
export const api = axios.create({ baseURL: BASE, timeout: 90000 })
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('fh_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

// ── Image Helper ──────────────────────────────────────────────────────────────
export function getGigImage(gig) {
  if (gig.img && !gig.img.includes('unsplash.com') && !gig.img.includes('picsum.photos')) return gig.img;
  
  const idStr = String(gig.id || '1');
  let idNum = 0;
  for(let i=0; i<idStr.length; i++) idNum += idStr.charCodeAt(i);
  
  const c = (gig.category || 'Development').toLowerCase();
  
  const imgs = {
    development: [
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=400&q=80',
    ],
    design: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1509343256512-d77a5cb3791b?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
    ],
    writing: [
      'https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1516414447565-b14be0adf13e?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1456406644174-8ddd4cd52a06?auto=format&fit=crop&w=400&q=80',
    ],
    marketing: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1533750516457-a7f992034fec?auto=format&fit=crop&w=400&q=80',
    ]
  };
  
  let list = imgs[c] || imgs.development;
  return list[idNum % list.length];
}


// ── Server Status Context ─────────────────────────────────────────────────────
const ServerCtx = createContext({ status: 'unknown' })
export function useServerStatus() { return useContext(ServerCtx) }

function ServerStatusProvider({ children }) {
  // 'checking' | 'warming' | 'ready' | 'unknown'
  const [status, setStatus] = useState('checking')
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Quick probe — if it doesn't respond in 3s, server is cold-starting
    const quickProbe = axios.create({ baseURL: BASE, timeout: 3000 })
    quickProbe.get('/api/auth/me/').then(() => {
      setStatus('ready')
    }).catch((err) => {
      if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || (err.response?.status !== 401 && err.response?.status !== 403)) {
        // Server didn't respond quickly — it's cold-starting
        setStatus('warming')
        // Now do a real probe with full timeout to know when it's ready
        api.get('/api/auth/me/').then(() => {
          setStatus('ready')
        }).catch(() => {
          setStatus('ready') // Even if auth fails, server is up
        })
      } else {
        // Got a 401/403 = server is up, just not authenticated
        setStatus('ready')
      }
    })
  }, [])

  const showBanner = (status === 'checking' || status === 'warming') && !dismissed

  return (
    <ServerCtx.Provider value={{ status }}>
      {children}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
              background: 'linear-gradient(90deg, #f59e0b, #d97706)',
              color: '#fff', padding: '10px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 14, fontWeight: 600, boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, animation: 'spin 1.5s linear infinite', display: 'inline-block' }}>⏳</span>
              <span>
                {status === 'checking' ? 'Connecting to server…' : '🥶 Server is waking up — this takes ~30 seconds on first visit. Please wait…'}
              </span>
            </div>
            <button
              onClick={() => setDismissed(true)}
              style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: '#fff', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ServerCtx.Provider>
  )
}

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
  const { theme } = useTheme()
  const navigate = useNavigate()
  const loc = useLocation()
  // Only use transparent/white-text style on the home page when in DARK mode.
  // In light mode the hero is near-white, so white text would be invisible.
  const isHome = loc.pathname === '/' && theme === 'dark'
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [loc.pathname])

  const textColor = isHome ? '#fff' : 'var(--text)'
  const mutedColor = isHome ? 'rgba(255,255,255,0.75)' : 'var(--muted)'
  const borderColor = isHome ? 'rgba(255,255,255,0.3)' : 'var(--border)'

  const dashPath = user?.role === 'seller' ? '/seller/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'

  const NavLinks = ({ mobile }) => (
    <>
      {user ? (
        <>
          <Link to="/browse" onClick={() => setMenuOpen(false)}>
            <button className={mobile ? 'btn btn-ghost' : 'btn btn-ghost btn-sm'} style={{
              ...(isHome && !mobile ? { color: '#fff', borderColor } : {}),
              width: mobile ? '100%' : undefined
            }}>Browse</button>
          </Link>
          <Link to={dashPath} onClick={() => setMenuOpen(false)}>
            <button className={mobile ? 'btn btn-ghost' : 'btn btn-ghost btn-sm'} style={{
              ...(isHome && !mobile ? { color: '#fff', borderColor } : {}),
              width: mobile ? '100%' : undefined
            }}>Dashboard</button>
          </Link>
          {/* Dynamic Profile Dropdown */}
          <div style={{ position: 'relative' }} onMouseEnter={() => setProfileOpen(true)} onMouseLeave={() => setProfileOpen(false)}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: user.avatar ? `url(${user.avatar}) center/cover` : 'var(--brand)', 
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', flexShrink: 0, 
              border: '2px solid ' + (isHome ? 'rgba(255,255,255,0.4)' : 'var(--border)'),
              transition: 'border-color 0.2s'
            }} onClick={() => { setMenuOpen(false); navigate(`/profile/${user.id || 'me'}`) }} title={`${user.name} — View Profile`}>
              {!user.avatar && (user.name?.slice(0,2).toUpperCase() || 'ME')}
            </div>
            
            <AnimatePresence>
              {profileOpen && !mobile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute', top: '100%', right: 0, paddingTop: 8, zIndex: 200
                  }}
                >
                  <div style={{
                    width: 240, background: 'var(--card)', borderRadius: 12, border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-md)', overflow: 'hidden'
                  }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{user.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{user.email}</p>
                      <div className="badge badge-purple" style={{ marginTop: 8 }}>{user.role}</div>
                    </div>
                    <div style={{ padding: 8 }}>
                      <div className="dropdown-item" onClick={() => navigate(`/profile/${user.id || 'me'}`)}><User size={16}/> My Profile</div>
                      <div className="dropdown-item" onClick={() => navigate(dashPath)}><LayoutDashboard size={16}/> Dashboard</div>
                      <div className="dropdown-item" style={{ color: 'var(--danger)' }} onClick={() => { logout(); navigate('/') }}><LogOut size={16}/> Sign Out</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
          {[['Browse','/browse'],['Categories','/categories'],['Find Talent','/sellers'],['How it Works','/how-it-works'],['About','/about']].map(([label, path]) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)}>
              <button className={mobile ? 'btn btn-ghost' : 'btn btn-ghost btn-sm'} style={{
                ...(isHome && !mobile ? { color: '#fff', borderColor } : {}),
                width: mobile ? '100%' : undefined
              }}>{label}</button>
            </Link>
          ))}
          <Link to="/login" onClick={() => setMenuOpen(false)}>
            <button className={mobile ? 'btn btn-ghost' : 'btn btn-ghost btn-sm'} style={{
              ...(isHome && !mobile ? { color: '#fff', borderColor } : {}),
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
      <div className="app-nav" style={{
        background: isHome ? 'transparent' : 'var(--nav-bg)',
        borderBottom: isHome ? 'none' : '1px solid var(--border)',
        justifyContent: 'space-between',
        position: isHome ? 'absolute' : 'fixed',
        backdropFilter: isHome ? 'none' : 'blur(16px)',
        WebkitBackdropFilter: isHome ? 'none' : 'blur(16px)',
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
        <div className="mobile-actions" style={{ display: 'none', alignItems: 'center', gap: 10 }}>
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
      </div>

      {/* Mobile dropdown */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <NavLinks mobile />
      </div>
    </>
  )
}

// ── Pages ─────────────────────────────────────────────────────────────────────
import Home        from './pages/Home.jsx'
import Browse      from './pages/Browse.jsx'
import Categories  from './pages/Categories.jsx'
import Sellers     from './pages/Sellers.jsx'
import About       from './pages/About.jsx'
import HowItWorks  from './pages/HowItWorks.jsx'
import Login       from './pages/Login.jsx'
import Register    from './pages/Register.jsx'
import GigDetail   from './pages/GigDetail.jsx'
import UserProfile from './pages/UserProfile.jsx'

// Layouts
import ClientLayout from './layouts/ClientLayout.jsx'
import SellerLayout from './layouts/SellerLayout.jsx'
import AdminLayout  from './layouts/AdminLayout.jsx'

// Client pages
import ClientDashboard  from './pages/client/Dashboard.jsx'
import ClientOrders     from './pages/client/Orders.jsx'
import ClientMessages   from './pages/client/Messages.jsx'
import ClientFavourites from './pages/client/Favourites.jsx'
import ClientSettings   from './pages/client/Settings.jsx'

// Seller pages
import SellerDashboard from './pages/seller/Dashboard.jsx'
import SellerGigs      from './pages/seller/Gigs.jsx'
import SellerPostGig   from './pages/seller/PostGig.jsx'
import SellerOrders    from './pages/seller/Orders.jsx'
import SellerEarnings  from './pages/seller/Earnings.jsx'
import SellerMessages  from './pages/seller/Messages.jsx'
import SellerSettings  from './pages/seller/Settings.jsx'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard.jsx'
import AdminUsers     from './pages/admin/Users.jsx'
import AdminGigs      from './pages/admin/Gigs.jsx'
import AdminOrders    from './pages/admin/Orders.jsx'

// ── Chat Widget ───────────────────────────────────────────────────────────────
const SUPPORT_REPLIES = [
  "Thanks for reaching out! I'm looking into that for you right now. 🔍",
  "Great question! Could you share a bit more detail so I can help you better?",
  "I understand. Let me check that for you — this usually takes just a moment.",
  "I've escalated this to our team. You'll receive an email update within 24 hours. ✅",
  "Happy to help! Here's what I'd suggest: visit your dashboard for real-time updates, or reply here if you need more assistance.",
  "That's been noted. Is there anything else I can help you with today? 😊",
]


function ChatWidget() {
  const { user } = useAuth()
  const loc      = useLocation()
  const [open, setOpen]   = useState(false)
  const [msgs, setMsgs]   = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const replyIdx = useRef(0)

  // Hide on messages pages (avoid collision with send button)
  const isMessagesPage = loc.pathname.includes('/messages')
  if (!user || isMessagesPage) return null

  const handleSend = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = input.trim()
    setMsgs(p => [...p, { text: userMsg, isUser: true }])
    setInput('')
    setTyping(true)
    const delay = 800 + Math.random() * 600
    try {
      const res = await api.post('/api/support/chat/', { message: userMsg })
      setTimeout(() => {
        setTyping(false)
        setMsgs(p => [...p, { text: res.data.reply, isUser: false }])
      }, delay)
    } catch {
      setTimeout(() => {
        const reply = SUPPORT_REPLIES[replyIdx.current % SUPPORT_REPLIES.length]
        replyIdx.current += 1
        setTyping(false)
        setMsgs(p => [...p, { text: reply, isUser: false }])
      }, delay)
    }
  }

  return (
    <>
      <div
        onClick={() => setOpen(!open)}
        style={{
          position:'fixed', bottom:24, right:24, width:56, height:56, borderRadius:'50%',
          background:'var(--brand)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 10px 24px rgba(99,102,241,0.4)', cursor:'pointer', zIndex:1000,
          fontSize:24, transition:'transform 0.2s'
        }}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
      >
        {open ? '✕' : '💬'}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:20, scale:0.9 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:20, scale:0.9 }}
            transition={{ duration:0.2 }}
            style={{
              position:'fixed', bottom:90, right:24, width:340, height:460,
              background:'var(--card)', borderRadius:16, border:'1px solid var(--border)',
              boxShadow:'0 24px 48px rgba(0,0,0,0.2)', zIndex:1000,
              display:'flex', flexDirection:'column', overflow:'hidden'
            }}
          >
            {/* Header */}
            <div style={{ background:'linear-gradient(135deg,var(--brand),var(--brand-d))', padding:'14px 16px', color:'#fff', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ position:'relative' }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13 }}>FH</div>
                <div style={{ position:'absolute', bottom:0, right:0, width:11, height:11, background:'#22c55e', borderRadius:'50%', border:'2px solid var(--brand-d)' }}/>
              </div>
              <div>
                <p style={{ fontWeight:700, fontSize:14, marginBottom:1 }}>Support Team</p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.8)' }}>Typically replies within minutes</p>
              </div>
            </div>
            {/* Body */}
            <div style={{ flex:1, padding:14, background:'var(--bg)', overflowY:'auto', display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ textAlign:'center', fontSize:11, color:'var(--muted)', margin:'4px 0' }}>Today</div>
              <div style={{ background:'var(--card)', padding:'10px 13px', borderRadius:'12px 12px 12px 3px', border:'1px solid var(--border)', alignSelf:'flex-start', maxWidth:'85%', fontSize:13, color:'var(--text)' }}>
                Hi {user.name?.split(' ')[0]}! 👋 How can we help you today?
              </div>
              {msgs.map((m, i) => (
                <div key={i} style={{
                  background: m.isUser ? 'var(--brand)' : 'var(--card)',
                  color: m.isUser ? '#fff' : 'var(--text)',
                  padding:'10px 13px',
                  borderRadius: m.isUser ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                  border: m.isUser ? 'none' : '1px solid var(--border)',
                  alignSelf: m.isUser ? 'flex-end' : 'flex-start',
                  maxWidth:'85%', fontSize:13,
                }}>
                  {m.text}
                </div>
              ))}
              {typing && (
                <div style={{ background:'var(--card)', padding:'10px 14px', borderRadius:'12px 12px 12px 3px', border:'1px solid var(--border)', alignSelf:'flex-start', fontSize:13, color:'var(--muted)' }}>
                  <span style={{ letterSpacing: 2 }}>● ● ●</span>
                </div>
              )}
            </div>
            {/* Input */}
            <form onSubmit={handleSend} style={{ padding:'12px 14px', borderTop:'1px solid var(--border)', background:'var(--card)', display:'flex', gap:8 }}>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                placeholder="Type a message..."
                style={{ flex:1, padding:'9px 14px', borderRadius:20, border:'1px solid var(--border)', outline:'none', background:'var(--input-bg)', color:'var(--text)', fontSize:13 }}
              />
              <button type="submit" disabled={!input.trim()} style={{ width:36, height:36, borderRadius:'50%', background: input.trim() ? 'var(--brand)' : 'var(--border)', color:'#fff', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor: input.trim() ? 'pointer' : 'default', flexShrink:0 }}>
                <span style={{fontSize:14}}>➤</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Role-aware Dashboard Redirect ─────────────────────────────────────────────
function DashboardRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'seller') return <Navigate to="/seller/dashboard" replace />
  if (user.role === 'admin')  return <Navigate to="/admin/dashboard"  replace />
  return <Navigate to="/client/dashboard" replace />
}

// ── Page Transitions Wrapper ──────────────────────────────────────────────────
function AnimatedRoutes() {
  const loc = useLocation()
  const isPortal = loc.pathname.startsWith('/client/') || loc.pathname === '/client' ||
                   loc.pathname.startsWith('/seller/') || loc.pathname === '/seller' ||
                   loc.pathname.startsWith('/admin/')  || loc.pathname === '/admin'
  const isHome   = loc.pathname === '/'

  // Portal pages: render layout directly — NO wrapper div, NO navbar
  if (isPortal) {
    return (
      <Routes location={loc}>
        {/* ── Client portal ── */}
        <Route path="/client" element={<ClientLayout />}>
          <Route index            element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="orders"    element={<ClientOrders />} />
          <Route path="messages"  element={<ClientMessages />} />
          <Route path="favourites"element={<ClientFavourites />} />
          <Route path="settings"  element={<ClientSettings />} />
        </Route>

        {/* ── Seller portal ── */}
        <Route path="/seller" element={<SellerLayout />}>
          <Route index            element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="gigs"      element={<SellerGigs />} />
          <Route path="gigs/new"  element={<SellerPostGig />} />
          <Route path="orders"    element={<SellerOrders />} />
          <Route path="earnings"  element={<SellerEarnings />} />
          <Route path="messages"  element={<SellerMessages />} />
          <Route path="settings"  element={<SellerSettings />} />
        </Route>

        {/* ── Admin portal ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index            element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="gigs"      element={<AdminGigs />} />
          <Route path="orders"    element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

  // Public pages: show navbar + optional top padding
  const needsNavOffset = !isHome
  return (
    <>
      <Navbar />
      <div style={needsNavOffset ? { paddingTop: 64 } : {}}>
        <AnimatePresence mode="wait">
          <Routes location={loc} key={loc.pathname}>
            <Route path="/"           element={<motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}}><Home /></motion.div>} />
            <Route path="/browse"     element={<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Browse /></motion.div>} />
            <Route path="/categories" element={<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Categories /></motion.div>} />
            <Route path="/sellers"    element={<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Sellers /></motion.div>} />
            <Route path="/about"      element={<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><About /></motion.div>} />
            <Route path="/how-it-works"element={<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><HowItWorks /></motion.div>} />
            <Route path="/login"      element={<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Login /></motion.div>} />
            <Route path="/register"   element={<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Register /></motion.div>} />
            <Route path="/gig/:id"    element={<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><GigDetail /></motion.div>} />
            <Route path="/profile/:id"element={<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><UserProfile /></motion.div>} />
            <Route path="/dashboard"  element={<DashboardRedirect />} />
            <Route path="/post-gig"   element={<Navigate to="/seller/gigs/new" replace />} />
            <Route path="*"           element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ServerStatusProvider>
            <BrowserRouter>
              <AnimatedRoutes />
              <ChatWidget />
            </BrowserRouter>
          </ServerStatusProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
