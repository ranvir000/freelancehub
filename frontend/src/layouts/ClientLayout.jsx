import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useAuth, useToast, api } from '../App.jsx'
import { LayoutDashboard, ShoppingBag, MessageCircle, Heart, Settings, LogOut, Menu, X, Bell } from 'lucide-react'

const NAV = [
  { to: '/client/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/client/orders',     icon: ShoppingBag,     label: 'My Orders'  },
  { to: '/client/messages',   icon: MessageCircle,   label: 'Messages'   },
  { to: '/client/favourites', icon: Heart,           label: 'Saved Gigs' },
  { to: '/client/settings',   icon: Settings,        label: 'Settings'   },
]

export default function ClientLayout() {
  const { user, logout } = useAuth()
  const toast   = useToast()
  const navigate = useNavigate()
  const [open, setOpen]         = useState(false)
  const [unread, setUnread]     = useState(0)
  const [showNotif, setShowNotif] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'seller') return <Navigate to="/seller/dashboard" replace />
  if (user.role === 'admin')  return <Navigate to="/admin/dashboard"  replace />

  // ── Poll unread message count every 30s ─────────────────────────────────────
  useEffect(() => {
    function fetchUnread() {
      api.get('/api/messages/unread/').then(r => setUnread(r.data.count || 0)).catch(() => {})
    }
    fetchUnread()
    const id = setInterval(fetchUnread, 30000)
    return () => clearInterval(id)
  }, [])

  function handleLogout() {
    logout()
    toast('Logged out successfully')
    navigate('/')
  }

  return (
    <div className="portal-root">
      {open && <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 }} />}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ width:28, height:28, borderRadius:8, background:'var(--brand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'#fff' }}>F</div>
          <span>Client Portal</span>
        </div>

        {/* User info */}
        <div style={{ padding:'16px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {user.name?.slice(0,2).toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</p>
              <p style={{ fontSize:11, color:'var(--brand)', fontWeight:600 }}>Client Account</p>
            </div>
          </div>
        </div>

        <div style={{ flex:1, paddingTop:8 }}>
          <p className="sidebar-section">Main Menu</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
              <Icon size={16} />
              {label}
              {/* Unread badge on Messages nav item */}
              {label === 'Messages' && unread > 0 && (
                <span style={{ marginLeft:'auto', background:'var(--brand)', color:'#fff', borderRadius:10, padding:'1px 7px', fontSize:10, fontWeight:700 }}>{unread}</span>
              )}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-item" style={{ width:'100%', border:'none', background:'none', color:'var(--danger)' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="portal-content">
        {/* Sticky portal top bar */}
        <div className="portal-header">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setOpen(!open)} style={{ display:'none', background:'none', border:'none', color:'var(--text)', padding:4 }} className="sidebar-toggle">
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>
                Welcome back, <span style={{ color:'var(--brand)' }}>{user.name?.split(' ')[0]}</span> 👋
              </span>
              <span style={{ fontSize:11, color:'var(--muted)' }}>Client Portal</span>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => navigate('/browse')} className="btn btn-surface btn-sm">🔍 Browse Gigs</button>

            {/* Notification Bell */}
            <div style={{ position:'relative' }}>
              <button
                onClick={() => { navigate('/client/messages'); setUnread(0) }}
                title={unread > 0 ? `${unread} unread messages` : 'Messages'}
                style={{ position:'relative', width:36, height:36, borderRadius:10, background:'var(--surface)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text2)' }}
              >
                <Bell size={16} />
                {unread > 0 && (
                  <span style={{ position:'absolute', top:-4, right:-4, background:'#ef4444', color:'#fff', borderRadius:10, padding:'1px 5px', fontSize:9, fontWeight:700, minWidth:16, textAlign:'center' }}>
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </button>
            </div>

            {/* Avatar */}
            <div onClick={() => navigate('/client/settings')} style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff', cursor:'pointer', flexShrink:0 }} title={user.name}>
              {user.name?.slice(0,2).toUpperCase()}
            </div>
          </div>
        </div>
        <Outlet />
      </div>

      <style>{`
        @media(max-width:768px) {
          .sidebar-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
