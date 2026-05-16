import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import { useAuth, useToast } from '../App.jsx'
import { LayoutDashboard, Users, Briefcase, ShoppingBag, LogOut, Shield, Menu, X } from 'lucide-react'

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview'  },
  { to: '/admin/users',     icon: Users,           label: 'Users'     },
  { to: '/admin/gigs',      icon: Briefcase,       label: 'Gigs'      },
  { to: '/admin/orders',    icon: ShoppingBag,     label: 'Orders'    },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const toast   = useToast()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />

  function handleLogout() {
    logout()
    toast('Logged out successfully')
    navigate('/')
  }

  return (
    <div className="portal-root">
      {open && <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 }} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#dc2626,#ef4444)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'#fff' }}>A</div>
          <span style={{ color:'#f87171' }}>Admin Portal</span>
        </div>

        <div style={{ padding:'16px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'linear-gradient(135deg,#dc2626,#ef4444)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {user.name?.slice(0,2).toUpperCase()}
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{user.name}</p>
              <p style={{ fontSize:11, color:'#f87171', fontWeight:600, display:'flex', alignItems:'center', gap:4 }}><Shield size={10}/> Administrator</p>
            </div>
          </div>
        </div>

        <div style={{ flex:1, paddingTop:8 }}>
          <p className="sidebar-section">Administration</p>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              style={({ isActive }) => isActive ? { display:'flex',alignItems:'center',gap:12,padding:'10px 16px',margin:'2px 8px',borderRadius:8,fontSize:13,fontWeight:700,background:'linear-gradient(135deg,#dc2626,#ef4444)',color:'#fff',textDecoration:'none',boxShadow:'0 4px 12px rgba(220,38,38,0.4)' } : undefined}
              className={({ isActive }) => isActive ? '' : 'sidebar-item'}
              onClick={() => setOpen(false)}
            >
              <Icon size={16}/> {label}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="sidebar-item" style={{ width:'100%', border:'none', background:'none', color:'var(--danger)' }}>
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </aside>

      <div className="portal-content">
        <div className="portal-header">
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setOpen(!open)} style={{ display:'none', background:'none', border:'none', color:'var(--text)', padding:4 }} className="sidebar-toggle">
              {open ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <div style={{ display:'flex', flexDirection:'column' }}>
              <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>
                Welcome back, <span style={{ color:'#f87171' }}>{user.name?.split(' ')[0]}</span> 👋
              </span>
              <span style={{ fontSize:11, color:'var(--muted)' }}>Admin Control Panel</span>
            </div>
          </div>
          <span style={{ fontSize:12, background:'rgba(220,38,38,0.15)', color:'#f87171', padding:'4px 12px', borderRadius:20, fontWeight:700 }}>🔴 Admin Access</span>
        </div>
        <Outlet />
      </div>

      <style>{`@media(max-width:768px){.sidebar-toggle{display:flex !important;}}`}</style>
    </div>
  )
}
