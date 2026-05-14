import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useAuth, useToast } from '../App.jsx'
import { LayoutDashboard, ShoppingBag, MessageCircle, Heart, Settings, LogOut, Menu, X } from 'lucide-react'

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
  const [open, setOpen] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'seller') return <Navigate to="/seller/dashboard" replace />
  if (user.role === 'admin')  return <Navigate to="/admin/dashboard"  replace />

  function handleLogout() {
    logout()
    toast('Logged out successfully')
    navigate('/')
  }

  return (
    <div className="portal-root">
      {/* Mobile overlay */}
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
          {NAV.map(({ to, icon: Icon, label, badge }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`} onClick={() => setOpen(false)}>
              <Icon size={16} />
              {label}
              {badge && <span className="sidebar-badge">{badge}</span>}
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
        {/* Portal top bar */}
        <div className="portal-header">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setOpen(!open)} style={{ display:'none', background:'none', border:'none', color:'var(--text)', padding:4 }} className="sidebar-toggle">
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <span style={{ fontSize:13, color:'var(--muted)' }}>Welcome back, <strong style={{color:'var(--text)'}}>{user.name?.split(' ')[0]}</strong> 👋</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => navigate('/')} className="btn btn-surface btn-sm">🏠 Browse Gigs</button>
            <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--brand),#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>
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
